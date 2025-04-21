const express = require('express');
const cors = require('cors');
const app = express();
require("dotenv").config();

const groupRouter = require("./routes/groups.js");
const teacherRouter = require("./routes/teachers.js");

const SERVER_PORT = process.env.SERVER_PORT;

app.use(cors());
app.use(express.json());
app.use('/groups', groupRouter);
app.use('/teachers', teacherRouter);

app.listen(SERVER_PORT, () => {
  console.log(`Сервер запущен на порту ${SERVER_PORT}`);
});

