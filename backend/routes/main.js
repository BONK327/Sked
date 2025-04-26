const express = require('express');
const mainRouter = express.Router();

const groupRouter = require("./groups.js");
const roomRouter = require("./rooms.js");
const teacherRouter = require("./teachers.js");

mainRouter.use("/groups", groupRouter);
mainRouter.use("/rooms", roomRouter);
mainRouter.use("/teachers", teacherRouter);

module.exports = mainRouter;