const { Op, where, col, fn } = require('sequelize');
const LessonModel = require('../models/lessonModel');
const LessonDetailModel = require('../models/lessonDetailModel');
const TeacherModel = require('../models/teacherModel');
const Group = require('../models/groupModel');
const Room = require('../models/roomModel');

class LessonRepository {
    constructor() {
        this.model = LessonModel;
    }

    async findByGroup(groupId) {
        groupId = String(groupId).padStart(9, "0")
        return await this.find('group', groupId);
    }

    async findByRoom(roomId) {
        roomId = String(roomId).padStart(9, "0")
        return await this.find('room', roomId);
    }

    async findByTeacher(teacherId) {
        teacherId = String(teacherId).padStart(9, "0")
        return await this.find('teacher', teacherId);
    }

    async find(type, id) {
        const result = [];
        const lessons = await this.model.findAll({
            attributes: [
                'id',
                'number_week',
                'number_day',
                'number',
                'lesson',
                'type',
            ],
            include: [
                {
                    model: LessonDetailModel,
                    as: 'lesson_details',
                    where: {
                        [`${type}_id`]: id
                    },
                    attributes: []
                }
            ],
            group: [
                'number_week',
                'number_day',
                'number'
            ],
            order: [
                ['number_week', 'ASC'],
                ['number_day', 'ASC'],
                ['number', 'ASC']
            ],
            raw: true
        })
        for (let lesson of lessons) {
            result.push({
                number_week: lesson.number_week,
                number_day: lesson.number_day,
                number: lesson.number,
                lesson: lesson.lesson,
                type: lesson.type,
                lesson_details: await LessonDetailModel.findAll({
                    attributes: [
                        [
                            fn(
                                'CONCAT',
                                col('teacher.lastname'),
                                ' ',
                                col('teacher.firstname'),
                                ' ',
                                col('teacher.middlename')
                            ),
                            'teacher'
                        ],
                        [col('room.name'), 'room'],
                        [col('group.name'), 'group'],
                        'subgroup'
                    ],
                    where: {
                        [`${type}_id`]: id,
                        lesson_id: lesson.id
                    },
                    include: [
                        {
                            model: TeacherModel,
                            as: 'teacher',
                            attributes: []
                        },
                        {
                            model: Group,
                            as: 'group',
                            attributes: []
                        },
                        {
                            model: Room,
                            as: 'room',
                            attributes: []
                        },
                    ],
                    order: [
                        ['subgroup', 'ASC']
                    ],
                    raw: true
                })
            })
        }
        return result;
    }

    async createOne(lessonData) {
        return (await this.model.create(lessonData)).id;
    }

    async bulkCreate(lessonsData) {
        return this.model.bulkCreate(lessonsData, {
            validate: true,
            ignoreDuplicates: true,
        });
    }

    async deleteAll() {
        return await this.model.destroy({
            where: {},
            truncate: false
        });
    }
}

module.exports = LessonRepository;