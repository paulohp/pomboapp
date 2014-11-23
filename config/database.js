// config/database.js
console.log(process.env)
if (process.env.MONGODB_HOST) {
  module.exports = {
    'url' : process.env.MONGODB_URI
  };
}else{
  module.exports = {
    'url' : 'mongodb://localhost/pomboapp'
  };
}
