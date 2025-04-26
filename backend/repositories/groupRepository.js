const GroupModel = require('../models/groupModel');

class GroupRepository {
    constructor() {
        this.model = GroupModel;
    }

    async findAll() {
        return this.model.findAll({ order: [['name', 'ASC']] });
    }

    async findById(id) {
        return this.model.findByPk(id);
    }

    async findByName(name) {
        return this.model.findOne({ where: { name } });
    }

    async bulkCreate(groupsData) {
        return this.model.bulkCreate(groupsData, {
            validate: true,
            ignoreDuplicates: true,
        });
    }

    async deleteAll({ truncate = false } = {}) {
        if (truncate) {
            await this.model.sequelize.query('TRUNCATE TABLE `groups`');
            return 0;
        }
        return this.model.destroy({ where: {} });
    }
}

module.exports = GroupRepository;