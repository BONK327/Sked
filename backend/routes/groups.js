const express = require('express');
const groupRouter = express.Router();
const axios = require('axios');
const GroupService = require('../services/groups');
require("dotenv").config();

const username = process.env.API_LOGIN;
const password = process.env.API_PASSWORD;
const token = process.env.API_TOKEN;
const groupService = new GroupService();

groupRouter.get('/:name', async (req, res) => {
    const name = req.params.name;
    try {
        console.log(name)
        const groupId = (await groupService.findByName(name)).dataValues.id.toString().padStart(9, '0');
        console.log(groupId)
        
        const schedule = (await axios.get(`https://university.kubsau.ru/kubsau/hs/csData/GetByGroup/${groupId}`, {
            headers: {
                'Token': token,
                'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
            }
        })).data;

        const newSchedule = {
            type: "group",
            name: schedule.name,
            lessons: []
        };
        schedule.weeks.forEach(week => {
            week.days.forEach(day => {
                day.classes.forEach(classObj => {
                    if (classObj.lessons.length != 0) {
                        const lesson = {
                            numberWeek: week.number,
                            numberDay: day.number,
                            number: classObj.number,
                            name: classObj.lessons[0].name,
                            type: classObj.lessons[0].type == 'lec' ? 'lection' : "seminar",
                            details: []
                        }
                        if (lesson.name == "Элективные курсы по физической культуре и спорту") {
                            const newTeacher = {
                                name: "",
                                room: "спорткомплекс",
                                subgroup: ""
                            }
                            lesson.details.push(newTeacher)
                        } else {
                            classObj.lessons[0]?.teachers.forEach(teacher => {
                                const newTeacher = {
                                    name: teacher?.name,
                                    room: teacher?.room?.name,
                                    subgroup: teacher?.group?.subgroup
                                };
                                lesson.details.push(newTeacher)
                            });
                        }
                        newSchedule.lessons.push(lesson);
                    }
                })
            })
        });
        
        res.json(newSchedule);
    } catch (error) {
        console.error('Ошибка: ', error.message);
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении данных от API',
            error: error.message
        });
    }
});

module.exports = groupRouter;
