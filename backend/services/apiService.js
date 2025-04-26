const axios = require('axios');
const config = require('../config/api');

class ApiService {
    constructor() {
        this.axios = axios.create({
        baseURL: config.baseUrl,
        timeout: 5000,
        headers: {
            'Token': config.token,
            'Authorization': `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`
        }
        });
    }

    async fetchSchedule(type, id) {
        try {
            const paddedId = id.toString().padStart(9, '0');
            const response = await this.axios.get(`/GetBy${type}/${paddedId}`);
            return response.data;
        } catch (error) {
            throw ApiError.BadGateway('Failed to fetch schedule from external API');
        }
    }
}

module.exports = ApiService;