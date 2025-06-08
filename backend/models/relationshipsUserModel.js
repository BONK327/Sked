const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const UserModel = require("./UserModel");
const GroupModel = require("./GroupModel");
const TeacherModel = require("./TeacherModel");

const RelationshipsUsersModel = sequelize.define("RelationshipUser",
    {
        userId: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            allowNull: false,
            references: {
                model: UserModel,
                key: 'id'
            }
        },
        groupId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true
        },
        teacherId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true
        },
        type: {
            type: DataTypes.ENUM("student", "teacher"),
            allowNull: true
        }
    }, {
        tableName: 'relationships_users',
    }
)


RelationshipsUsersModel.belongsTo(
    GroupModel,
    {
        foreignKey: "groupId",
        as: "group"
    }
)

RelationshipsUsersModel.belongsTo(
    TeacherModel,
    {
        foreignKey: "teacherId",
        as: "teacher"
    }
)


module.exports = RelationshipsUsersModel;