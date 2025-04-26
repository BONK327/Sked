const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

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
        },
        shortname: {
            type: DataTypes.STRING(24),
            allowNull: false
        },
        last_refresh: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'teachers',
        timestamps: false,
    }
)

module.exports = Teacher;