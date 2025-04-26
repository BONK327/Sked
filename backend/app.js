const express = require('express');
const cors = require('cors');
const app = express();
require("dotenv").config();

const mainRouter = require("./routes/main.js");

const SERVER_PORT = process.env.SERVER_PORT;

app.use(cors());
app.use(express.json());
app.use('/api', mainRouter);

app.listen(SERVER_PORT, () => {
    console.log(`Сервер запущен на порту ${SERVER_PORT}`);
});

