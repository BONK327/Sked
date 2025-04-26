const express = require('express');
const roomRouter = express.Router();
const axios = require('axios');
const RoomService = require('../services/rooms');
require("dotenv").config();

const username = process.env.API_LOGIN;
const password = process.env.API_PASSWORD;
const token = process.env.API_TOKEN;
const roomService = new RoomService();

roomRouter.get('/:name', async (req, res) => {
    const name = req.params.name;
    try {
        const roomId = (await roomService.findByName(name)).dataValues.id.toString().padStart(9, '0');
        
        const schedule = (await axios.get(`https://university.kubsau.ru/kubsau/hs/csData/GetByRoom/${roomId}`, {
            headers: {
                'Token': token,
                'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
            }
        })).data;

        const newSchedule = {
            type: "room",
            name: schedule.name,
            lessons: []
        };
        schedule.weeks.forEach(week => {
            week.days.forEach(day => {
                day.classes.forEach(classObj => {
                    if (classObj.lessons != "null") {
                        const lesson = {
                            numberWeek: week.number,
                            numberDay: day.number,
                            number: classObj.number,
                            name: classObj.lessons[0].name,
                            type: classObj.lessons[0].type == 'lec' ? 'lection' : "seminar",
                            details: []
                        }
                        classObj.lessons[0]?.teachers.forEach(teacher => {
                            const newTeacher = {
                                name: teacher?.name,
                                groups: []
                            };
                            teacher.groups.forEach(group => {
                                const [ nameGroup, subgroup ] = group.name.split('/');
                                const newGroup = {
                                    group: nameGroup,
                                    subgroup: subgroup || ""
                                };
                                newTeacher.groups.push(newGroup);
                            })
                            lesson.details.push(newTeacher)
                        });
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

module.exports = roomRouter;
