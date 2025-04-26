const express = require('express');
const cors = require('cors');
const app = express();
require("dotenv").config();

const groupRouter = require("./routes/groups.js");
const teacherRouter = require("./routes/teachers.js");
const roomRouter = require("./routes/rooms.js");

const SERVER_PORT = process.env.SERVER_PORT;

app.use(cors());
app.use(express.json());
app.use('/api/groups', groupRouter);
app.use('/api/teachers', teacherRouter);
app.use('/api/rooms', roomRouter);

app.listen(SERVER_PORT, () => {
  console.log(`Сервер запущен на порту ${SERVER_PORT}`);
});

