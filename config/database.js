// config/database.js
if (process.env.MONGODB_HOST) {
  module.exports = {
    'url' : process.env.MONGO_URL,
    'user': process.env.MONGODB_USERNAME,
    'pass': process.env.MONGODB_PASSWORD
  };
}else{
  module.exports = {
    'url' : 'mongodb://localhost/pomboapp'
  };
}
