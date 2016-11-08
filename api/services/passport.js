var passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  bcrypt = require('bcrypt');

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Users.findById(id, function(err, user) {
      done(err, user);
  });
});

passport.use(new LocalStrategy({
    usernameField: 'userName',
    passwordField: 'password'
  },
  function(email, password, done) {
    Users.findOne({ userName: email }).exec(function(err, user) {
      if(err) { return done(err); }
      if(!user) { return done(null, false, { message: 'Unknown user ' + email }); }
      bcrypt.compare(password, user.password, function(err, res) {
        if(!res) return done(null, false, {message: 'Invalid Password'});
        return done(null, user);
      });
    });
  }
));
