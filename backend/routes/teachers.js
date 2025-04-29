const express = require('express');
const teacherRouter = express.Router();
const TeacherController = require('../controllers/teacherController');
const teacherController = new TeacherController();

teacherRouter.get('/:shortname', async (req, res) => {
    teacherController.getScheduleByName(req, res);
});

module.exports = teacherRouter;
