module.exports = function(app, express, passport, fs){
  var router = express.Router();

  router.get('/', function(req, res) {
    res.render('index')
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
  // =====================================
  // LOGIN ===============================
  // =====================================
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


  // =====================================
  // SIGNUP ==============================
  // =====================================
  // show the signup form
  router.get('/signup', function(req, res) {

    // render the page and pass in any flash data if it exists
    res.render('user/signup', { message: req.flash('signupMessage') });
  });

  // process the signup form
  // app.post('/signup', do all our passport stuff here);
  router.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  // =====================================
  // PROFILE SECTION =====================
  // =====================================
  // we will want this protected so you have to be logged in to visit
  // we will use route middleware to verify this (the isLoggedIn function)
  router.get('/profile', isLoggedIn, function(req, res) {
    res.render('user/profile', {
      user : req.user // get the user out of session and pass to template
    });
  });

  router.get('/files', isLoggedIn, function(req, res) {
    fs.readdir('../data/'+req.user._id, function(err, files){
      if (err) throw err;
      res.render('user/files', {
        files: files
      });
    })
  });

  // =====================================
  // LOGOUT ==============================
  // =====================================
  router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });
  // REGISTER OUR ROUTES -------------------------------
  // all of our routes will be prefixed with /api
  app.use('/', router);
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/');
}