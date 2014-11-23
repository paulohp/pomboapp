// config/database.js
if (process.env.MONGODB_HOST) {
  console.log(process.env.MONGODB_HOST)
  module.exports = {
    'url' : process.env.MONGODB_URI
  };
}else{
  console.log("ERRRR")
  module.exports = {
    'url' : 'mongodb://localhost/pomboapp'
  };
}
