let db = require('./database');
let Sequelize = require('sequelize');

let User = db.define('User', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    pictureUrl: {
        type: Sequelize.STRING,
        defaultValue: 'http://www.adweek.com/socialtimes/files/2012/03/twitter-egg-icon.jpg'
    }
},{

});

module.exports = User;