const express = require('express');
const roomRouter = express.Router();
const RoomController = require('../controllers/roomController');
const roomController = new RoomController();

roomRouter.get('/:name', async (req, res) => {
    roomController.getScheduleByName(req, res);
});

module.exports = roomRouter;
