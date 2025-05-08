const ApiService = require('../services/apiService');
const RoomRepository = require('../repositories/roomRepository.js');
const LessonService = require("../services/lessonService.js");
const ConverterSchedule = require('../utils/convertSchedule.js');

const apiService = new ApiService();
const lessonService = new LessonService();
const converterSchedule = new ConverterSchedule();
const roomRepository = new RoomRepository();


async function updateRoomSchedules() {
    lessonService.deleteLessons();
    const roomIds = (await roomRepository.findAll()).map(room => room.id);
    for (const roomId of roomIds) {
        const scheduleAPI = await apiService.fetchSchedule("Room", roomId);
        const scheduleDB = converterSchedule.convertAPIRoomToDB(scheduleAPI);
        await lessonService.createLessons(scheduleDB);
    }
}


updateRoomSchedules();
