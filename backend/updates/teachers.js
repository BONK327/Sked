const axios = require("axios");
require("dotenv").config();

const TeacherRepository = require('../repositories/teacherRepository.js')

const username = process.env.API_LOGIN;
const password = process.env.API_PASSWORD;
const token = process.env.API_TOKEN;
const teacherRepository = new TeacherRepository();

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
            newTeacher.shortname = newTeacher.lastname + ' ' + newTeacher.firstname[0];
            if (fullname[2]) {
                newTeacher.middlename = fullname[2];
                newTeacher.shortname += ' ' + newTeacher.middlename[0];
            }
            newTeachers.push(newTeacher);
        })

        
        await teacherRepository.deleteAll();
        await teacherRepository.bulkCreate(newTeachers);
    } catch (error) {
        console.error('Error:', error.message);
    }
}


updateTeachers();