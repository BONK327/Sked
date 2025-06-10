const models = require("../models/models.js");


class UserRepository {
    constructor() {
        this.model = models.UserModel;
    }

    async findOneById(id) {
        return await this.model.findOne({ where: { id }, raw: true });
    }

    async create(object) {
        return await this.model.create(object);
    }

    async update(object) {
        return await this.model.update(object, { where: { id: object.id }});
    }
}


module.exports = UserRepository;
