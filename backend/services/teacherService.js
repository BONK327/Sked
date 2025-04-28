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
        const teacher = await this.teacherRepository.findByName(shortname);
        const scheduleDB = await this.lessonRepository.findByTeacher(teacher.id);
        const scheduleMiddle = this.converterSchedule.convertDBToMiddle(scheduleDB);
        const schedulePresent = this.converterSchedule.convertMiddleToPresentTeacher(scheduleMiddle);
        schedulePresent.name = teacher.shortname
        return schedulePresent;
    }
}

module.exports = TeacherService;