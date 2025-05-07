const NoteService = require("../services/noteService");
const noteService = new NoteService();


class NoteController {
    constructor() {
        this.noteService = noteService;
    }

    async addNote(req, res) {
        try {
            if (!req.body?.userId || !req.body?.numWeek || !req.body?.numDay || !req.body?.num || !req.body?.text)
                throw {
                    name: "IncorrectBodyError",
                    message: "Incorrect form body for add note"
                }
            
            const noteData = req.body;
            const response = await this.noteService.addNote(noteData);
            res.json(response);
        } catch (error) {
            if (error.name == "IncorrectBodyError") {
                res.status(400).json(error);
            } else if (error.name == "NotFoundError") {
                res.status(404).json(error);
            } else {
                res.status(500).json(error);
            }
        }
    }

    async removeNote(req, res) {
        try {
            if (!req.body?.userId || !req.body?.numWeek || !req.body?.numDay || !req.body?.num)
                throw {
                    name: "IncorrectBodyError",
                    message: "Incorrect form body for remove note"
                }
            const noteData = req.body;
            const response = await this.noteService.removeNote(noteData);
            res.json(response);
        } catch (error) {
            if (error.name == "IncorrectBodyError") {
                res.status(400).json(error);
            } else if (error.name == "NotFoundError") {
                res.status(404).json(error);
            } else {
                res.status(500).json(error);
            }
        }
    }

    async findNote(req, res) {
        try {
            if (!req.body?.userId || !req.body?.numWeek || !req.body?.numDay || !req.body?.num)
                throw {
                    name: "IncorrectBodyError",
                    message: "Incorrect form body for get schedule and data"
                }
            const noteData = req.body;
            const response = await this.noteService.findNote(noteData);
            res.json(response);
        } catch (error) {
            if (error.name == "IncorrectBodyError") {
                res.status(400).json(error);
            } else if (error.name == "NotFoundError") {
                res.status(404).json(error);
            } else {
                res.status(500).json(error);
            }
        }
    }
}

module.exports = NoteController;