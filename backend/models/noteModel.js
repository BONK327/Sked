const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const UserModel = require("./userModel");

const NoteModel = sequelize.define("Note",
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER.UNSIGNED,
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
        text: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
        tableName: 'notes',
        timestamps: false,
    }
);


NoteModel.belongsTo(
    UserModel,
    {
        foreignKey: "user_id",
        as: "user"
    }
);


module.exports = NoteModel;