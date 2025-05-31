const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
require("dotenv").config();

const mainRouter = require("./routes/main.js");

const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use('/api', mainRouter);

app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});


