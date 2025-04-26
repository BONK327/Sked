const TeacherModel = require('../models/teacherModel');

class TeacherRepository {
    constructor() {
        this.model = TeacherModel;
    }

    async findAll() {
        return this.model.findAll({ order: [['name', 'ASC']] });
    }

    async findById(id) {
        return this.model.findByPk(id);
    }

    async findByName(name) {
        return this.model.findOne({ where: { lastname: name } });
    }

    async bulkCreate(teachersData) {
        return this.model.bulkCreate(teachersData, {
            validate: true,
            ignoreDuplicates: true,
        });
    }

    async deleteAll({ truncate = false } = {}) {
        if (truncate) {
            await this.model.sequelize.query('TRUNCATE TABLE `teachers`');
            return 0;
        }
        return this.model.destroy({ where: {} });
    }
}

module.exports = TeacherRepository;