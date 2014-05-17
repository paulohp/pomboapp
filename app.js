// app.js

// BASE SETUP
// =============================================================================

var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');

// this will let us get the data from a POST
app.use(bodyParser());

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'))
app.use(express.multipart({ uploadDir: __dirname + '/uploads', limit: '50mb' }));

var port = process.env.PORT || 8080;    // set our port


var router = express.Router();

router.get('/', function(req, res) {
  res.render('index')
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);