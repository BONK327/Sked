const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const GroupModel = require("./groupModel");
const TeacherModel = require("./teacherModel");

const UserModel = sequelize.define("User",
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            allowNull: false
        },
        username: {
            type: DataTypes.STRING(32),
            allowNull: true
        },
        firstname: {
            type: DataTypes.STRING(64),
            allowNull: false
        },
        notifications: {
            type: DataTypes.BOOLEAN,
            defaultValue: 1
        }
    }, {
        tableName: 'users',
    }
)


UserModel.belongsTo(
    GroupModel,
    {
        foreignKey: "group_id",
        as: "group"
    }
)

UserModel.belongsTo(
    TeacherModel,
    {
        foreignKey: "teacher_id",
        as: "teacher"
    }
)


module.exports = UserModel;