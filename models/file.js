var mongoose = require('mongoose');

// define the schema for our user model
var fileSchema = mongoose.Schema({

    file_name             : String,
    size                  : Number,
    type                  : String

});

// create the model for users and expose it to our app
module.exports = mongoose.model('File', fileSchema);
