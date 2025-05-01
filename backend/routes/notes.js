const express = require('express');
const noteRouter = express.Router();
const NoteController = require('../controllers/noteController');
const noteController = new NoteController();


noteRouter.post('/add', async (req, res) => {
    await noteController.addNote(req, res);
})

noteRouter.post('/remove', async (req, res) => {
    await noteController.removeNote(req, res);
})

module.exports = noteRouter;