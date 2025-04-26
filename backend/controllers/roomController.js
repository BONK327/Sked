const RoomService = require("../services/roomService");
const roomService = new RoomService();

class RoomController {
    constructor() {
        this.roomService = roomService;
    }

    async getScheduleByName(req, res) {
        try {
            const { name } = req.params;
            const schedule = await this.roomService.getRoomSchedule(name);
            res.json(schedule);
        } catch (error) {
            
        }
    }
}

module.exports = RoomController;