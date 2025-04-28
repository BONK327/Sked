const LessonRepository = require('../repositories/lessonRepository');

const lessonRepository = new LessonRepository();

class LessonService {
    constructor() {
        this.lessonRepository = lessonRepository;
    }

    async createLessons(schedule) {
        await this.lessonRepository.bulkCreate(schedule);
    }

    async updateLessons(schedule) {

    }

    async deleteLessons() {
        this.lessonRepository.deleteAll();
    }
}

module.exports = LessonService;