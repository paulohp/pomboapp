// config/database.js
// if (process.env.OPENSHIFT_MONGODB_DB_HOST) {
//
// }else{
//   module.exports = {
//     'url' : 'mongodb://localhost/pomboapp' // looks like mongodb://<user>:<pass>@mongo.onmodulus.net:27017/Mikha4ot
//   };
// }


module.exports = {
  'url' : 'mongodb://admin:tbJ4WjhiFXug@' + process.env.OPENSHIFT_MONGODB_DB_HOST + ':' + process.env.OPENSHIFT_MONGODB_DB_PORT + '/pombo'
};
