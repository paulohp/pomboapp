module.exports = function(app, express, passport, fs){
  var router = express.Router();

  router.get('/', function(req, res) {
    fs.readdir('./uploads', function(err, files){
      if (err) throw err;
      res.render('index', {
        files: files
      });
    })
  });

  router.post('/upload', function(req, res) {
    var form = new multiparty.Form({autoFiles: true, uploadDir: __dirname+'/uploads'});
    form.parse(req, function(err, fields, files) {
      if (err) throw err;
      _.map(files, function(file){
        _.each(file, function(f){
          var inStream = fs.createReadStream(f.path);
          var outStream  = fs.createWriteStream(f.originalFilename+'.enc');
          inStream.pipe(encStream).pipe(outStream);
        })
      })
      res.send(200)
    });
  });

  router.get('/download/:name', function(req, res){
    var file = __dirname+'/uploads/'+req.params.name;
    res.download(file,  function(err){
      if (err) throw new Error(err);
    });
  });
  // REGISTER OUR ROUTES -------------------------------
  // all of our routes will be prefixed with /api
  app.use('/', router);
};