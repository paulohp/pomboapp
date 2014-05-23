// app.js

// BASE SETUP
// =============================================================================

var express    = require('express'),
    app        = express(),
    bodyParser = require('body-parser'),
    multiparty = require('multiparty'),
    fs         = require('fs'),
    atomic     = require('atomic-write-stream');

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
    res.send(200)
  });
});

router.get('/download/:name', function(req, res){
  var file = __dirname+'/uploads/'+req.params.name;
  res.download(file,  function(err){
    if (err) {
      throw new Error(err);
    } else {
      fs.createReadStream(file).pipe(atomicWriteStream(file));
    }
  });
});
// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
