const axios = require("axios");
require("dotenv").config();

const TeacherService = require('../services/teachers.js')

const username = process.env.API_LOGIN;
const password = process.env.API_PASSWORD;
const token = process.env.API_TOKEN;
const teacherService = new TeacherService();

async function updateTeachers() {
    try {
        const teachers = (await axios.get('https://university.kubsau.ru/kubsau/hs/csData/GetTeachers', {
            headers: {
                'Token': token,
                'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
            }
        })).data.teachers;
        const newTeachers = []
        
        teachers.forEach(teacher => {
            const newTeacher = {
                id: teacher.id
            };
            const fullname = teacher.name.split(' ');
            newTeacher.lastname = fullname[0];
            newTeacher.firstname = fullname[1];
            if (fullname[2]) 
                newTeacher.middlename = fullname[2];
            newTeachers.push(newTeacher);
        })

        
        await teacherService.deleteAll();
        await teacherService.createMultiple(newTeachers);
    } catch (error) {
        console.error('Error:', error.message);
    }
}


updateTeachers();