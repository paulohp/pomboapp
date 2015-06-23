// config/passport.js
var fs        = require('fs'),
    path      = require('path'),
    _         = require('lodash'),
    NodeRSA   = require('node-rsa'),
    key       = new NodeRSA({b: 1024}),
    pubkey    = key.exportKey('public'),
    privakey  = key.exportKey('private');

// load all the things we need
var LocalStrategy  = require('passport-local').Strategy;
var User           = require('../models/user');
var gcloud         = require('gcloud');
var storage;

// From Google Compute Engine:

storage = gcloud.storage({
  projectId: 'main-aspect-584',
  keyFilename: path.resolve('./', 'key.json')
});

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
          
          User.findOne({ 'local.email' :  email }, function(err, user) {

            if (err)
              return done(err);

            if (user) {
              return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {

              var newUser            = new User();

              console.log(pubkey, privakey);

              // set the user's local credentials
              newUser.local.email    = email;
              newUser.local.password = newUser.generateHash(password);
              newUser.keys.public_key     = pubkey;
              newUser.keys.private_key    = privakey;

              // save the user
              newUser.save(function(err, user) {
                if (err){
                  throw err;
                }
                storage.createBucket(user.id, function(err, bucket) {
                  console.log(err);
                  if (err) {throw err};
                  return done(null, user);
                });


              });

            }
          });
        });

      }));
  passport.use('local-login', new LocalStrategy({

        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
      },
    function(req, email, password, done) {
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
