const queue = require('./Resize').imageQueue;


module.exports = {
  create: function (req, res) {
    req.file('image').upload({
      // don't allow the total upload size to exceed ~10MB
      adapter: require('skipper-s3'),
      key: process.env.S3_KEY,
      secret: process.env.S3_SECRET,
      bucket: process.env.S3_BUCKET,
      maxBytes: 10000000,
      saveAs: (__newFileStream, next) => {
        return next(undefined, `/${process.env.S3_FOLDER}/${Date.now()}-${__newFileStream.filename}`);
      }


    }, async function whenDone(err, uploadedFiles) {
      if (err) {
        return res.serverError(err);
      }

      // If no files were uploaded, respond with an error.
      if (uploadedFiles.length === 0){
        return res.badRequest('No file was uploaded');
      }
      let image = await Image.create({
        name: req.body.name,
        path: uploadedFiles[0].fd,
        uploader: req.user.id
      }).fetch();

      res.statusCode = 202;
      res.send('' + image.id);

      let ope = await Operation.create({
        status: 'running',
        idImage: image.id
      }).fetch();
      queue.add({ id: ope.id, image: uploadedFiles[0].fd });
    });
  },


  /**
   * Download avatar of the user with the specified id
   *
   * (GET /user/avatar/:id)
   */
  show: function (req, res){
    Image.find({id: req.param('id')}).then(img=> {
      if (!img) {
        return res.notFound();
      }
      img = img[0];

      var SkipperDisk = require('skipper-s3');
      var fileAdapter = SkipperDisk({
        key: process.env.S3_KEY,
        secret: process.env.S3_SECRET,
        bucket: process.env.S3_BUCKET,
      });

      res.set('Content-disposition', 'attachment; filename=\'' + img.path.split('/')[img.path.split('/').length -1 ] + '\'');

      // Stream the file down
      fileAdapter.read(img.path)
      .on('error',  (err) => {
        return res.serverError(err);
      })
      .pipe(res);
    });
  }
};
