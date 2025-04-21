const { DataTypes } = require("sequelize");
const sequelize = require("../db.js");

const Group = sequelize.define("Group",
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
        timestamps: false,
    }
)

module.exports = Group;