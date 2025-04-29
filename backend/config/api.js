require('dotenv').config();

module.exports = {
    baseUrl: process.env.API_BASE_URL,
    token: process.env.API_TOKEN,
    username: process.env.API_LOGIN,
    password: process.env.API_PASSWORD
};