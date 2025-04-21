const Teacher = require('../models/teacher.js')

class TeacherService {
    constructor() {
        this.Teacher = Teacher;
    }
  
    async createMultiple(teachersData) {
        try {
            return await this.Teacher.bulkCreate(teachersData, {
                validate: true,
                ignoreDuplicates: true
            });
        } catch (error) {
            throw new Error(`Error creating multiple teachers: ${error.message}`);
        }
    }

    async findAll() {
        try {
            return await this.Teacher.findAll({
                order: [['name', 'ASC']]
            });
        } catch (error) {
            throw new Error(`Error fetching teachers: ${error.message}`);
        }
    }
  
    async findById(id) {
        try {
            const teacher = await this.Teacher.findByPk(id);
            if (!teacher) {
                throw new Error('Teacher not found');
            }
            return teacher;
        } catch (error) {
            throw new Error(`Error finding teacher: ${error.message}`);
        }
    }
  
    async findByName(lastname) {
        try {
            const teacher = await this.Teacher.findOne({ where: { lastname } });
            if (!teacher) {
                throw new Error('Teacher not found');
            }
            return teacher;
        } catch (error) {
            throw new Error(`Error finding teacher by name: ${error.message}`);
        }
    }
  
    async deleteAll({ truncate = false } = {}) {
        try {
            if (truncate) {
                await this.Teacher.sequelize.query('TRUNCATE TABLE `teachers`');
                return 0;
            } else {
                return await this.Teacher.destroy({
                    where: {},
                    truncate: false
                });
            }
        } catch (error) {
            throw new Error(`Error deleting all teachers: ${error.message}`);
        }
    }
}
  
module.exports = TeacherService;