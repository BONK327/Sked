const GroupRepository = require('../repositories/groupRepository');
const LessonRepository = require('../repositories/lessonRepository');
const ConverterSchedule = require('../utils/convertSchedule');
const ApiService = require('./apiService');

const groupRepository = new GroupRepository();
const lessonRepository = new LessonRepository();
const apiService = new ApiService();
const converterSchedule = new ConverterSchedule();


class GroupService {
    constructor() {
        this.groupRepository = groupRepository;
        this.lessonRepository = lessonRepository;
        this.apiService = apiService;
        this.converterSchedule = converterSchedule;
    }

    async getGroupSchedule(name) {
        try {
            const group = await this.groupRepository.findByName(name);
            if (!group) {
                throw {
                    name: "NotFoundError",
                    message: `Group '${name}' not found`
                };
            }
            const scheduleDB = await this.lessonRepository.findByGroup(group.id);
            const scheduleMiddle = this.converterSchedule.convertDBToMiddle(scheduleDB);
            const schedulePresent = this.converterSchedule.convertMiddleToPresentGroup(scheduleMiddle);
            schedulePresent.name = group.name
            return schedulePresent;
        } catch (error) {
            if (error.name == "NotFoundError") {
                throw error
            } else {
                throw {
                    name: "DatabaseError",
                    message: "Not database connection"
                };  
            }
        }
    }
}

module.exports = GroupService;