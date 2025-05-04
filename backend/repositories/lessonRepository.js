const { col, fn } = require('sequelize');
const LessonModel = require('../models/lessonModel');
const TeacherModel = require('../models/teacherModel');
const GroupModel = require('../models/groupModel');
const RoomModel = require('../models/roomModel');

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
        const lessons = await this.model.findAll({
            attributes: [
                'id',
                'number_week',
                'number_day',
                'number',
                'name',
                'type',
                [col('teacher.id'), 'teacher_id'],
                [
                    fn(
                        'CONCAT',
                        col('teacher.lastname'),
                        ' ',
                        col('teacher.firstname'),
                        ' ',
                        col('teacher.middlename')
                    ),
                    'teacher_fullname'
                ],
                [col('room.id'), 'room_id'],
                [col('room.name'), 'room_name'],
                [col('group.id'), 'group_id'],
                [col('group.name'), 'group_name'],
                'subgroup'
            ],
            include: [
                {
                    model: TeacherModel,
                    as: 'teacher',
                    attributes: []
                },
                {
                    model: RoomModel,
                    as: 'room',
                    attributes: []
                },
                {
                    model: GroupModel,
                    as: 'group',
                    attributes: []
                }
            ],
            where: {
                [`${type}_id`]: id
            },
            order: [
                ['number_week', 'ASC'],
                ['number_day', 'ASC'],
                ['number', 'ASC'],
                [col('group.name'), 'ASC'],
                ['subgroup', 'ASC']
            ],
            raw: true
        })
        return lessons;
    }

    async bulkCreate(lessonsData) {
        try {
            return this.model.bulkCreate(lessonsData);
        } catch (error) {
            console.log(error)
        }
    }

    async deleteAll() {
        return await this.model.destroy({
            where: {},
            truncate: false
        });
    }
}

module.exports = LessonRepository;