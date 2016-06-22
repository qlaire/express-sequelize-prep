let config = require('../config.json');
let Sequelize = require('sequelize');

module.exports = new Sequelize(config.database, config.username, config.password, config);