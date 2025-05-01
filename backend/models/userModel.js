const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const GroupModel = require("./groupModel");
const TeacherModel = require("./teacherModel");

const UserModel = sequelize.define("User",
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            allowNull: false
        },
        group_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true
        },
        teacher_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true
        },
        username: {
            type: DataTypes.STRING(30),
            allowNull: true
        },
        firstname: {
            type: DataTypes.STRING(30),
            allowNull: false
        }
    }, {
        tableName: 'users',
        timestamps: false,
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