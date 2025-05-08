const LessonRepository = require('../repositories/lessonRepository');
const TeacherRepository = require('../repositories/teacherRepository');
const ApiService = require('./apiService');
const ConverterSchedule = require('../utils/convertSchedule');

const teacherRepository = new TeacherRepository();
const lessonRepository = new LessonRepository();
const apiService = new ApiService();
const convertSchedule = new ConverterSchedule();

class TeacherService {
    constructor() {
        this.teacherRepository = teacherRepository;
        this.lessonRepository = lessonRepository;
        this.apiService = apiService;
        this.converterSchedule = convertSchedule;
    }

    async getTeacherSchedule(shortname) {
        try {
            const teacher = await this.teacherRepository.findByName(shortname);
            if (!teacher) {
                throw {
                    name: "NotFoundError",
                    message: `Teacher '${shortname}' not found`
                }
            }
            const scheduleDB = await this.lessonRepository.findByTeacher(teacher.id);
            if (scheduleDB.length === 0)
                throw {
                    name: "ForbiddenError",
                    message: `Teacher '${shortname}' forbidden`
                }
            const schedulePresent = this.converterSchedule.convertDBToPresentTeacher(scheduleDB);
            schedulePresent.name = teacher.shortname
            return schedulePresent;
        } catch (error) {
            if (error.name == "NotFoundError") {
                throw error
            } else if (error.name == "ForbiddenError") {
                throw error
            } else {
                throw {
                    name: "DatabaseError",
                    message: "Not database connection"
                };  
            }
        }
    }
}

module.exports = TeacherService;