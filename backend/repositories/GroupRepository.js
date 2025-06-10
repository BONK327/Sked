const models = require("../models/models.js");


class GroupRepository {
    constructor() {
        this.model = models.GroupModel;
    }

    async findAll() {
        return await this.model.findAll({ order: [["name", "ASC"]], raw: true });
    }

    async findOneByName(name) {
        return await this.model.findOne({ where: { name }, raw: true });
    }

    async create(object) {
        return await this.model.create(object);
    }

    async delete(id) {
        return await this.model.destroy({ where: { id } });
    }
}


module.exports = GroupRepository;
