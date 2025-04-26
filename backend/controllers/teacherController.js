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
            
        }
    }
}

module.exports = TeacherController;