const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Teacher = require("./teacherModel");
const Room = require("./roomModel");
const Group = require("./groupModel");

const LessonDetail = sequelize.define("LessonDetail",
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        lesson_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: 'lessons',
                key: 'id'
            }
        },
        teacher_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: 'teachers',
                key: 'id'
            }
        },
        room_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: 'rooms',
                key: 'id'
            }
        },
        group_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: 'groups',
                key: 'id'
            }
        },
        subgroup: {
            type: DataTypes.ENUM('1', '2'),
            allowNull: true
        }
    }, {
        tableName: 'lesson_details',
        timestamps: false,
    }
)

LessonDetail.belongsTo(Teacher, {
    foreignKey: 'teacher_id',
    as: 'teacher'
})


LessonDetail.belongsTo(Group, {
    foreignKey: 'group_id',
    as: 'group'
})

LessonDetail.belongsTo(Room, {
    foreignKey: 'room_id',
    as: 'room'
})

module.exports = LessonDetail;