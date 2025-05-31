const axios = require('axios');
require('dotenv').config();
const LessonRepository = require("../repositories/lessonRepository");
const RoomRepository = require("../repositories/roomRepository");
const ApiService = require("../services/apiService");
const ConverterSchedule = require("../utils/convertSchedule");
const compareSchedule = require("../utils/compareSchedule.js");
const UserRepository = require("../repositories/userRepository.js");

const roomRepository = new RoomRepository();
const lessonRepository = new LessonRepository();
const userRepository = new UserRepository();
const apiService = new ApiService();
const converterSchedule = new ConverterSchedule();

async function main() {
    const roomIds = (await roomRepository.findAll()).map(room => room.id);
    console.log("Получен список всех аудиторий")
    const users = [];
    for (const roomId of roomIds) {
        const scheduleDB = await lessonRepository.findByRoom(roomId);
        const scheduleAPI = await apiService.getSchedule("Room", roomId);
        const scheduleMiddleDB = converterSchedule.convertDBToMiddle(scheduleDB);
        const scheduleMiddleAPI = converterSchedule.convertAPIRoomToMiddle(scheduleAPI);
        const result = compareSchedule(scheduleMiddleDB, scheduleMiddleAPI);
        
        if (result.create.length !== 0)
            lessonRepository.bulkCreate(result.create)
        if (result.delete.length !== 0)
            lessonRepository.deleteByIds(result.delete)

        const newUsers = await userRepository.findAllByTeacherIdAndGroupId(result);
        const uniqueNewUsers = newUsers.filter(
            user => !users.some(existingUser => existingUser.id === user.id)
        );
        users.push(...uniqueNewUsers);
    }
    console.log("Обновление расписание завершено")
    console.log("Получен список пользователей, которых надо оповестить")
    console.log("Оповещение")
    if (users.filter(user => user.notifications).length !== 0)
        await axios.post(`http://${process.env.IP_ADDRESS}:${process.env.TGBOT_PORT}/tgbot`, users.filter(user => user.notifications))
    console.log("Конец программы")
}


main();