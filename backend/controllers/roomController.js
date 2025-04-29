const RoomService = require("../services/roomService");
const roomService = new RoomService();

class RoomController {
    constructor() {
        this.roomService = roomService;
    }

    async getScheduleByName(req, res) {
        try {
            const name = req.params.name.replaceAll("_", " ");
            const schedule = await this.roomService.getRoomSchedule(name);
            res.json(schedule);
        } catch (error) {
            switch (error.name) {
                case "NotFoundError":
                    res.status(404).json(error);
                    break;
                case "DatabaseError":
                    res.status(503).json(error);
                    break;
                default:
                    res.status(500).json(error);
                    break;
            }
        }
    }
}

module.exports = RoomController;