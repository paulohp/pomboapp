// config/passport.js
var fs        = require('fs'),
    _         = require('lodash'),
    NodeRSA   = require('node-rsa'),
    key       = new NodeRSA({b: 512}),
    pubkey    = key.$cache.publicPEM,
    privakey  = key.$cache.privatePEM;

// load all the things we need
var LocalStrategy  = require('passport-local').Strategy;
var User           = require('../models/user');
var Invite         = require('../models/invite');

// expose this function to our app using module.exports
module.exports = function(passport) {


    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
      done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
      User.findById(id, function(err, user) {
        done(err, user);
      });
    });


  passport.use('local-signup', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
      },
      function(req, email, password, done) {

        process.nextTick(function() {
          Invite.find({}, function(err, code){

            if (_.contains(code, req.body.code)) {
              console.log(req.body.code);
            }

            User.findOne({ 'local.email' :  email }, function(err, user) {

              if (err)
                return done(err);

              if (user) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
              } else {

                var newUser            = new User();

                // set the user's local credentials
                newUser.local.email    = email;
                newUser.local.password = newUser.generateHash(password);
                newUser.keys.public_key     = pubkey;
                newUser.keys.private_key    = privakey;

                // save the user
                newUser.save(function(err, user) {
                  if (err)
                    throw err;
                  fs.mkdir('../data/'+user._id, function(err){
                    if (err) {throw err};
                    fs.mkdirSync('../data/'+user._id+'/originals');
                    fs.mkdir('../data/'+user._id+'/encrypted', function(err){
                      if (err) {throw err};
                      return done(null, newUser);
                    });
                  });


                });

              }
            });
          });
        });

}));
// =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
      },
    function(req, email, password, done) { // callback with email and password from our form

    // find a user whose email is the same as the forms email
    // we are checking to see if the user trying to login already exists
    User.findOne({ 'local.email' :  email }, function(err, user) {
      // if there are any errors, return the error before anything else
      if (err)
        return done(err);

      // if no user is found, return the message
      if (!user)
        return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

      // if the user is found but the password is wrong
      if (!user.validPassword(password))
        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

      // all is well, return successful user
      return done(null, user);
    });

  }));

};
