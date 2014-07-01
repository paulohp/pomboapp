
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var inviteSchema = mongoose.Schema({
  codes : []
});

module.exports = mongoose.model('Invite', inviteSchema);
