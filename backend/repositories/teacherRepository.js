const { Op } = require("sequelize");
const TeacherModel = require('../models/teacherModel');

class TeacherRepository {
    constructor() {
        this.model = TeacherModel;
    }

    async findAll() {
        return this.model.findAll({ order: [['lastname', 'ASC']] });
    }

    async findById(id) {
        return this.model.findByPk(id);
    }

    async findByName(shortname) {
        return this.model.findOne({
            where: {
                shortname: {
                    [Op.like]: `${shortname}%`
                }
            }
        });
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