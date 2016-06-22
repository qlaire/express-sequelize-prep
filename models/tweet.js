let db = require('./database');
let Sequelize = require('sequelize');
let User = require('./user');

let Tweet = db.define('Tweet', {});

module.exports = Tweet;