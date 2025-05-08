const { group } = require('console');

class ConverterSchedule {
    _isSameLesson = (prevLesson, currLesson) =>
        prevLesson && currLesson &&
        prevLesson.number_week == currLesson.number_week &&
        prevLesson.number_day == currLesson.number_day &&
        prevLesson.number == currLesson.number
    ;

    convertAPIRoomToDB(scheduleAPI) {
        return scheduleAPI.weeks.flatMap(week =>
            week.days.flatMap(day => 
                day.classes.flatMap(classObj => {
                    if (classObj.lessons != "null") {
                        const lesson = classObj.lessons[0];
                        const groups = new Set();
                        return lesson.teachers.flatMap(teacher =>
                            teacher.groups
                            .filter(group => +scheduleAPI.id != 1843 || !groups.has(group.id))
                            .flatMap(group => {
                                groups.add(group.id);
                                return {
                                    number_week: +week.number,
                                    number_day: +day.number,
                                    number: +classObj.number,
                                    name: lesson.name,
                                    type: lesson.type == 'lec' ? 'lection' : 'seminar',
                                    teacher_id: +scheduleAPI.id != 1843 ? +teacher.id : 0,
                                    room_id: +scheduleAPI.id,
                                    group_id: +group.id,
                                    subgroup: +group.name.split('/')[1] || null
                                }
                            })
                        )
                    }
                })
            )
        ).filter(lesson => lesson != null)
    }

    convertDBToPresentGroup(scheduleDB) {
        return {
            type: "group",
            name: scheduleDB[0].group_name,
            lessons: scheduleDB.reduce((lessons, lesson, index, scheduleDB) => {
                if (this._isSameLesson(scheduleDB[index-1], lesson)) {
                    lessons[lessons.length - 1].details.push({
                        name: lesson.teacher_fullname,
                        room: lesson.room_name,
                        subgroup: lesson.subgroup || ""
                    })
                    return lessons;
                }
                return [...lessons, {
                    numberWeek: lesson.number_week,
                    numberDay: lesson.number_day,
                    number: lesson.number,
                    name: lesson.name,
                    type: lesson.type,
                    details: [{
                        name: lesson.teacher_fullname,
                        room: lesson.room_name,
                        subgroup: lesson.subgroup || ""
                    }]
                }]
            }, [])
        }
    }

    convertDBToPresentTeacher(scheduleDB) {
        return {
            type: "teacher",
            name: scheduleDB[0].teacher_fullname,
            lessons: scheduleDB.reduce((lessons, lesson, index, scheduleDB) => {
                if (this._isSameLesson(scheduleDB[index-1], lesson)) {
                    lessons[lessons.length - 1].details.push({
                        group: lesson.group_name,
                        subgroup: lesson.subgroup || ""
                    })
                    return lessons;
                }
                return [...lessons, {
                    numberWeek: lesson.number_week,
                    numberDay: lesson.number_day,
                    number: lesson.number,
                    name: lesson.name,
                    type: lesson.type,
                    room: lesson.room_name,
                    details: [{
                        group: lesson.group_name,
                        subgroup: lesson.subgroup || ""
                    }]
                }]
            }, [])
        }
    }

    convertDBToPresentRoom(scheduleDB) {
        const _isSameTeacher = (prevLesson, currLesson) => 
            prevLesson && currLesson &&
            prevLesson.teacher_id == currLesson.teacher_id
        ;
        return {
            type: "room",
            name: scheduleDB[0].room_name,
            lessons: scheduleDB.reduce((lessons, lesson, index, scheduleDB) => {
                if (this._isSameLesson(scheduleDB[index-1], lesson)) {
                    if (_isSameTeacher(scheduleDB[index-1], lesson))
                        lessons[lessons.length - 1].details[0].groups.push({
                            group: lesson.group_name,
                            subgroup: lesson.subgroup || ""
                        });
                    else
                        lessons[lessons.length - 1].details.push({
                            name: lesson.teacher_fullname,
                            groups: [{
                                group: lesson.group_name,
                                subgroup: lesson.subgroup || ""
                            }]
                        });
                    return lessons;
                }
                return [...lessons, {
                    numberWeek: lesson.number_week,
                    numberDay: lesson.number_day,
                    number: lesson.number,
                    name: lesson.name,
                    type: lesson.type,
                    details: [{
                        name: lesson.teacher_fullname,
                        groups: [{
                            group: lesson.group_name,
                            subgroup: lesson.subgroup || ""
                        }]
                    }]
                }]
            }, [])
        }
    }

