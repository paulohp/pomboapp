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
    MongoStore   = require('connect-mongostore')(session),
    server       = require('http').Server(app),
    io           = require('socket.io')(server);

mongoose.connect(configDB.url); // connect to our database

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

// required for passport
app.use(session({
  secret: 'ilovecodesomuch',
  store: new MongoStore({ db: mongoose.connections[0].db }),
  proxy: true,
  resave: true,
  saveUninitialized: true
})); // session secret


app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));
app.use(function (req, res, next) {
  res.locals.loggedIn = req.isAuthenticated();
  next();
});

require('./config/passport')(passport); // pass passport for configuration
require('./app/routes.js')(app, express, passport, fs, Busboy, _, io); // load our routes and pass in our app and fully configured passport

var port =  process.env.PORT || 8080;
server.listen(port, function(){
  console.log('Magic happens on port ' + port);
});
