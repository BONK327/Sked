const { DataTypes } = require("sequelize");
const sequelize = require("../db.js");

const Teacher = sequelize.define("Teacher",
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            allowNull: false
        },
        lastname: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        firstname: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        middlename: {
            type: DataTypes.STRING(20),
            allowNull: true
        }
    }, {
        tableName: 'teachers',
        timestamps: false,
    }
)

module.exports = Teacher;