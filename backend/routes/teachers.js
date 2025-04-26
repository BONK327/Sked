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
        
        const newSchedule = {
            type: "teacher",
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
                            name: classObj.lessons[0]?.name,
                            type: classObj.lessons[0].type == 'lec' ? 'lection' : "seminar",
                            room: classObj.lessons[0]?.rooms[0]?.name,
                            details: []
                        };
                        classObj.lessons[0]?.rooms[0].groups.forEach(group => {
                            const [ nameGroup, subgroup ] = group.name.split('/');
                            const newGroup = {
                                group: nameGroup,
                                subgroup: subgroup || ""
                            };
                            lesson.details.push(newGroup)
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

module.exports = teacherRouter;