var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'cheslie-game'
    },
    port: 3000,
  },

  production: {
    root: rootPath,
    app: {
      name: 'cheslie-game'
    },
    port: process.env.PORT,
  }
};

module.exports = config[env];