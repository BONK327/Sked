const UserService = require("../services/userService");
const userService = new UserService();

class UserController {
    constructor() {
        this.userService = userService;
    }

    async getAll(req, res) {
        try {
            const user = {
                id: req.body.id,
                firstname: req.body.firstname,
                username: req.body.username
            };
            const response = await this.userService.getAll(user);
            res.json(response);
        } catch (error) {
            
        }
    }
}

module.exports = UserController;