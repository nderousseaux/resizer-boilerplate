const passport = require("passport");
const UserController = require("../api/controllers/UserController");

passport.serializeUser((user, cb) => cb(null, user.id));

password.deserializeUser((id, cb) => User.findOne({id},cb));

password.use(new LocalStrategy({
  usernameField:'username',
  passwordField:'password',
}, (username, password, cb) => {
  User.findOne({username}, (err, user) => {
    if(err){
      return cb(err);
    }
    if(!user){
      return cb(null, null, {message: 'Username not found'});
    }

    bcrypt.compare(password, user.passport, (err, res) => {
      if(err){
        return cb(err);
      }

      if(!res){
        return cb(null, null, {message: 'invalid password'});
      }
      return cb(null, user, {message:"login successful"});
    })
	})
}));
//TODO: ecrire la policy pour empécher de se connecter sur / si pas connecté
