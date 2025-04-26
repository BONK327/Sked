const axios = require("axios");
require("dotenv").config();

const GroupService = require('../services/groups.js')

const username = process.env.API_LOGIN;
const password = process.env.API_PASSWORD;
const token = process.env.API_TOKEN;
const groupService = new GroupService();

async function updateGroups() {
    try {
        const groups = (await axios.get('https://university.kubsau.ru/kubsau/hs/csData/GetGroups', {
            headers: {
                'Token': token,
                'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
            }
        })).data.groups;
        
        await groupService.deleteAll();
        await groupService.createMultiple(groups);
    } catch (error) {
        console.error('Error:', error.message);
    }
}


updateGroups();