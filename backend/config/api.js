const Axios = require("axios");
require('dotenv').config();


const axios = Axios.create({
    baseURL: process.env.API_BASE_URL,
    headers: {
        Token: process.env.API_TOKEN,
        Authorization: `Basic ${Buffer.from(`${process.env.API_LOGIN}:${process.env.API_PASSWORD}`).toString('base64')}`
    }
})

module.exports = axios;