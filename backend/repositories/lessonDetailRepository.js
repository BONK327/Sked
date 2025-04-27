const LessonDetailModel = require('../models/lessonDetailModel');

class LessonDetailRepository {
    constructor() {
        this.model = LessonDetailModel;
    }

    async createOne(lessonDetailData) {
        return (await this.model.create(lessonDetailData)).id;
    }

    async bulkCreate(lessonDetailsData) {
        return this.model.bulkCreate(lessonDetailsData, {
            validate: true,
            ignoreDuplicates: true,
        });
    }

    async deleteAll() {
        await this.model.sequelize.query('TRUNCATE TABLE `lesson_details`');
        return 0;
    }
}

module.exports = LessonDetailRepository;