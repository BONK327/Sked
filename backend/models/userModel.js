const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");


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
            defaultValue: true
        }
    }, {
        tableName: 'users',
    }
)


const associate = models => {
    UserModel.hasMany(
        models.Note,
        {
            foreignKey: 'userId',
            as: 'notes'
        }
    );
    
    UserModel.hasOne(
        models.RelationshipUser,
        {
            foreignKey: 'userId',
            as: 'relationshipUser'
        }
    )
}


module.exports = {
    model: UserModel,
    associate
};