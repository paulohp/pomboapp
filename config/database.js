// config/database.js
if (process.env.MONGODB_HOST) {
  module.exports = {
    'url' : process.env.MONGODB_URI
  };
}else{
  module.exports = {
    'url' : 'mongodb://localhost/pomboapp' // looks like mongodb://<user>:<pass>@mongo.onmodulus.net:27017/Mikha4ot
  };
}
