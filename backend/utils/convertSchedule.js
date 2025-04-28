class ConverterSchedule {
    _convertLessonType(type) {
        return type == 'lec' ? "lection" : 'seminar';
    }

    _createLessonEntry(week, day, classObj, lesson, teacher, scheduleAPI) {
        const isPhysicalCulture = lesson.name === "Элективные курсы по физической культуре и спорту";
        
        return {
            numberWeek: week.number,
            numberDay: day.number,
            number: classObj.number,
            name: lesson.name,
            type: this._convertLessonType(lesson.type),
            teacher: {
                id: isPhysicalCulture ? 0 : +teacher.id,
                name: isPhysicalCulture ? "" : teacher.name
            },
            room: {
                id: +teacher.room.id || null,
                name: teacher.room.name
            },
            group: {
                id: +scheduleAPI.id,
                name: teacher.group.name,
                subgroup: teacher.group.subgroup
            }
        };
    }

    _createEmptyEntry(week, day, classObj) {
        return {
            numberWeek: week.number,
            numberDay: day.number,
            number: classObj.number,
            lesson: null,
            type: null,
            teacher: null,
            room: null,
            group: null
        };
    }

    convertAPIGroupToMiddle(ScheduleAPI) {
        return ScheduleAPI.weeks.flatMap(week =>
            week.days.flatMap(day =>
                day.classes.flatMap(classObj => {
                    if (classObj.lessons.length === 0) {
                        return [this._createEmptyEntry(week, day, classObj)];
                    }

                    return classObj.lessons.flatMap(lesson =>
                        lesson.teachers.map(teacher => 
                            this._createLessonEntry(week, day, classObj, lesson, teacher, ScheduleAPI)
                        )
                    );
                })
            )
        );
    }

    convertAPITeacherToMiddle(ScheduleAPI) {
        return ScheduleAPI.weeks.flatMap(week =>
            week.days.flatMap(day =>
                day.classes.flatMap(classObj => {
                    if (!classObj.lessons || classObj.lessons === "null") {
                        return [this._createEmptyEntry(week, day, classObj)];
                    }

                    return classObj.lessons.flatMap(lesson =>
                        lesson.rooms.flatMap(room =>
                            room.groups.map(group => ({
                                numberWeek: week.number,
                                numberDay: day.number,
                                number: classObj.number,
                                lesson: lesson.name,
                                type: this._convertLessonType(lesson.type),
                                teacher: {
                                    id: +ScheduleAPI.id,
                                    name: ScheduleAPI.name
                                },
                                room: {
                                    id: +room.id,
                                    name: room.name
                                },
                                group: {
                                    id: +group.id,
                                    name: group.name.split('/')[0],
                                    subgroup: group.name.split('/')[1] || ''
                                }
                            }))
                        )
                    );
                })
            )
        );
    }

    convertAPIRoomToMiddle(ScheduleAPI) {
        const isSpecialRoom = ScheduleAPI.id === "000001843";
        const processedGroups = new Set();

        return ScheduleAPI.weeks.flatMap(week =>
            week.days.flatMap(day =>
                day.classes.flatMap(classObj => {
                    if (!classObj.lessons || classObj.lessons === "null") {
                        return [this._createEmptyEntry(week, day, classObj)];
                    }

                    return classObj.lessons.flatMap(lesson => {
                        if (isSpecialRoom) {
                            return lesson.teachers.flatMap(teacher =>
                                teacher.groups
                                    .filter(group => {
                                        const groupKey = `${group.id}`;
                                        if (processedGroups.has(groupKey)) return false;
                                        processedGroups.add(groupKey);
                                        return true;
                                    })
                                    .map(group => ({
                                        numberWeek: week.number,
                                        numberDay: day.number,
                                        number: classObj.number,
                                        name: lesson.name,
                                        type: this._convertLessonType(lesson.type),
                                        teacher: {
                                            id: +teacher.id,
                                            name: teacher.name
                                        },
                                        room: {
                                            id: +ScheduleAPI.id,
                                            name: ScheduleAPI.name
                                        },
                                        group: {
                                            id: +group.id,
                                            name: group.name.split('/')[0],
                                            subgroup: group.name.split('/')[1] || ''
                                        }
                                    }))
                            );
                        }

                        return lesson.teachers.flatMap(teacher =>
                            teacher.groups.map(group => ({
                                numberWeek: week.number,
                                numberDay: day.number,
                                number: classObj.number,
                                name: lesson.name,
                                type: this._convertLessonType(lesson.type),
                                teacher: {
                                    id: +teacher.id,
                                    name: teacher.name
                                },
                                room: {
                                    id: +ScheduleAPI.id,
                                    name: ScheduleAPI.name
                                },
                                group: {
                                    id: +group.id,
                                    name: group.name.split('/')[0],
                                    subgroup: group.name.split('/')[1] || ''
                                }
                            }))
                        );
                    });
                })
            )
        );
    }

    convertMiddleToDB(ScheduleMiddle) {
        const result = [];
        ScheduleMiddle.forEach(lesson => {
            if (lesson.name) {
                result.push({
                    number_week: +lesson.numberWeek,
                    number_day: +lesson.numberDay,
                    number: lesson.number,
                    name: lesson.name,
                    type: lesson.type,
                    teacher_id: +lesson.teacher.id,
                    room_id: +lesson.room.id,
                    group_id: +lesson.group.id,
                    subgroup: (lesson.group.subgroup) ? +lesson.group.subgroup : null
                });
            }
        });
        return result;
    }

    convertDBToMiddle(ScheduleDB) {
        const result = [];

        const current = {
            numberWeek: 1,
            numberDay: 1,
            number: 1,
            index: 0
        }

        while (current.index < ScheduleDB.length && current.numberWeek <= 2) {
            const currentLesson = ScheduleDB[current.index];
            const nextLesson = ScheduleDB[current.index + 1];
            const flag =
                currentLesson.number == nextLesson?.number &&
                currentLesson.number_day == nextLesson?.number_day &&
                currentLesson.number_week == nextLesson?.number_week;
            const same = current.numberWeek == currentLesson.number_week &&
                current.numberDay == currentLesson.number_day &&
                current.number == currentLesson.number;
            
            if (same) {
                result.push({
                    numberWeek: currentLesson.number_week,
                    numberDay: currentLesson.number_day,
                    number: currentLesson.number,
                    name: currentLesson.name,
                    type: currentLesson.type,
                    teacher: {
                        id: currentLesson.teacher_id,
                        name: currentLesson.teacher_fullname
                    },
                    room: {
                        id: currentLesson.room_id,
                        name: currentLesson.room_name
                    },
                    group: {
                        id: currentLesson.group_id,
                        name: currentLesson.group_name,
                        subgroup: currentLesson.subgroup
                    }
                })
                current.index++;
            } else {
                result.push({
                    numberWeek: current.numberWeek,
                    numberDay: current.numberDay,
                    number: current.number,
                    name: null,
                    type: null,
                    teacher: null,
                    room: null,
                    group: null
                })
            }
            if ((true && !same) || !flag) {
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

    convertMiddleToPresentGroup(ScheduleMiddle) {
        const result = {
            type: "group",
            name: "",
            lessons: []
        }
        for (let index in ScheduleMiddle) {
            const element = ScheduleMiddle[index];
            if (element.name) {
                const lastElement = ScheduleMiddle[index-1];
                if (!(
                    lastElement &&
                    lastElement.numberWeek == element.numberWeek &&
                    lastElement.numberDay == element.numberDay &&
                    lastElement.number == element.number
                )) {
                    result.lessons.push({
                        numberWeek: element.numberWeek,
                        numberDay: element.numberDay,
                        number: element.number,
                        lesson: element.name,
                        type: element.type,
                        details: [
                            {
                                name: element.teacher.name,
                                room: element.room.name,
                                subgroup: element.group.subgroup || ""
                            }
        
                        ]
                    })
                } else {
                    result.lessons[result.lessons.length-1].details.push({
                        name: element.teacher.name,
                        room: element.room.name,
                        subgroup: element.group.subgroup || ""
                    })
                }
            }
        }
        return result;
    }

    convertMiddleToPresentTeacher(ScheduleMiddle) {
        const result = {
            type: "teacher",
            name: "",
            lessons: []
        }
        for (let index in ScheduleMiddle) {
            const element = ScheduleMiddle[index];
            if (element.name) {
                const lastElement = ScheduleMiddle[index-1];
                if (!(
                    lastElement &&
                    lastElement.numberWeek == element.numberWeek &&
                    lastElement.numberDay == element.numberDay &&
                    lastElement.number == element.number
                )) {
                    result.lessons.push({
                        numberWeek: element.numberWeek,
                        numberDay: element.numberDay,
                        number: element.number,
                        lesson: element.name,
                        type: element.type,
                        room: element.room.name,
                        details: [
                            {
                                group: element.group.name,
                                subgroup: element.group.subgroup || ""
                            }
        
                        ]
                    })
                } else {
                    result.lessons[result.lessons.length-1].details.push({
                        group: element.group.name,
                        subgroup: element.group.subgroup || ""
                    })
                }
            }
        }
        return result;
    }

    convertMiddleToPresentRoom(ScheduleMiddle) {
        const result = {
            type: "room",
            name: "",
            lessons: []
        }
        for (let index in ScheduleMiddle) {
            const element = ScheduleMiddle[index];
            if (element.name) {
                const lastElement = ScheduleMiddle[index-1];
                if (!(
                    lastElement &&
                    lastElement.numberWeek == element.numberWeek &&
                    lastElement.numberDay == element.numberDay &&
                    lastElement.number == element.number
                )) {
                    result.lessons.push({
                        numberWeek: element.numberWeek,
                        numberDay: element.numberDay,
                        number: element.number,
                        lesson: element.name,
                        type: element.type,
                        details: [
                            {
                                name: element.teacher.name,
                                groups: [
                                    {
                                        group: element.group.name,
                                        subgroup: element.group.subgroup || ""
                                    }
                                ]
                            }
                        ]
                    })
                } else {
                    if (lastElement.teacher.name != element.teacher.name) {
                        result.lessons[result.lessons.length-1].details.push({
                            name: element.teacher.name,
                            groups: [
                                {
                                    group: element.group.name,
                                    subgroup: element.group.subgroup || ""
                                }
                            ]
                        })
                    } else {
                        result.lessons[result.lessons.length-1].details[0].groups.push({
                            group: element.group.name,
                            subgroup: element.group.subgroup || ""
                        })
                    }
                }
            }
        }
        return result;
    }
}

module.exports = ConverterSchedule;

// var fs = require('fs');
// const schedule = require('./jsonExamples/DB/ScheduleDBInput.json');
// const newSchedule = (new ConverterSchedule).convertDBToMiddle(schedule);
// fs.writeFileSync('./utils/jsonExamples/Middle/ScheduleMiddle.json', JSON.stringify(newSchedule, null, 4));
