const axios = require("axios");
require("dotenv").config();

const RoomService = require('../services/rooms.js')

const username = process.env.API_LOGIN;
const password = process.env.API_PASSWORD;
const token = process.env.API_TOKEN;
const roomService = new RoomService();

async function updateRooms() {
    try {
        const rooms = (await axios.get('https://university.kubsau.ru/kubsau/hs/csData/GetRooms', {
            headers: {
                'Token': token,
                'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
            }
        })).data.rooms;
        
        await roomService.deleteAll();
        await roomService.createMultiple(rooms);
    } catch (error) {
        console.error('Error:', error.message);
    }
}


updateRooms();