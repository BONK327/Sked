const express = require('express');
const userRouter = express.Router();
const UserController = require('../controllers/userController');
const userController = new UserController();

userRouter.post('', async (req, res) => {
    userController.getScheduleByUserAndData(req, res);
});

userRouter.post('/tgbot/change', async (req, res) => {
    userController.updateUser(req, res)
})

userRouter.post('/tgbot', async (req, res) => {
    userController.addUser(req, res)
})

userRouter.post('/tgbot/notifications', async (req, res) => {
    userController.changeNotifications(req, res)
})

module.exports = userRouter;
