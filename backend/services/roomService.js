const RoomRepository = require('../repositories/roomRepository');
const ApiService = require('./apiService');

const roomRepository = new RoomRepository();
const apiService = new ApiService();

class RoomService {
    constructor() {
        this.roomRepository = roomRepository;
        this.apiService = apiService;
    }

    async getRoomSchedule(name) {
        const room = await this.roomRepository.findByName(name);
        if (!room) {
            throw ApiError.NotFound('Room not found');
        }
        const schedule = await this.apiService.fetchSchedule("Room", room.id);
        return this.formatSchedule(schedule);
    }

    formatSchedule(schedule) {
        return {
            type: "room",
            name: schedule.name,
            lessons: schedule.weeks.flatMap(week => 
                week.days.flatMap(day => 
                day.classes
                    .filter(classObj => classObj.lessons != "null")
                    .map(classObj => this.formatLesson(week, day, classObj))
                )
            )
        };
    }

    formatLesson(week, day, classObj) {
        const lesson = classObj.lessons[0];
        return {
            numberWeek: week.number,
            numberDay: day.number,
            number: classObj.number,
            name: lesson.name,
            type: lesson.type === 'lec' ? 'lection' : 'seminar',
            details: this.formatDetails(lesson)
        };
    }

    formatDetails(lesson) {
        if (lesson.name === "Элективные курсы по физической культуре и спорту") {
            return [{ name: "", room: "спорткомплекс", subroom: "" }];
        }
        return lesson.teachers.map(teacher => ({
            name: teacher?.name,
            groups: this.formatGroups(teacher?.groups),
        }));
    }

    formatGroups(groups) {
        return groups.map(group => {
            const [ name, subgroup ] = group.name.split('/');
            return {
                group: name,
                subgroup: subgroup || ""
            }
        }) 
    }
}

module.exports = RoomService;