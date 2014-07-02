module.exports = function(app, express, passport, fs, multiparty, _){
  var rsa    = require('rsa-stream');      
  var router = express.Router();
  var path   = require('path');

  router.get('/', function(req, res) {
    res.render('index')
  });

  router.post('/upload', function(req, res) {
    var pubkey       = req.user.keys.public_key;
    var encStream    = rsa.encrypt(pubkey);
    var form = new multiparty.Form({autoFiles: true, uploadDir: '../data/'+req.user._id+'/originals'});
    form.parse(req, function(err, fields, files) {
      if (err) throw err;
      _.map(files, function(file){
        _.each(file, function(f){
          var inStream = fs.createReadStream(f.path);
          var outStream  = fs.createWriteStream('../data/'+req.user._id+'/encrypted/'+f.originalFilename+'.enc');
          inStream.pipe(encStream).pipe(outStream);
        })
      })
      res.send(200)
    });
  });

  router.get('/download/:name', function(req, res){
    var file ='../data/'+req.user._id+'/encrypted/'+req.params.name+'.enc';
    file = path.resolve(__dirname, file);
    res.download(file,  function(err){
      if (err) throw new Error(err);
    });
  });

  // show the login form
  router.get('/login', function(req, res) {
    // render the page and pass in any flash data if it exists
    res.render('user/login', { message: req.flash('loginMessage') });
  });

  // process the login form
  // app.post('/login', do all our passport stuff here);
  app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  // show the signup form
  router.get('/signup', function(req, res) {
    // render the page and pass in any flash data if it exists
    res.render('user/signup', { message: req.flash('signupMessage') });
  });


  router.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));


  router.get('/profile', isLoggedIn, function(req, res) {
    res.render('user/profile', {
      user : req.user // get the user out of session and pass to template
    });
  });

  router.get('/files', isLoggedIn, function(req, res) {
    fs.readdir('../data/'+req.user._id+'/originals', function(err, files){
      if (err) throw err;
      res.render('user/files', {
        files: files
      });
    })
  });


  router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  app.use('/', router);
};


function isLoggedIn(req, res, next) {

  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}
