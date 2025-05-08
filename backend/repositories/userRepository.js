const { Op } = require('sequelize');
const UserModel = require('../models/userModel');

class UserRepository {
    constructor() {
        this.model = UserModel;
    }

    async findById(userId) {
        try {
            const user = await UserModel.findByPk(userId);
            return user;
        } catch (error) {
            throw error;
        }
    }

    async createOne(userData) {
        try {
            const user = await UserModel.create(userData);
            return user;
        } catch (error) {
            throw error;
        }
    }

    async updateOne(userData) {
        try {
            const user = await UserModel.update(userData, {
                where: { id: userData.id}
            });
            return user;
        } catch (error) {
            throw error;
        }
    }

    async findAllByTeacherIdAndGroupId(data) {
        try {
            const users = await UserModel.findAll({
                attributes: [
                    'id',
                    'firstname'
                ],
                where: {
                    [Op.or]: [
                        {teacher_id: [...data.teachers]},
                        {group_id: [...data.groups]}
                    ]
                },
                raw: true
            })
            return users;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = UserRepository;