const GroupRepository = require('../repositories/groupRepository');
const RoomRepository = require('../repositories/roomRepository');
const TeacherRepository = require('../repositories/teacherRepository');
// const UserRepository = require('../repositories/userRepository');

const groupRepository = new GroupRepository();
const roomRepository = new RoomRepository();
const teacherRepository = new TeacherRepository();
// const userRepository = new UserRepository();


class UserService {
    constructor() {
        this.groupRepository = groupRepository;
        this.roomRepository = roomRepository;
        this.teacherRepository = teacherRepository;
        // this.userRepository = userRepository;
    }

    async getScheduleByUserAndData(user) {
        const { type, id } = await this.updateAndGetDataUser(user);
        const schedule = await this.getSchedule(type, id);
        const data = await this.getData();
        return {
            schedule: schedule,
            data: data
        };
    }

    async updateAndGetDataUser(user) {
        // Запрос к БД на получении данных об user.id в userDB
        // Если данные разные (user и userDB), то записать в БД новые
        // Вывести тип расписания и id сущности
        return {
            type: "group",
            id: 3856
        };
    }

    async getSchedule(type, id) {
        // Получить расписание в общем виде
        // Преобразовать расписание в зависимости от type
        // Вернуть расписание
        return {};
    }

    async getData() {
        const groups = (await this.groupRepository.findAll()).map(group => group.name);
        const teachers = (await this.teacherRepository.findAll()).map(teacher => teacher.shortname);
        const rooms = (await this.roomRepository.findAll()).map(room => room.name);
        return {
            groups: groups,
            teachers: teachers,
            rooms: rooms
        }
    }
}

module.exports = UserService;