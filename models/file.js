var mongoose = require('mongoose');

// define the schema for our user model
var userSchema = mongoose.Schema({

    name             : String,

    limits           : {
        storage_size : {type: Number, default: 26843545600}
    },

    keys             : {
        public_key   : String,
        private_key  : String
    },

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

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
