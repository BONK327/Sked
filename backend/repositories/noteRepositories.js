const NoteModel = require('../models/noteModel');

class NoteRepository {
    constructor() {
        this.model = NoteModel;
    }

    async findAllByUser(userId) {
        try {
            return await this.model.findAll({
                attributes: [
                    'number_week',
                    'number_day',
                    'number',
                    'text'
                ],
                where: { user_id: userId },
                order: [
                    ['number_week', 'ASC'],
                    ['number_day', 'ASC'],
                    ['number', 'ASC']
                ],
                raw: true
            })
        } catch (error) {
            throw error
        }
    }

    async findOneById(noteId) {
        try {
            return await this.model.findByPk(noteId);
        } catch (error) {
            throw error
        }
    }

    async findOneByUser(noteData) {
        try {
            return await this.model.findOne({
                where: { 
                    user_id: noteData.userId,
                    number_week: noteData.numWeek,
                    number_day: noteData.numDay,
                    number: noteData.num,
                }
            });
        } catch (error) {
            throw error
        }
    }

    async createOne(noteData) {
        try {
            const note = await NoteModel.create({
                user_id: noteData.userId,
                number_week: noteData.numWeek,
                number_day: noteData.numDay,
                number: noteData.num,
                text: noteData.text
            });
            return note;
        } catch (error) {
            throw error;
        }
    }

    async updateOne(noteData) {
        try {
            const note = await NoteModel.update(noteData, {
                where: { 
                    id: noteData.id
                }
            });
            return note;
        } catch (error) {
            throw error;
        }
    }

    async deleteOne(noteId) {
        try {
            await NoteModel.destroy({
                where: {
                    id: noteId
                }
            })
        } catch (error) {
            throw error;
        }
    }
}

module.exports = NoteRepository;