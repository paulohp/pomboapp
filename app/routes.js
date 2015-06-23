module.exports = function(app, express, passport, fs, Busboy, _, io){
  var router = express.Router();
  var path   = require('path');
  var Puid   = require('puid');
  var secret = require('../config/secret');
  var jwt    = require('jsonwebtoken');
  var User   = require('../models/user');
  var File   = require('../models/file');
  var gcloud = require('gcloud');
  var storage;

  storage = gcloud.storage({
    projectId: 'main-aspect-584',
    keyFilename: path.resolve('./', 'key.json')
  });

  router.get('/', function(req, res) {
    res.render('index');
  });

  router.post('/upload', function(req, res) {
    var busboy       = new Busboy({headers : req.headers});
    var originalDir  = path.resolve('./tmp/');

    var bucket = storage.bucket(req.user.id);

    busboy.on('error', function(err){
        next(err);
    });

    busboy.on('file', function(campo, stream, nomeArquivo, encoding, mimetype){

      var gravar = fs.createWriteStream(originalDir+'/'+nomeArquivo);
      stream.pipe(gravar);
      var inStream = fs.createReadStream(originalDir+'/'+nomeArquivo);

      inStream.pipe(bucket.file(nomeArquivo).createWriteStream());

      var file = new File({file_name: nomeArquivo, type: mimetype, user: req.user.id});
      io.emit('news', file);
      file.save(function(err, fl){
        if (err) throw err;
        return fl;
      });
    });

    busboy.on('end', function(){
      res.send(200);
    });
    req.pipe(busboy);

  });

  router.get('/download/:name', function(req, res){
    storage.bucket(req.user._id).file(req.params.name).createReadStream().pipe(res);
  });

  router.get('/delete/:name', function(req, res){
    var file = storage.bucket(req.user._id).file(req.params.name);
    file.delete(function(err, data){
      if (err)
        throw new Error(err)
      res.sendStatus(204);
    });
  });

  router.get('/login', function(req, res) {
    res.render('user/login', { message: req.flash('loginMessage') });
  });

  app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile',
    failureRedirect : '/login',
    failureFlash : true
  }));

  router.post('/oauth',function(req, res) {
    var email = req.body.email || '';
    var password = req.body.password || '';

    if (email == '' || password == '') {
        return res.send(401);
    }

    User.findOne({'local.email': email}, function (err, user) {
      if (err) {
          console.log(err);
          return res.send(401);
      }

      user.comparePassword(password, function(isMatch) {
        if (!isMatch) {
            console.log("Attempt failed to login with " + user.username);
            return res.send(401);
        }

        var token = jwt.sign(user, secret.secretToken, { expiresInMinutes: 60 });

        return res.json({token:token});
      });

    });
  });

  router.get('/signup', function(req, res) {
    res.render('user/signup', { message: req.flash('signupMessage') });
  });


  router.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/profile',
    failureRedirect : '/signup',
    failureFlash : true
  }));


  router.get('/profile', isLoggedIn, function(req, res) {
    res.render('user/profile', {
      user : req.user
    });
  });

  router.get('/files', isLoggedIn, function(req, res) {
    File.find({user: req.user.id}, function(err, files){
      if (err) throw err;
      res.render('user/files', {
        files: files
      });
    });
  });

  router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  io.on('connection', function (socket) {
    console.log("Socket Connected");
  });

  app.use('/', router);
};

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
}
