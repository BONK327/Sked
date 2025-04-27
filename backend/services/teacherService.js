const LessonRepository = require('../repositories/lessonRepository');
const TeacherRepository = require('../repositories/teacherRepository');
const ApiService = require('./apiService');

const teacherRepository = new TeacherRepository();
const lessonRepository = new LessonRepository();
const apiService = new ApiService();

class TeacherService {
    constructor() {
        this.teacherRepository = teacherRepository;
        this.lessonRepository = lessonRepository;
        this.apiService = apiService;
    }

    async getTeacherSchedule(shortname) {
        const teacher = await this.teacherRepository.findByName(shortname);
        if (!teacher) {
            throw ApiError.NotFound('Teacher not found');
        }
        const schedule = await this.lessonRepository.findByTeacher(teacher.id)
        const result = {
            type: 'teacher',
            name: `${teacher.lastname} ${teacher.firstname} ${teacher.middlename}`,
            lessons: schedule.map(lesson => {
                return {
                    numberWeek: lesson.number_week,
                    numberDay: lesson.number_day,
                    number: lesson.number,
                    name: lesson.lesson,
                    type: lesson.type,
                    room: lesson.lesson_details[0].room,
                    details: lesson.lesson_details.map(detail => {
                        return {
                            group: detail.group,
                            subgroup: detail.subgroup
                        }
                    })
                }
            })
        }
        return result;
    }
}

module.exports = TeacherService;