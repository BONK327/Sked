const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");


const LessonModel = sequelize.define("Lesson",
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        numberWeek: {
            type: DataTypes.TINYINT.UNSIGNED,
            allowNull: false
        },
        numberDay: {
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
        teacherId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        roomId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        groupId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        subgroup: {
            type: DataTypes.TINYINT.UNSIGNED,
            defaultValue: null
        }
    }, {
        tableName: 'lessons'
    }
)


const associate = models => {
    LessonModel.belongsTo(
        models.Teacher,
        {
            foreignKey: "teacherId",
            as: "teacher"
        }
    )

    LessonModel.belongsTo(
        models.Room,
        {
            foreignKey: "roomId",
            as: "room"
        }
    )

    LessonModel.belongsTo(
        models.Group,
        {
            foreignKey: "groupId",
            as: "group"
        }
    )
}


module.exports = {
    model: LessonModel,
    associate
};
