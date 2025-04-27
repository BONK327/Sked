const RoomRepository = require('../repositories/roomRepository');
const LessonRepository = require('../repositories/lessonRepository');
const ApiService = require('./apiService');

const roomRepository = new RoomRepository();
const lessonRepository = new LessonRepository();
const apiService = new ApiService();

class RoomService {
    constructor() {
        this.roomRepository = roomRepository;
        this.lessonRepository = lessonRepository;
        this.apiService = apiService;
    }

    async getRoomSchedule(name) {
        const room = await this.roomRepository.findByName(name);
        if (!room) {
            throw ApiError.NotFound('Room not found');
        }
        const schedule = await this.lessonRepository.findByRoom(room.id);
        const result = {
            type: 'room',
            name: room.name,
            lessons: schedule.map(lesson => {
                return {
                    numberWeek: lesson.number_week,
                    numberDay: lesson.number_day,
                    number: lesson.number,
                    name: lesson.lesson,
                    type: lesson.type,
                    details: lesson.lesson_details.reduce((acc, detail) => {
                        const existingTeacher = acc.find(t => t.name === detail.teacher);
                        
                        if (existingTeacher) {
                            existingTeacher.groups.push({
                                group: detail.group,
                                subgroup: detail.subgroup
                            });
                        } else {
                            acc.push({
                                name: detail.teacher,
                                groups: [{
                                    group: detail.group,
                                    subgroup: detail.subgroup
                                }]
                            });
                        }
                        return acc;
                    }, [])
                }
            })
        }
        return result;
    }
}

module.exports = RoomService;