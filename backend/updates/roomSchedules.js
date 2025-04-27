const axios = require("axios");
require("dotenv").config();
const ApiService = require('../services/apiService');
const apiService = new ApiService();
const RoomRepository = require('../repositories/roomRepository.js');
const LessonService = require("../services/lessonService.js");

const username = process.env.API_LOGIN;
const password = process.env.API_PASSWORD;
const token = process.env.API_TOKEN;
const roomRepository = new RoomRepository();
const lessonService = new LessonService();

async function updateRoomSchedules() {
    lessonService.deleteLessons(11, "11");
    const roomIds = (await roomRepository.findAll()).map(room => room.id);
    const roomSchedules = []
    for (const roomId of roomIds) {
        const schedule = await apiService.fetchSchedule("Room", roomId);
        lessonService.createLessons(formatSchedule(schedule));
    }
}


updateRoomSchedules();


function formatSchedule(schedule) {
    if (schedule.id != "000001843")
        return schedule.weeks.flatMap(week => 
            week.days.flatMap(day => 
                day.classes
                    .filter(classObj => classObj.lessons != "null")
                    .flatMap(classObj => {
                        const lesson = classObj.lessons[0]
                        return {
                            lesson: {
                                number_week: String(week.number),
                                number_day: String(day.number),
                                number: String(classObj.number),
                                lesson: lesson.name,
                                type: lesson.type == 'lec' ? 'lection' : 'seminar'
                            },
                            lesson_details: lesson.teachers.flatMap(teacher => 
                                teacher.groups.flatMap(group => ({
                                    teacher_id: +teacher.id,
                                    room_id: +schedule.id,
                                    group_id: +group.id,
                                    subgroup: group.name.split('/')[1] || ""
                                }))
                            )
                        }
                    })
            )
        )
    else {
        return schedule.weeks.flatMap(week => 
            week.days.flatMap(day => 
                day.classes
                    .filter(classObj => classObj.lessons != "null")
                    .flatMap(classObj => {
                        const lesson = classObj.lessons[0]
                        const groups = [];
                        return {
                            lesson: {
                                number_week: String(week.number),
                                number_day: String(day.number),
                                number: String(classObj.number),
                                lesson: lesson.name,
                                type: lesson.type == 'lec' ? 'lection' : 'seminar'
                            },
                            lesson_details: lesson.teachers.flatMap(teacher => 
                                teacher.groups
                                    .flatMap(group => {
                                        if (!groups.includes(+group.id)) {
                                            groups.push(+group.id);
                                            return {
                                                teacher_id: +teacher.id,
                                                room_id: +schedule.id,
                                                group_id: +group.id,
                                                subgroup: group.name.split('/')[1] || ""
                                            }
                                        }
                                    })
                                    .filter(group => group != undefined)
                            )
                        }
                    })
            )
        )
    }
}