const Room = require('../models/room.js')

class RoomService {
    constructor() {
        this.Room = Room;
    }
  
    async createMultiple(roomsData) {
        try {
            return await this.Room.bulkCreate(roomsData, {
                validate: true,
                ignoreDuplicates: true
            });
        } catch (error) {
            throw new Error(`Error creating multiple rooms: ${error.message}`);
        }
    }

    async findAll() {
        try {
            return await this.Room.findAll({
                order: [['name', 'ASC']]
            });
        } catch (error) {
            throw new Error(`Error fetching rooms: ${error.message}`);
        }
    }
  
    async findById(id) {
        try {
            const room = await this.Room.findByPk(id);
            if (!room) {
                throw new Error('Room not found');
            }
            return room;
        } catch (error) {
            throw new Error(`Error finding room: ${error.message}`);
        }
    }
  
    async findByName(name) {
        try {
            const room = await this.Room.findOne({ where: { name } });
            if (!room) {
                throw new Error('Room not found');
            }
            return room;
        } catch (error) {
            throw new Error(`Error finding room by name: ${error.message}`);
        }
    }
  
    async deleteAll({ truncate = false } = {}) {
        try {
            if (truncate) {
                await this.Room.sequelize.query('TRUNCATE TABLE `rooms`');
                return 0;
            } else {
                return await this.Room.destroy({
                    where: {},
                    truncate: false
                });
            }
        } catch (error) {
            throw new Error(`Error deleting all rooms: ${error.message}`);
        }
    }
}
  
module.exports = RoomService;