    convertAPIRoomToMiddle(scheduleAPI) {
        return scheduleAPI.weeks.flatMap(week =>
            week.days.flatMap(day =>
                day.classes.flatMap(classObj => {
                    if (classObj.lessons != "null") {
                        const lesson = classObj.lessons[0];
                        const groups = new Set();
                        return {
                            numberWeek: +week.number,
                            numberDay: +day.number,
                            number: +classObj.number,
                            name: lesson.name,
                            type: lesson.type == 'lec' ? 'lection' : 'seminar',
                            details: lesson.teachers.flatMap(teacher => 
                                teacher.groups
                                .filter(group => !groups.has(group.id) || +scheduleAPI.id != 1843)
                                .flatMap(group => {
                                    groups.add(group.id)
                                    return {
                                        teacher: +scheduleAPI.id != 1843 ? +teacher.id : 0,
                                        room: +scheduleAPI.id,
                                        group: +group.id,
                                        subgroup: +group.name.split('/')[1] || null
                                    }
                                })
                            )
                        };
                    }
                    return {
                        numberWeek: +week.number,
                        numberDay: +day.number,
                        number: +classObj.number,
                        name: null,
                        type: null,
                        details: []
                    };
                })
            )
        )
    }

    convertDBToMiddle(scheduleDB) {
        const result = [];

        const current = {
            numberWeek: 1,
            numberDay: 1,
            number: 1,
            index: 0
        }

        while (current.numberWeek <= 2) {
            const currentLesson = scheduleDB[current.index];
            const nextLesson = scheduleDB[current.index + 1];
            const prevLesson = scheduleDB[current.index - 1];
            const isSameLessonNext = this._isSameLesson(currentLesson, nextLesson);
            const isSameLessonPrev = this._isSameLesson(currentLesson, prevLesson);
            const isCurrent =
                currentLesson &&
                current.numberWeek == currentLesson.number_week &&
                current.numberDay == currentLesson.number_day &&
                current.number == currentLesson.number;
            if (isCurrent) {
                if (isSameLessonPrev) {
                    result[result.length - 1].details.push({
                        id: +currentLesson.id,
                        teacher: +currentLesson.teacher_id,
                        group: +currentLesson.group_id,
                        subgroup: +currentLesson.subgroup || null
                    });
                } else {
                    result.push({
                        numberWeek: +currentLesson.number_week,
                        numberDay: +currentLesson.number_day,
                        number: +currentLesson.number,
                        name: currentLesson.name,
                        type: currentLesson.type,
                        details: [
                            {
                                id: +currentLesson.id,
                                teacher: +currentLesson.teacher_id,
                                group: +currentLesson.group_id,
                                subgroup: +currentLesson.subgroup || null
                            }
                        ]
                    });
                }
                current.index++;
            } else {
                result.push({
                    numberWeek: current.numberWeek,
                    numberDay: current.numberDay,
                    number: current.number,
                    name: null,
                    type: null,
                    details: []
                });
            }
            if (!(isCurrent && isSameLessonNext)) {
                current.number++;
                if (current.number > 6) {
                    current.number = 1;
                    current.numberDay++;
                }
                if (current.numberDay > 6) {
                    current.numberDay = 1;
                    current.numberWeek++;
                }
            }
        }
        return result
    }

    _testAPIRoomToDB() {
        var fs = require('fs');
        const schedule = require('./jsonExamples/API/ScheduleRoomAPI.json');
        const newSchedule = this.convertAPIRoomToDB(schedule);
        fs.writeFileSync('./utils/jsonExamples/test/scheduleDB.json', JSON.stringify(newSchedule, null, 4));
    }

    _testAPIRoomSportToDB() {
        var fs = require('fs');
        const schedule = require('./jsonExamples/API/ScheduleRoomSportAPI.json');
        const newSchedule = this.convertAPIRoomToDB(schedule);
        fs.writeFileSync('./utils/jsonExamples/test/scheduleDB.json', JSON.stringify(newSchedule, null, 4));
    }

    _testDBToPresentGroup() {
        var fs = require('fs');
        const schedule = require('./jsonExamples/DB/ScheduleDBInput.json');
        const newSchedule = this.convertDBToPresentGroup(schedule);
        fs.writeFileSync('./utils/jsonExamples/test/schedulePresentGroup.json', JSON.stringify(newSchedule, null, 4));
    }

    _testAPIRoomToMiddle() {
        var fs = require('fs');
        const schedule = require('./jsonExamples/test/scheduleAPI.json');
        const newSchedule = this.convertAPIRoomToMiddle(schedule);
        fs.writeFileSync('./utils/jsonExamples/test/scheduleMiddleAPI.json', JSON.stringify(newSchedule, null, 4));
    }

    _testAPIRoomSportToMiddle() {
        var fs = require('fs');
        const schedule = require('./jsonExamples/test/scheduleAPI.json');
        const newSchedule = this.convertAPIRoomToMiddle(schedule);
        fs.writeFileSync('./utils/jsonExamples/test/scheduleMiddleAPI.json', JSON.stringify(newSchedule, null, 4));
    }

    _testDBtoMiddle() {
        var fs = require('fs');
        const schedule = require('./jsonExamples/test/scheduleDB.json');
        const newSchedule = this.convertDBToMiddle(schedule);
        fs.writeFileSync('./utils/jsonExamples/test/scheduleMiddleDB.json', JSON.stringify(newSchedule, null, 4));
    }
}

module.exports = ConverterSchedule;