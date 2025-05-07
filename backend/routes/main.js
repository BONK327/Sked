const express = require('express');
const mainRouter = express.Router();

const groupRouter = require("./groups.js");
const roomRouter = require("./rooms.js");
const teacherRouter = require("./teachers.js");
const userRouter = require('./users.js');
const noteRouter = require('./notes.js');

mainRouter.use("/groups", groupRouter);
mainRouter.use("/rooms", roomRouter);
mainRouter.use("/teachers", teacherRouter);
mainRouter.use("/users", userRouter);
mainRouter.use("/notes", noteRouter);

module.exports = mainRouter;