const express = require('express');
const userRouter = express.Router();
const UserController = require('../controllers/userController');
const userController = new UserController();

userRouter.post('', async (req, res) => {
    userController.getScheduleByUserAndData(req, res);
});

module.exports = userRouter;
