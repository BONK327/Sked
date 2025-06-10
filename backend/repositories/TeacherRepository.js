const models = require("../models/models.js");


class TeacherRepository {
    constructor() {
        this.model = models.TeacherModel;
    }

    async findAll() {
        return await this.model.findAll({ order: [["name", "ASC"]], raw: true });
    }

    async findOneByName(shortname) {
        return await this.model.findOne({ where: { shortname }, raw: true });
    }

    async create(object) {
        return await this.model.create(object);
    }

    async delete(id) {
        return await this.model.destroy({ where: { id } });
    }
}


module.exports = TeacherRepository;
