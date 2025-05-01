const NoteRepository = require("../repositories/noteRepositories");
const UserRepository = require("../repositories/userRepository");

const noteRepository = new NoteRepository();
const userRepository = new UserRepository();

class NoteService {
    constructor() {
        this.userRepository = userRepository;
        this.noteRepository = noteRepository;
    }

    async addNote(noteData) {
        const user = await this.userRepository.findById(noteData.userId);
        
        if (!user)
            throw { name: "NotFoundError", message: "User not found" };

        if (!(
            (noteData.numWeek >= 1 && noteData.numWeek <= 2) &&
            (noteData.numDay >= 1 && noteData.numDay <= 6) &&
            (noteData.num >= 1 && noteData.num <= 6)
        )) throw { name: "IncorrectBodyError", message: "Incorrect form body for add note" };

        const note = await this.noteRepository.findOneByUser(noteData);
        if (note) {
            noteData.id = note.id
            await this.noteRepository.updateOne(noteData);
            return await this.noteRepository.findOneById(note.id)
        } else {
            return this.noteRepository.createOne(noteData);
        }
    }

    async removeNote(noteData) {
        const user = await this.userRepository.findById(noteData.userId);
        if (!user)
            throw { name: "NotFoundError", message: "User not found" };

        if (!(
            (noteData.numWeek >= 1 && noteData.numWeek <= 2) &&
            (noteData.numDay >= 1 && noteData.numDay <= 6) &&
            (noteData.num >= 1 && noteData.num <= 6)
        )) throw { name: "IncorrectBodyError", message: "Incorrect form body for remove note" };

        const note = await this.noteRepository.findOneByUser(noteData);
        if (note) {
            await this.noteRepository.deleteOne(note.id);
            return { message: "Successful delete" }
        } else {
            throw { name: "NotFoundError", message: "Note not found" };
        }
    }

    async findAllNoteByUser(userId) {
        try {
            const user = await this.userRepository.findById(userId);
            if (!user)
                throw { name: "NotFoundError", message: "User not found" };
            const notes = await this.noteRepository.findAllByUser(userId);
            return notes
        } catch (error) {
            throw error
        }
    }
}

module.exports = NoteService;