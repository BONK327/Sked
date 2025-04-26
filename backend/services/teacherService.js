const TeacherRepository = require('../repositories/teacherRepository');
const ApiService = require('./apiService');

const teacherRepository = new TeacherRepository();
const apiService = new ApiService();

class TeacherService {
    constructor() {
        this.teacherRepository = teacherRepository;
        this.apiService = apiService;
    }

    async getTeacherSchedule(name) {
        const teacher = await this.teacherRepository.findByName(name);
        if (!teacher) {
            throw ApiError.NotFound('Teacher not found');
        }
        const schedule = await this.apiService.fetchSchedule("Teacher", teacher.id);
        return this.formatSchedule(schedule);
    }

    formatSchedule(schedule) {
        return {
            type: "teacher",
            name: schedule.name,
            lessons: schedule.weeks.flatMap(week => 
                week.days.flatMap(day => 
                day.classes
                    .filter(classObj => classObj.lessons != "null")
                    .map(classObj => this.formatLesson(week, day, classObj))
                )
            )
        };
    }

    formatLesson(week, day, classObj) {
        const lesson = classObj.lessons[0];
        return {
            numberWeek: week.number,
            numberDay: day.number,
            number: classObj.number,
            name: lesson.name,
            type: lesson.type === 'lec' ? 'lection' : 'seminar',
            room: lesson.rooms[0].name,
            details: this.formatDetails(lesson.rooms[0].groups)
        };
    }

    formatDetails(groups) {
        return groups.map(group => {
            const [ name, subgroup ] = group.name.split('/');
            return {
                group: name,
                subgroup: subgroup || ""
            }
        });
    }
}

module.exports = TeacherService;