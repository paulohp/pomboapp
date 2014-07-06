var mongoose = require('mongoose');

// define the schema for our user model
var inviteSchema = mongoose.Schema({
  email : String
});

module.exports = mongoose.model('Invite', inviteSchema);
