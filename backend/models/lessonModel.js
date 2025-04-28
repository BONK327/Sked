const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const TeacherModel = require("./teacherModel");
const RoomModel = require("./roomModel");
const GroupModel = require("./groupModel");

const LessonModel = sequelize.define("Lesson",
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        number_week: {
            type: DataTypes.TINYINT.UNSIGNED,
            allowNull: false
        },
        number_day: {
            type: DataTypes.TINYINT.UNSIGNED,
            allowNull: false
        },
        number: {
            type: DataTypes.TINYINT.UNSIGNED,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(150),
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('lection', 'seminar'),
            allowNull: false,
            defaultValue: 'seminar'
        },
        teacher_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        room_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        group_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        subgroup: {
            type: DataTypes.TINYINT.UNSIGNED,
            defaultValue: null
        }
    }, {
        tableName: 'lessons',
        timestamps: false,
    }
)

LessonModel.belongsTo(
    TeacherModel,
    {
        foreignKey: "teacher_id",
        as: "teacher"
    }
)

LessonModel.belongsTo(
    RoomModel,
    {
        foreignKey: "room_id",
        as: "room"
    }
)

LessonModel.belongsTo(
    GroupModel,
    {
        foreignKey: "group_id",
        as: "group"
    }
)


module.exports = LessonModel;