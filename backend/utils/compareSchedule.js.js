function compareSchedule(scheduleDB, scheduleAPI) {
    scheduleDB.sort(sortSchedule)
    scheduleAPI.sort(sortSchedule)
    const result = {
        flagChange: true,
        groups: new Set(),
        teachers: new Set(),
        create: [],
        delete: []
    }
    
    for (let index = 0; index < 6*6*2; index++) {
        const lessonDB = scheduleDB[index];
        const lessonAPI = scheduleAPI[index];
        if (
            (lessonDB.name != lessonAPI.name ||
            lessonDB.type != lessonAPI.type) &&
            false // Заглушка
        ) {
            result.flagChange = false;
            for (const detail of lessonDB.details) {
                result.groups.add(detail.group);
                result.teachers.add(detail.teacher);
                result.delete.push(detail.id);
            }
            for (const detail of lessonAPI.details) {
                result.groups.add(detail.group);
                result.teachers.add(detail.teacher);
                result.create.push({
                    number_week: lessonAPI.numberWeek,
                    number_day: lessonAPI.numberDay,
                    number: lessonAPI.number,
                    name: lessonAPI.name,
                    type: lessonAPI.type,
                    teacher_id: detail.teacher,
                    room_id: detail.room,
                    group_id: detail.group,
                    subgroup: detail.subgroup
                })
            }
        } else {
            for (const detailDB of lessonDB.details) {
                const sameDetailAPI = lessonAPI.details.find(detailAPI => 
                    detailDB.teacher == detailAPI.teacher &&
                    detailDB.group == detailAPI.group &&
                    detailDB.subgroup == detailAPI.subgroup
                );
                if (!sameDetailAPI) {
                    result.flagChange = false;
                    result.groups.add(detailDB.group);
                    result.teachers.add(detailDB.teacher);
                    result.delete.push(detailDB.id);
                }
            }
            for (const detailAPI of lessonAPI.details) {
                const sameDetailDB = lessonDB.details.find(detailDB => 
                    detailAPI.teacher == detailDB.teacher &&
                    detailAPI.group == detailDB.group &&
                    detailAPI.subgroup == detailDB.subgroup
                );
                if (!sameDetailDB) {
                    result.flagChange = false;
                    result.groups.add(detailAPI.group);
                    result.teachers.add(detailAPI.teacher);
                    result.create.push({
                        number_week: lessonAPI.numberWeek,
                        number_day: lessonAPI.numberDay,
                        number: lessonAPI.number,
                        name: lessonAPI.name,
                        type: lessonAPI.type,
                        teacher_id: detailAPI.teacher,
                        room_id: detailAPI.room,
                        group_id: detailAPI.group,
                        subgroup: detailAPI.subgroup
                    })
                }
            }
        }
    }
    return result
}

const sortSchedule = (a, b) =>
    a.numberWeek <= b.numberWeek &&
    a.numberDay <= b.numberDay &&
    a.number <= b.number


const sortDetails = (a, b) => {
    a.group <= b.group &&
    a.subgroup <= b.subgroup &&
    a.teacher <= b.teacher
}


// const scheduleAPI = require('./jsonExamples/test/scheduleMiddleAPI.json');
// const scheduleDB = require('./jsonExamples/test/scheduleMiddleDB.json');
// console.log(compareSchedule(scheduleDB, scheduleAPI));

module.exports = compareSchedule;