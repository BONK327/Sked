const RoomRepository = require('../repositories/roomRepository');
const LessonRepository = require('../repositories/lessonRepository');
const ApiService = require('./apiService');
const ConverterSchedule = require('../utils/convertSchedule');

const roomRepository = new RoomRepository();
const lessonRepository = new LessonRepository();
const apiService = new ApiService();
const convertSchedule = new ConverterSchedule();

class RoomService {
    constructor() {
        this.roomRepository = roomRepository;
        this.lessonRepository = lessonRepository;
        this.apiService = apiService;
        this.converterSchedule = convertSchedule;
    }

    async getRoomSchedule(name) {
        try {
            const room = await this.roomRepository.findByName(name);
            if (!room) {
                throw {
                    name: "NotFoundError",
                    message: `Room '${name}' not found`
                };
            }
            const scheduleDB = await this.lessonRepository.findByRoom(room.id);
            const scheduleMiddle = this.converterSchedule.convertDBToMiddle(scheduleDB);
            const schedulePresent = this.converterSchedule.convertMiddleToPresentRoom(scheduleMiddle);
            schedulePresent.name = room.name
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

module.exports = RoomService;