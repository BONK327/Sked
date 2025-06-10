const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");


const NoteModel = sequelize.define("Note",
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.BIGINT.UNSIGNED,
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
        text: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
        tableName: 'notes',
        indexes: [{
            name: 'user_id',
            unique: true,
            fields: ['user_id', 'number_week', 'number_day', 'number']
        }]
    }
);


const associate = models => {
    NoteModel.belongsTo(
        models.User,
        {
            foreignKey: "userId",
            as: "user"
        }
    );
}


module.exports = {
    model: NoteModel,
    associate
};