const express = require('express');
const userRouter = express.Router();
const UserController = require('../controllers/userController');
const userController = new UserController();

userRouter.post('', async (req, res) => {
    userController.getAll(req, res);
});

module.exports = userRouter;
