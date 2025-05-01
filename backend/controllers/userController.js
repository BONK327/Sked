const UserService = require("../services/userService");
const userService = new UserService();

class UserController {
    constructor() {
        this.userService = userService;
    }

    async getScheduleByUserAndData(req, res) {
        try {
            if (!req.body?.id || !req.body?.firstname || !req.body?.username)
                throw {
                    name: "IncorrectBodyError",
                    message: "Incorrect form body for get schedule and data"
                }
            const user = {
                id: req.body.id,
                firstname: req.body.firstname,
                username: req.body.username
            };
            const response = await this.userService.getScheduleByUserAndData(user);
            res.json(response);
        } catch (error) {
            if (error.name == "IncorrectBodyError") {
                res.status(400).json(error);
            } else {
                res.status(500).json(error);
            }
        }
    }

    async updateUser(req, res) {
        try {
            if (!req.body?.id || !req.body?.type || !req.body?.name)
                throw {
                    name: "IncorrectBodyError",
                    message: "Incorrect form body for change first schedule"
                }
            const user = {
                id: req.body.id,
                type: req.body.type,
                name: req.body.name
            }
            const response = await this.userService.changeUserType(user);
            res.json(response);
        } catch (error) {
            if (error.name == "IncorrectBodyError") {
                res.status(400).json(error);
            } else if (error.name == "NotFoundError") {
                res.status(404).json(error);
            } else {
                res.status(500).json(error);
            }
        }
    }
}

module.exports = UserController;