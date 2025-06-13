const axios = require('../config/api');

class ApiRepository {
    constructor() {
        this.axios = axios;
    }

    async getGroups() {
        try {
            const response = await this.axios.get('/GetGroups');
            const groups = response.data;
            return groups;
        } catch (error) {
            
        }
    }

    async getTeachers() {
        try {
            const response = await this.axios.get('/GetTeachers');
            const teachers = response.data;
            return teachers;
        } catch (error) {
            
        }
    }

    async getRoom() {
        try {
            const response = await this.axios.get('/GetRooms');
            const rooms = response.data;
            return rooms;
        } catch (error) {
            
        }
    }

    async getScheduleByRoomId(roomId) {
        try {
            const paddedRoomId = roomId.toString().padStart(9, '0');
            const response = await this.axios.get(`/GetByRoom/${paddedRoomId}`);
            const schedule = response.data;
            return schedule;
        } catch (error) {
            
        }
    }
}