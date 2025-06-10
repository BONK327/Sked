const models = require("../models/models.js");
const { col, fn } = require("sequelize");

class LessonRepository {
    constructor() {
        this.model = models.LessonModel;
    }

    #lessonAttributes() {
      return [
            'id',
            'numberWeek',
            'numberDay',
            'number',
            'name',
            'type',
            'teacherId',
            [
                fn(
                    'CONCAT',
                    col('teacher.lastname'),
                    ' ',
                    col('teacher.firstname'),
                    ' ',
                    col('teacher.middlename')
                ),
                'teacherFullname'
            ],
            'roomId',
            [col('room.name'), 'roomName'],
            'groupId',
            [col('group.name'), 'groupName'],
            'subgroup'
        ];
    }

    #lessonIncludes() {
        return [
            {
                association: "group",
                attributes: []
            },
            {
                association: "teacher",
                attributes: []
            },
            {
                association: "room",
                attributes: []
            }
        ];
    }

    #lessonOrder() {
        return [
            ["numberWeek", "ASC"],
            ["numberDay", "ASC"],
            ["number", "ASC"],
            ["groupId", "ASC"],
            ["subgroup", "ASC"]
        ];
    }

    async findAllByGroupId(groupId) {
        return await this.model.findAll({
            where: { groupId },
            attributes: this.#lessonAttributes(),
            include: this.#lessonIncludes(),
            order: this.#lessonOrder(),
            raw: true
        });
    }

    async findAllByTeacherId(teacherId) {
        return await this.model.findAll({
            where: { teacherId },
            attributes: this.#lessonAttributes(),
            include: this.#lessonIncludes(),
            order: this.#lessonOrder(),
            raw: true
        });
    }

    async findAllByRoomId(roomId) {
        return await this.model.findAll({
            where: { roomId },
            attributes: this.#lessonAttributes(),
            include: this.#lessonIncludes(),
            order: this.#lessonOrder(),
            raw: true
        });
    }

    async create(object) {
        return await this.model.create(object);
    }

    async delete(id) {
        return await this.model.destroy({ where: { id } });
    }
}



module.exports = LessonRepository;