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
            
        }
    }
}

module.exports = GroupController;