const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");


const GroupModel = sequelize.define("Group",
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(7),
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'groups',
        indexes: [
            {
                name: 'name',
                unique: true,
                fields: ['name']
            }
        ]
    }
)


const associate = models => {
    GroupModel.hasMany(
        models.RelationshipUser,
        {
            foreignKey: "groupId",
            as: "relationshipsUsers"
        }
    );
    GroupModel.hasMany(
        models.Lesson,
        {
            foreignKey: "groupId",
            as: "lessons"
        }
    )
}


module.exports = {
    model: GroupModel,
    associate
};
