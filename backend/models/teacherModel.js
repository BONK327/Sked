const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");


const TeacherModel = sequelize.define("Teacher",
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            allowNull: false
        },
        lastname: {
            type: DataTypes.STRING(25),
            allowNull: false
        },
        firstname: {
            type: DataTypes.STRING(25),
            allowNull: false
        },
        middlename: {
            type: DataTypes.STRING(25),
            allowNull: true
        },
        shortname: {
            type: DataTypes.STRING(30),
            allowNull: false
        }
    }, {
        tableName: 'teachers',
        indexes: [
            {
                name: 'idx_shortname',
                type: 'FULLTEXT',
                fields: ['name']
            }
        ]
    }
)


const associate = models => {
    TeacherModel.hasMany(
        models.RelationshipUser,
        {
            foreignKey: "teacherId",
            as: "relationshipsUsers"
        }
    );

    TeacherModel.hasMany(
        models.Lesson,
        {
            foreignKey: "teacherId",
            as: "lessons"
        }
    )
}


module.exports = {
    model: TeacherModel,
    associate
};