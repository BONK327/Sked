const LessonDetailRepository = require('../repositories/lessonDetailRepository');
const LessonRepository = require('../repositories/lessonRepository');
const ApiService = require('./apiService');

const lessonRepository = new LessonRepository();
const lessonDetailRepository = new LessonDetailRepository();
const apiService = new ApiService();

class LessonService {
    constructor() {
        this.lessonRepository = lessonRepository;
        this.lessonDetailRepository = lessonDetailRepository;
        this.apiService = apiService;
    }

    async createLessons(schedule) {
        schedule.forEach(async s => {
            const lesson = s.lesson;
            const lessonDetails = s.lesson_details;
            const idLesson = await this.lessonRepository.createOne(lesson);
            lessonDetails.forEach((_, i) => {
                lessonDetails[i].lesson_id = idLesson;
            });
            await this.lessonDetailRepository.bulkCreate(lessonDetails);
        })
    }

    async deleteLessons(id, type) {
        this.lessonDetailRepository.deleteAll();
        this.lessonRepository.deleteAll();
    }

    async getLessonSchedule(name) {
        const lesson = await this.lessonRepository.findByName(name);
        if (!lesson) {
            throw ApiError.NotFound('Lesson not found');
        }
        const schedule = await this.apiService.fetchSchedule("Lesson", lesson.id);
        return this.formatSchedule(schedule);
    }

    formatSchedule(schedule) {
        return {
            type: "lesson",
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
            details: this.formatDetails(lesson)
        };
    }

    formatDetails(lesson) {
        if (lesson.name === "Элективные курсы по физической культуре и спорту") {
            return [{ name: "", lesson: "спорткомплекс", sublesson: "" }];
        }
        return lesson.teachers.map(teacher => ({
            name: teacher?.name,
            groups: this.formatGroups(teacher?.groups),
        }));
    }

    formatGroups(groups) {
        return groups.map(group => {
            const [ name, subgroup ] = group.name.split('/');
            return {
                group: name,
                subgroup: subgroup || ""
            }
        }) 
    }
}

module.exports = LessonService;