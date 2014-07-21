module.exports = function(app, express, passport, fs, Busboy, _, io){
  var rsa    = require('rsa-stream');
  var router = express.Router();
  var path   = require('path');
  var fs     = require('fs');
  var Puid   = require('puid');
  var secret = require('../config/secret');
  var jwt    = require('jsonwebtoken');
  var User   = require('../models/user');
  var Invite = require('../models/invite');
  var File   = require('../models/file');

  router.get('/', function(req, res) {
    res.render('index');
  });

  router.post('/upload', function(req, res) {
    var pubkey       = req.user.keys.public_key;
    var encStream    = rsa.encrypt(pubkey);
    var busboy       = new Busboy({headers : req.headers});
    var originalDir  = path.resolve('../data/'+req.user.id+'/originals/')
    var encryptedDir = path.resolve('../data/'+req.user.id+'/encrypted/')


    // Escutamos por erros e passamos adiante
    busboy.on('error', function(err){
        next(err);
    });

    busboy.on('file', function(campo, stream, nomeArquivo, encoding, mimetype){

      fs.exists('../data/'+req.user._id+'/originals/'+nomeArquivo, function (exists) {
        if(!exists){
          var gravar = fs.createWriteStream(originalDir+'/'+nomeArquivo);
          stream.pipe(gravar);
          var inStream = fs.createReadStream(originalDir+'/'+nomeArquivo);
          var outStream  = fs.createWriteStream(encryptedDir+'/'+nomeArquivo+'.enc');
          inStream.pipe(encStream).pipe(outStream);
          io.emit('news', { name: nomeArquivo, url: encryptedDir+'/'+nomeArquivo+'.enc' });

          var file = new File({file_name: nomeArquivo, type: mimetype, user: req.user.id});
          file.save(function(err, fl){
            if (err) throw err;
            return fl;
          });

        }else{
          var puid   = new Puid(nomeArquivo);
          var aid = puid.generate();
          var gravar = fs.createWriteStream(originalDir+'/'+aid+nomeArquivo);
          stream.pipe(gravar);
          var inStream = fs.createReadStream(originalDir+'/'+aid+nomeArquivo);
          var outStream  = fs.createWriteStream(encryptedDir+'/'+aid+nomeArquivo+'.enc');
          inStream.pipe(encStream).pipe(outStream);
          io.emit('news', { name: aid+nomeArquivo, url: encryptedDir+'/'+aid+nomeArquivo+'.enc' });

          var file = new File({file_name: aid+nomeArquivo, type: mimetype, user: req.user.id});
          file.save(function(err, fl){
            if (err) throw err;
            return fl;
          });
        }
      });

      res.send(200);
    });


    busboy.on('end', function(){
      res.send('Obrigado, volte sempre.');
    });

    // Não esquecer de mandar a requisição para o Busboy
    req.pipe(busboy);

  });

  router.get('/download/:name', function(req, res){
    var file ='../data/'+req.user._id+'/encrypted/'+req.params.name+'.enc';
    file = path.resolve(file);
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

  router.post('/invite', function(req, res) {
    var invite = new Invite();
    invite.email = req.body.email;
    invite.save(function(err, invite){
      if(!err) {
        res.send(200)
      }
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

  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}
