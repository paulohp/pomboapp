// app.js

// BASE SETUP
// =============================================================================

var express      = require('express'),
    app          = express(),
    _            = require('lodash'),
    bodyParser   = require('body-parser'),
    multiparty   = require('multiparty'),
    fs           = require('fs'),
    rsa          = require('rsa-stream'),
    pubkey       = fs.readFileSync('./keys/minhaPubKey.pub', 'utf8'),
    encStream    = rsa.encrypt(pubkey),
    mongoose     = require('mongoose'),
    passport     = require('passport'),
    flash        = require('connect-flash'),
    morgan       = require('morgan'),
    cookieParser = require('cookie-parser'),
    session      = require('express-session'),
    configDB = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

// required for passport
app.use(session({ secret: 'ilovepornsomuch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'))

var port = process.env.PORT || 8080;    // set our port


// routes ======================================================================
require('./app/routes.js')(app, express, passport, fs); // load our routes and pass in our app and fully configured passport

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
