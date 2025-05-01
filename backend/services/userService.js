const GroupRepository = require('../repositories/groupRepository');
const RoomRepository = require('../repositories/roomRepository');
const TeacherRepository = require('../repositories/teacherRepository');
const LessonRepository = require('../repositories/lessonRepository');
const UserRepository = require('../repositories/userRepository');
const ConverterSchedule = require('../utils/convertSchedule');

const groupRepository = new GroupRepository();
const roomRepository = new RoomRepository();
const teacherRepository = new TeacherRepository();
const lessonRepository = new LessonRepository();
const userRepository = new UserRepository();
const convertSchedule = new ConverterSchedule();


class UserService {
    constructor() {
        this.groupRepository = groupRepository;
        this.roomRepository = roomRepository;
        this.teacherRepository = teacherRepository;
        this.lessonRepository = lessonRepository;
        this.userRepository = userRepository;
        this.converterSchedule = convertSchedule;
    }

    async getScheduleByUserAndData(userData) {
        const user = await this.userRepository.findById(userData.id);

        if (!user)
            await this.userRepository.createOne(userData);
        else if (user.username !== userData.username && user.firstname !== userData.firstname)
            await this.userRepository.updateOne(userData);

        const { type, id } = await this._getTypeAndId(user);
        const schedule = await this._getSchedule(type, id);
        const data = await this._getData();
        return {
            schedule: schedule,
            data: data
        };
    }

    async changeUserType(userData) {
        const user = await this.userRepository.findById(userData.id);

        if (!user)
            throw { name: "NotFoundError", message: "User not found" };
        if (userData.type !== "group" && userData.type !== "teacher")
            throw { name: "IncorrectBodyError", message: "Incorrent form body for change first schedule" }
        
        const { type, id } = await this._getTypeAndId(user);
        const name = await this._getName(type, id);

        if (!(type === userData.type && name === userData.name)) {
            const data = { id: userData.id, group_id: null, teacher_id: null }
            if (userData.type == "group") {
                const group = await groupRepository.findByName(userData.name)
                if (!group)
                    throw { name: "NotFoundError", message: `Group '${userData.name}' not found` };
                data.group_id = group.id
            }
            else {
                const teacher = await teacherRepository.findByName(userData.name)
                if (!teacher)
                    throw { name: "NotFoundError", message: `Teacher '${userData.name}' not found` }
                data.teacher_id = teacher.id
            }
            try {
                await this.userRepository.updateOne(data);
            } catch (error) {
                throw error;
            }
        }
        return { message: "Successful change"}
    }

    async _getTypeAndId(user) {
        if (user?.group_id)
            return { type: "group", id: user.group_id }
        else if (user?.teacher_id)
            return { type: "teacher", id: user.teacher_id }
        else
            return { type: "", id: -1 }
    }

    async _getName(type, id) {
        if (type == "group") {
            return (await this.groupRepository.findById(id)).name;
        } else if (type == "teacher") {
            return (await this.teacherRepository.findById(id)).shortname;
        } else {
            return undefined;
        }
    }

    async _getSchedule(type, id) {
        if (type == "group") {
            const schedule = await this.lessonRepository.findByGroup(id);
            const result = this.converterSchedule.convertMiddleToPresentGroup(this.converterSchedule.convertDBToMiddle(schedule));
            return result;    
        } else if (type == "teacher") {
            const schedule = await this.lessonRepository.findByTeacher(id);
            const result = this.converterSchedule.convertMiddleToPresentTeacher(this.converterSchedule.convertDBToMiddle(schedule));
            return result;
        } else {
            return {};
        }
    }

    async _getData() {
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