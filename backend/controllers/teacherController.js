const TeacherService = require("../services/teacherService");
const teacherService = new TeacherService();

class TeacherController {
    constructor() {
        this.teacherService = teacherService;
    }

    async getScheduleByName(req, res) {
        try {
            const { name } = req.params;
            const schedule = await this.teacherService.getTeacherSchedule(name);
            res.json(schedule);
        } catch (error) {
            
        }
    }
}

module.exports = TeacherController;