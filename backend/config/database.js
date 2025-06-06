const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DATABASE_NAME,
    process.env.DATABASE_LOGIN,
    process.env.DATABASE_PASSWORD,
    {
        host: process.env.DATABASE_HOST,
        dialect: 'mysql',
        // logging: db.log
        define: {
            timestamps: false,
            underscored: true
        },
        timezone: "+03:00"
    }
);

module.exports = sequelize;