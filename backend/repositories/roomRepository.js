const RoomModel = require('../models/roomModel');

class RoomRepository {
    constructor() {
        this.model = RoomModel;
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

    async bulkCreate(roomsData) {
        return this.model.bulkCreate(roomsData, {
            validate: true,
            ignoreDuplicates: true,
        });
    }

    async deleteAll({ truncate = false } = {}) {
        if (truncate) {
            await this.model.sequelize.query('TRUNCATE TABLE `rooms`');
            return 0;
        }
        return this.model.destroy({ where: {} });
    }
}

module.exports = RoomRepository;