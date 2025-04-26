const express = require('express');
const groupRouter = express.Router();
const GroupController = require('../controllers/groupController');
const groupController = new GroupController();

groupRouter.get('/:name', async (req, res) => {
    groupController.getScheduleByName(req, res);
});

module.exports = groupRouter;
