// app.js

// BASE SETUP
// =============================================================================

var express      = require('express'),
    app          = express(),
    _            = require('lodash'),
    bodyParser   = require('body-parser'),
    Busboy       = require('busboy'),
    fs           = require('fs'),
    mongoose     = require('mongoose'),
    passport     = require('passport'),
    flash        = require('connect-flash'),
    morgan       = require('morgan'),
    cookieParser = require('cookie-parser'),
    session      = require('express-session'),
    configDB     = require('./config/database.js'),
    MongoStore   = require('connect-mongostore')(session);


// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

// required for passport

app.use(session({
  secret: 'ilovepornsomuch',
  store: new MongoStore({
    'db': 'pomboapp',
    'url' : configDB.url
  })
})); // session secret

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'))
app.use(function (req, res, next) {
  res.locals.loggedIn = req.isAuthenticated();
  next();
});

// routes ======================================================================
require('./config/passport')(passport); // pass passport for configuration
require('./app/routes.js')(app, express, passport, fs, Busboy, _); // load our routes and pass in our app and fully configured passport

var port =  process.env.OPENSHIFT_NODEJS_PORT || 8080;
var ipaddress = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

// START THE SERVER
// =============================================================================
app.listen(port, ipaddress, function(){
  console.log('Magic happens on port ' + port);
});
