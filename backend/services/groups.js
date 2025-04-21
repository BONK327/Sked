const Group = require('../models/group.js')

class GroupService {
    constructor() {
        this.Group = Group;
    }
  
    async createMultiple(groupsData) {
        try {
            return await this.Group.bulkCreate(groupsData, {
                validate: true,
                ignoreDuplicates: true
            });
        } catch (error) {
            throw new Error(`Error creating multiple groups: ${error.message}`);
        }
    }

    async findAll() {
        try {
            return await this.Group.findAll({
                order: [['name', 'ASC']]
            });
        } catch (error) {
            throw new Error(`Error fetching groups: ${error.message}`);
        }
    }
  
    async findById(id) {
        try {
            const group = await this.Group.findByPk(id);
            if (!group) {
                throw new Error('Group not found');
            }
            return group;
        } catch (error) {
            throw new Error(`Error finding group: ${error.message}`);
        }
    }
  
    async findByName(name) {
        try {
            const group = await this.Group.findOne({ where: { name } });
            if (!group) {
                throw new Error('Group not found');
            }
            return group;
        } catch (error) {
            throw new Error(`Error finding group by name: ${error.message}`);
        }
    }
  
    async deleteAll({ truncate = false } = {}) {
        try {
            if (truncate) {
                await this.Group.sequelize.query('TRUNCATE TABLE `groups`');
                return 0;
            } else {
                return await this.Group.destroy({
                    where: {},
                    truncate: false
                });
            }
        } catch (error) {
            throw new Error(`Error deleting all groups: ${error.message}`);
        }
    }
}
  
module.exports = GroupService;