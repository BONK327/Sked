const GroupRepository = require('../repositories/groupRepository');
const RoomRepository = require('../repositories/roomRepository');
const TeacherRepository = require('../repositories/teacherRepository');

const groupRepository = new GroupRepository();
const roomRepository = new RoomRepository();
const teacherRepository = new TeacherRepository();


class UserService {
    constructor() {
        this.groupRepository = groupRepository;
        this.roomRepository = roomRepository;
        this.teacherRepository = teacherRepository;
    }

    async getAll(user) {
        const groups = (await this.groupRepository.findAll()).map(group => group.name);
        const teachers = (await this.teacherRepository.findAll()).map(teacher => teacher.shortname);
        const rooms = (await this.roomRepository.findAll()).map(room => room.name);
        return {
            schedule: {},
            dsasdd: {
                groups: groups,
                teachers: teachers,
                rooms: rooms
            }
        };
    }
}

module.exports = UserService;