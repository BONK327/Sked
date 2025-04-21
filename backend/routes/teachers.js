const express = require('express');
const teacherRouter = express.Router();
const axios = require('axios');
const TeacherService = require('../services/teachers');
require("dotenv").config();

const username = process.env.API_LOGIN;
const password = process.env.API_PASSWORD;
const token = process.env.API_TOKEN;
const teacherService = new TeacherService();

teacherRouter.get('/:lastname', async (req, res) => {
    const lastname = req.params.lastname;
    try {
        const teacherId = (await teacherService.findByName(lastname)).dataValues.id.toString().padStart(9, '0');
        const schedule = (await axios.get(`https://university.kubsau.ru/kubsau/hs/csData/GetByTeacher/${teacherId}`, {
            headers: {
                'Token': token,
                'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
            }
        })).data;
        const newSchedule = { weeks: [] };
        schedule.weeks.forEach(week => {
            const newWeek = {
                number: week.number,
                days: []
            };
            week.days.forEach(day => {
                const newDay = {
                    number: day.number,
                    classes: []
                };
                day.classes.forEach(classObj => {
                    if (classObj.lessons != "null") {
                        const newClass = {
                            number: classObj.number,
                            lesson: {
                                name: classObj.lessons[0]?.name,
                                type: classObj.lessons[0]?.type,
                                room: {
                                    name: classObj.lessons[0]?.rooms[0].name,
                                    groups: []
                                }
                            }
                        };
                        classObj.lessons[0]?.rooms[0].groups.forEach(group => {
                            const newGroup = {
                                name: group.name,
                            };
                            newClass.lesson.room.groups.push(newGroup)
                        });
                        newDay.classes.push(newClass);
                    }
                })
                newWeek.days.push(newDay);
            })
            newSchedule.weeks.push(newWeek);
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

module.exports = teacherRouter;