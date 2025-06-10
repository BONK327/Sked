const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");


const RelationshipUserModel = sequelize.define("RelationshipUser",
    {
        userId: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            allowNull: false
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


const associate = models => {
    RelationshipUserModel.belongsTo(
        models.User,
        {
            foreignKey: "userId",
            as: "user"
        }
    );
    
    RelationshipUserModel.belongsTo(
        models.Group,
        {
            foreignKey: "groupId",
            as: "group"
        }
    );

    RelationshipUserModel.belongsTo(
        models.Teacher,
        {
            foreignKey: "teacherId",
            as: "teacher"
        }
    );
}


module.exports = {
    model: RelationshipUserModel,
    associate
};