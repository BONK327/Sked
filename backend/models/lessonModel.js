const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const LessonDetail = require("./lessonDetailModel");

const Lesson = sequelize.define("Lesson",
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        lesson: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('lection', 'seminar'),
            allowNull: false,
            defaultValue: 'seminar'
        },
        number: {
            type: DataTypes.ENUM('1', '2', '3', '4', '5', '6'),
            allowNull: false
        },
        number_day: {
            type: DataTypes.ENUM('1', '2', '3', '4', '5', '6'),
            allowNull: false
        },
        number_week: {
            type: DataTypes.ENUM('1', '2'),
            allowNull: false
        }
    }, {
        tableName: 'lessons',
        timestamps: false,
    }
)

Lesson.hasMany(LessonDetail, {
    foreignKey: 'lesson_id',
    as: 'lesson_details'
})

module.exports = Lesson;