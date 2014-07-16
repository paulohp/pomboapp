var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// define the schema for our user model
var fileSchema = mongoose.Schema({

    file_name             : String,
    size                  : Number,
    type                  : String,
    user                  :   { type: ObjectId, ref: 'User'},

});

// create the model for users and expose it to our app
module.exports = mongoose.model('File', fileSchema);
