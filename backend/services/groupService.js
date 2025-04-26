const GroupRepository = require('../repositories/groupRepository');
const ApiService = require('./apiService');

const groupRepository = new GroupRepository();
const apiService = new ApiService();

class GroupService {
    constructor() {
        this.groupRepository = groupRepository;
        this.apiService = apiService;
    }

    async getGroupSchedule(name) {
        const group = await this.groupRepository.findByName(name);
        if (!group) {
            throw ApiError.NotFound('Group not found');
        }
        const schedule = await this.apiService.fetchSchedule("Group", group.id);
        return this.formatSchedule(schedule);
    }

    formatSchedule(schedule) {
        return {
            type: "group",
            name: schedule.name,
            lessons: schedule.weeks.flatMap(week => 
                week.days.flatMap(day => 
                day.classes
                    .filter(classObj => classObj.lessons.length > 0)
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
            return [{ name: "", room: "спорткомплекс", subgroup: "" }];
        }
        return lesson.teachers.map(teacher => ({
            name: teacher?.name,
            room: teacher?.room?.name,
            subgroup: teacher?.group?.subgroup
        }));
    }
}

module.exports = GroupService;