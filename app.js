// app.js

// BASE SETUP
// =============================================================================

var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var multiparty = require('multiparty');
var fs         = require('fs');

// this will let us get the data from a POST
app.use(bodyParser());

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'))

var port = process.env.PORT || 8080;    // set our port


var router = express.Router();

router.get('/', function(req, res) {
  fs.readdir(__dirname+'/uploads', function(err, files){
    if (err) throw err;
    res.render('index', {
      files: files
    });
  })
});

router.post('/upload', function(req, res) {
  var form = new multiparty.Form({autoFiles: true, uploadDir: __dirname+'/uploads'});

  form.parse(req, function(err, fields, files) {
    console.log(files);
    res.send(200)
    // if (err) {
    //   res.writeHead(400, {'content-type': 'text/plain'});
    //   res.end("invalid request: " + err.message);
    //   return;
    // }
    // res.writeHead(200, {'content-type': 'text/plain'});
    // res.write('received fields:\n\n '+util.inspect(fields));
    // res.write('\n\n');
    // res.end('received files:\n\n '+util.inspect(files));
  });
})

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);