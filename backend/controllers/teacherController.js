const TeacherService = require("../services/teacherService");
const teacherService = new TeacherService();

class TeacherController {
    constructor() {
        this.teacherService = teacherService;
    }

    async getScheduleByName(req, res) {
        try {
            const shortname = req.params.shortname.replaceAll("_", " ");
            const schedule = await this.teacherService.getTeacherSchedule(shortname);
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

module.exports = TeacherController;