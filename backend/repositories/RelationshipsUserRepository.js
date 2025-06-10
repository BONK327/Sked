const models = require("../models/models.js");


class RelationshipUserRepository {
    constructor() {
        this.model = models.RelationshipUserModel;
    }

    async findOneById(id) {
        return await this.model.findOne({ where: { id } });
    }

    async findAllByGroupId(groupId) {
        return await this.model.findAll({ where: { groupId } });
    }

    async findAllByTeacherId(teacherId) {
        return await this.model.findAll({ where: { teacherId } });
    }

    async create(object) {
        return await this.model.create(object);
    }

    async update(object) {
        return await this.model.update(object, { where: { id: object.id} });
    }
}


module.exports = RelationshipUserRepository;