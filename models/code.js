var mongoose = require('mongoose');

// define the schema for our user model
var codeSchema = mongoose.Schema({
  codes : []
});

module.exports = mongoose.model('Code', codeSchema);
