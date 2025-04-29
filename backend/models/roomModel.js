const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const RoomModel = sequelize.define("Room",
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(25),
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'rooms',
        timestamps: false,
    }
)

module.exports = RoomModel;