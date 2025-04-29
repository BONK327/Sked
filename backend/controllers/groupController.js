const GroupService = require("../services/groupService");
const groupService = new GroupService();

class GroupController {
    constructor() {
        this.groupService = groupService;
    }

    async getScheduleByName(req, res) {
        try {
            const { name } = req.params;
            const schedule = await this.groupService.getGroupSchedule(name);
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

module.exports = GroupController;