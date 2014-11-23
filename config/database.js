// config/database.js
if (process.env.MONGODB_HOST) {
  module.exports = {
    'url' : process.env.MONGO_URL,
    'user': MONGODB_USERNAME,
    'pass': MONGODB_PASSWORD
  };
}else{
  module.exports = {
    'url' : 'mongodb://localhost/pomboapp'
  };
}
