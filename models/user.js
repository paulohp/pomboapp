var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
    name             : String,
    limits           : {
      storage_size : {type: Number, default: 26843545600}
    },
    bucket: String,
    local            : {
      email        : String,
      password     : String,
    },
    facebook         : {
      id           : String,
      token        : String,
      email        : String,
      name         : String
    },
    twitter          : {
      id           : String,
      token        : String,
      displayName  : String,
      username     : String
    },
    google           : {
      id           : String,
      token        : String,
      email        : String,
      name         : String
    }
});

userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

userSchema.methods.comparePassword = function(password, cb) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(isMatch);
  });
};

module.exports = mongoose.model('User', userSchema);