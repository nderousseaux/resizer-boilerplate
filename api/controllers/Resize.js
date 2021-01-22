const Queue = require('bull');
const sharp = require('sharp');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.S3_KEY,
    secretAccessKey: process.env.S3_SECRET
});


const imageQueue = new Queue('image resize', process.env.REDIS_URL);
module.exports.imageQueue = imageQueue;

imageQueue.process((job, done) => {
    var SkipperDisk = require('skipper-s3');
    var fileAdapter = SkipperDisk({
      key: process.env.S3_KEY,
      secret: process.env.S3_SECRET,
      bucket: process.env.S3_BUCKET,
    });
 
    let buffArray = [];
    fileAdapter.read(job.data.img)
      .on('error', (err) => {
        return res.serverError(err);
      })
      .on('data', (d) => { buffArray.push(d); })
      .on('end', () => {
        let buffer = Buffer.concat(buffArray);
 
        let img320 = resize(buffer, [320, 240]);

 
        Promise.all([
          upload(img320, 320),
        ]).then(() => {
          done();
        });
      });
  });
 
  function resize(buffer, size) {
    return sharp(buffer)
      .resize(size[0], size[1])
      .jpeg()
      .toBuffer();
  }
 
  function upload(file, size) {
    return new Promise((resolve, reject) => {
      const params = {
        Bucket: process.env.S3_BUCKET,
        Key: `/${process.env.S3_FOLDER}/${Date.now()}-${__newFileStream.filename}`, // File name you want to save as in S3
        Body: file
      };
 
      // Uploading files to the bucket
      s3.upload(params, (err,) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }
 