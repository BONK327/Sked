const models = require("../models/models.js");


class NoteRepository {
    constructor() {
        this.model = models.NoteModel
    }

    async findAllByUserId(userId) {
        return await this.model.findAll({
            where: { userId },
            raw: true
        });
    }

    async create(object) {
        return await this.model.create(object);
    }

    async update(object) {
        return await this.model.update(
            { text: object.text },
            { where: {
                userId: object.userId,
                numberWeek: object.numberWeek,
                numberDay: object.numberDay,
                number: object.number
            }}
        );
    }

    async delete(object) {
        return await this.model.destroy({ where: { 
            userId: object.userId,
            numberWeek: object.numberWeek,
            numberDay: object.numberDay,
            number: object.number
        }});
    }
}


module.exports = NoteRepository;
