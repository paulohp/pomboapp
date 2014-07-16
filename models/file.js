var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;
var Promise   = require('bluebird');
var mbUtils   = require('mongoose-bluebird-utils');
var _         = require('lodash');

// define the schema for our user model
var fileSchema = mongoose.Schema({

    file_name             : String,
    size                  : Number,
    type                  : String,
    user                  :   { type: ObjectId, ref: 'User'},

});

fileSchema.methods.getUsedStorage = function(user) {
  var aggregation = mongoose.model('File')
    .aggregate({$match: {user: user._id}},
               {$group: {_id: {}, total_storage: {$sum: '$size'}}});

  return mbUtils.execP(aggregation).then(function(r) {
    var f = _.first(r);
    return f && f.total_storage;
  });
};

// create the model for users and expose it to our app
module.exports = mongoose.model('File', fileSchema);
