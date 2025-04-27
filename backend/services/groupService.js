const GroupRepository = require('../repositories/groupRepository');
const LessonRepository = require('../repositories/lessonRepository');
const ApiService = require('./apiService');

const groupRepository = new GroupRepository();
const lessonRepository = new LessonRepository();
const apiService = new ApiService();

class GroupService {
    constructor() {
        this.groupRepository = groupRepository;
        this.lessonRepository = lessonRepository;
        this.apiService = apiService;
    }

    async getGroupSchedule(name) {
        const group = await this.groupRepository.findByName(name);
        if (!group) {
            throw ApiError.NotFound('Group not found');
        }
        const schedule = await this.lessonRepository.findByGroup(group.id)
        const result = {
            type: 'group',
            name: group.name,
            lessons: schedule.map(lesson => {
                return {
                    numberWeek: lesson.number_week,
                    numberDay: lesson.number_day,
                    number: lesson.number,
                    name: lesson.lesson,
                    type: lesson.type,
                    details: lesson.lesson_details.map(detail => {
                        return {
                            name: detail.teacher,
                            room: detail.room,
                            subgroup: detail.subgroup
                        }
                    })
                }
            })
        }
        return result;
    }
}

module.exports = GroupService;