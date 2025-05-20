import { createStore } from 'vuex'
import { convertNumberToTime, convertToDate, getNumberFromTime } from '../components/utils/notes';
import { reactive } from 'vue';
//const localhost = "0n3jzfgz-3000.inc1.devtunnels.ms";
const localhost = "localhost:3000";
// В хранилище добавляем:
function getAcademicWeekNumber(date = new Date()) {
    // Учебный год начинается 1 сентября
    const startOfYear = new Date(date.getFullYear(), 8, 1); // 8 = сентябрь

    // Если текущая дата до 1 сентября, берем предыдущий учебный год
    if (date < startOfYear) {
        startOfYear.setFullYear(startOfYear.getFullYear() - 1);
    }

    // Разница в миллисекундах
    const diffTime = date - startOfYear;

    // Разница в неделях
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));

    // Номер недели (1 или 2)
    return ((diffWeeks + 1) % 2) + 1;
}
function getTimeString(number, isSaturday) {
    const times = isSaturday ? [
        '08:00<br>09:30', '09:45<br>11:15', '11:30<br>13:00',
        '13:15<br>14:45', '15:00<br>16:30', '16:45<br>18:15'
    ] : [
        '08:00<br>09:30', '09:45<br>11:15', '11:30<br>13:00',
        '13:50<br>15:20', '15:35<br>17:05', '17:20<br>18:50'
    ];
    return times[number - 1] || '';
}

export default createStore({
    state: {
        notes: JSON.parse(localStorage.getItem('notes')) || [],
        activeTab: 'schedule',
        selectedDay: null,
        selectedDayIndex: 0,
        days: [],
        isAddNoteModalOpen: false,
        availableLessons: [],
        activeNoteId: null,
        noteDialog: {
            isOpen: false,
            noteId: null
        },
        currentWeekOffset: 0,
        currentWeekType: 'week1',

        currentWeekNumber: parseInt(localStorage.getItem('currentWeekNumber')) || 1,
        baseWeekNumber: null,
        weekDays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
        fullDayNames: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
        monthNames: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],

        weeksData: {
            week1: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [] },
            week2: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [] }
        },
        currentGroup: localStorage.getItem('currentGroup') || null,
        currentTeacher: null,
        currentRoom: null,
        searchType: 'group', // 'group', 'teacher' или 'room'

        allGroups: [],
        allTeachers: [],
        allRooms: [],
        userNotes: [],
        userId: 123231, // Временный ID, позже заменим на Telegram ID
        serverNotes: [],// Заметки из БД

        doubleSchedules: {
            first: {
                week1: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [] },
                week2: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [] }
            },
            second: {
                week1: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [] },
                week2: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [] }
            }
        },
        currentDoubleWeek: 1,

    },
    mutations: {
        UPDATE_WEEK_OFFSET_AND_NUMBER(state, { offset, weekNumber }) {
            state.currentWeekOffset = offset;
            state.currentWeekNumber = weekNumber;
            state.currentWeekType = `week${weekNumber}`;
        },
        INIT_WEEK_NUMBER(state) {
            // Устанавливаем неделю по умолчанию (1), 
            // но реальный номер будет установлен при загрузке расписания
            state.currentWeekNumber = 1;
            state.currentWeekType = 'week1';
            localStorage.setItem('currentWeekNumber', '1');
        },
        SET_CURRENT_TEACHER(state, payload) {
            state.currentTeacher = payload.displayQuery || payload;
            state.searchType = 'teacher';
        },
        CLEAR_SEARCH(state) {
            state.currentGroup = null;
            state.currentTeacher = null;
            state.currentRoom = null;
        },
        ADD_NOTE(state, note) {
            state.notes.push(note)
            localStorage.setItem('notes', JSON.stringify(state.notes))
        },
        UPDATE_NOTE(state, updatedNote) {
            const index = state.notes.findIndex(n => n.id === updatedNote.id)
            if (index !== -1) {
                state.notes.splice(index, 1, updatedNote)
                localStorage.setItem('notes', JSON.stringify(state.notes))
            }
        },
        DELETE_NOTE(state, noteId) {
            state.notes = state.notes.filter(note => note.id !== noteId)
            localStorage.setItem('notes', JSON.stringify(state.notes))
        },
        SET_ACTIVE_TAB(state, tab) {
            state.activeTab = tab
        },
        SET_SELECTED_DAY(state, day) {
            state.selectedDay = day;
            if (day && day.dayIndex !== undefined) {
                state.selectedDayIndex = day.dayIndex;
            }
        },
        SET_ADD_NOTE_MODAL(state, value) {
            state.isAddNoteModalOpen = value
        },
        SET_AVAILABLE_LESSONS(state, lessons) {
            state.availableLessons = lessons
        },
        SET_ACTIVE_NOTE(state, noteId) {
            state.activeNoteId = noteId
        },
        // Добавляем новые мутации для управления диалогом
        OPEN_NOTE_DIALOG(state, payload) {
            state.noteDialog.isOpen = true;

            // Гарантируем, что noteId всегда будет строкой или null
            if (typeof payload === 'object') {
                state.noteDialog.noteId = {
                    noteId: String(payload.noteId || ''),
                    forceUpdate: Date.now()
                };
            } else {
                state.noteDialog.noteId = payload ? String(payload) : null;
            }
        },
        CLOSE_NOTE_DIALOG(state) {
            state.noteDialog.isOpen = false
            state.noteDialog.noteId = null
        },
        SET_WEEK_OFFSET(state, offset) {
            state.currentWeekOffset = offset
        },
        SET_DAYS(state, days) {
            state.days = days
        },
        SET_SELECTED_DAY_INDEX(state, index) {
            state.selectedDayIndex = index
        },
        SET_FULL_WEEK_SCHEDULE(state, { dayIndex, schedule }) {
            state.fullWeekSchedule[dayIndex] = schedule
        },
        SET_CURRENT_WEEK_TYPE(state, weekType) {
            state.currentWeekType = weekType;
        },
        SET_CURRENT_WEEK_NUMBER(state, number) {
            state.currentWeekNumber = number;
            localStorage.setItem('currentWeekNumber', number.toString());
        },
        SET_BASE_WEEK_NUMBER(state, number) {
            state.baseWeekNumber = number;
        },
        SET_WEEK_SCHEDULE(state, { weekType, dayIndex, schedule }) {
            state.weeksData[weekType][dayIndex] = schedule
        },
        SET_LOADING(state, isLoading) {
            state.isLoading = isLoading
        },
        SET_ERROR(state, error) {
            state.error = error
        },
        SET_CURRENT_GROUP(state, group) {
            state.currentGroup = group
            state.searchType = 'group'
            localStorage.setItem('currentGroup', group)
        },
        // SET_CURRENT_TEACHER(state, teacher) {
        //     state.currentTeacher = teacher
        //     state.searchType = 'teacher'
        // },
        SET_CURRENT_TEACHER(state, payload) {
            // payload может быть строкой или объектом { query, displayQuery }
            if (typeof payload === 'object') {
                state.currentTeacher = payload.displayQuery;
                state.teacherApiQuery = payload.query; // Сохраняем API-формат
            } else {
                state.currentTeacher = payload;
                state.teacherApiQuery = payload.replace(/ /g, '_');
            }
            state.searchType = 'teacher';
        },
        SET_CURRENT_ROOM(state, room) {
            state.currentRoom = room
            state.searchType = 'room'
        },
        CLEAR_SCHEDULE(state) {
            state.weeksData = {
                week1: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [] },
                week2: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [] }
            }
        },
        SET_ALL_DATA_LISTS(state, data) {
            state.allGroups = data.groups || [];
            state.allTeachers = data.teachers || [];
            state.allRooms = data.rooms || [];
        },
        SET_USER_NOTES(state, notes) {
            state.userNotes = notes || [];
        },
        SET_SERVER_NOTES(state, notes) {
            state.serverNotes = notes;
        },
        SET_USER_ID(state, id) {
            state.userId = id;
        },
        OPEN_NOTE_DIALOG(state, noteId) {
            state.noteDialog.isOpen = true;
            state.noteDialog.noteId = noteId;
            state.noteDialog.forceUpdate = Date.now(); // Добавляем триггер для обновления
        },
        SET_DOUBLE_SCHEDULE(state, { key, scheduleData }) {
            if (!state.doubleSchedules[key]) {
                state.doubleSchedules[key] = {
                    week1: {}, week2: {},
                    type: scheduleData.type // сохраняем тип поиска
                };
            }
        },
        SET_DOUBLE_WEEK_SCHEDULE(state, { key, weekType, dayIndex, schedule }) {
            if (!state.doubleSchedules[key]) {
                state.doubleSchedules[key] = reactive({
                    week1: reactive({}),
                    week2: reactive({})
                });
            }

            if (!state.doubleSchedules[key][weekType]) {
                state.doubleSchedules[key][weekType] = reactive({});
            }

            state.doubleSchedules[key][weekType][dayIndex] = schedule;
        },
        SET_CURRENT_DOUBLE_WEEK(state, weekNumber) {
            state.currentDoubleWeek = weekNumber;
        },
        SET_DOUBLE_SCHEDULE_TYPE(state, { key, type }) {
            if (state.doubleSchedules[key]) {
                state.doubleSchedules[key].type = type;
            }
        },




    },
    actions: {
        addNote({ commit }, note) {
            commit('ADD_NOTE', note)
        },
        updateNote({ commit }, note) {
            commit('UPDATE_NOTE', note)
        },
        deleteNote({ commit }, noteId) {
            commit('DELETE_NOTE', noteId)
        },
        setActiveTab({ commit }, tab) {
            commit('SET_ACTIVE_TAB', tab)
        },
        setSelectedDay({ commit }, day) {
            commit('SET_SELECTED_DAY', day)
        },
        setActiveNote({ commit }, noteId) {
            commit('SET_ACTIVE_NOTE', noteId)

            // Автоматически сбрасываем через 3 секунды
            if (noteId) {
                setTimeout(() => {
                    commit('SET_ACTIVE_NOTE', null)
                }, 3000)
            }
        },
        openAddNoteModal({ commit }) {
            commit('SET_ADD_NOTE_MODAL', true)
        },
        closeAddNoteModal({ commit }) {
            commit('SET_ADD_NOTE_MODAL', false)
        },
        updateAvailableLessons({ commit }, lessons) {
            commit('SET_AVAILABLE_LESSONS', lessons)
        },
        // Добавляем новые действия для диалога
        openNoteDialog({ commit }, noteId) {
            commit('OPEN_NOTE_DIALOG', { noteId })
        },
        closeNoteDialog({ commit }) {
            commit('CLOSE_NOTE_DIALOG')
        },
        updateDays({ commit, state }) {
            const today = new Date()
            const weekStart = new Date(today)
            weekStart.setDate(today.getDate() + state.currentWeekOffset * 7)

            const dayDiff = weekStart.getDay() === 0 ? 6 : weekStart.getDay() - 1
            weekStart.setDate(weekStart.getDate() - dayDiff)

            const days = state.weekDays.map((day, index) => {
                const date = new Date(weekStart)
                date.setDate(weekStart.getDate() + index)

                const isCurrentDay = date.toDateString() === today.toDateString()

                return {
                    date: date.getDate().toString().padStart(2, '0'),
                    weekDay: day,
                    month: state.monthNames[date.getMonth()],
                    fullDate: date,
                    isCurrentDay
                }
            })

            commit('SET_DAYS', days)

            // Автовыбор текущего дня при первой загрузке
            if (state.selectedDayIndex === null && state.currentWeekOffset === 0) {
                const currentDayIndex = days.findIndex(day => day.isCurrentDay)
                if (currentDayIndex !== -1) {
                    commit('SET_SELECTED_DAY_INDEX', currentDayIndex)
                }
            }
        },
        changeWeek({ commit, dispatch, state }, offset) {
            // Вычисляем новый номер недели
            const baseWeek = state.baseWeekNumber || 1;
            let newWeekNumber = baseWeek;
            if (offset !== 0) {
                newWeekNumber = (baseWeek + offset) % 2;
                newWeekNumber = newWeekNumber === 0 ? 2 : newWeekNumber;
            }

            commit('UPDATE_WEEK_OFFSET_AND_NUMBER', {
                offset,
                weekNumber: newWeekNumber
            });

            dispatch('updateDays');
        },

        updateWeekNumber({ commit, state }, offset) {
            const baseWeek = state.baseWeekNumber || 1;
            // Определяем номер недели с учетом смещения
            // Каждое изменение offset на 1 - это смена недели (1<->2)
            const newWeekNumber = ((baseWeek - 1 + offset) % 2 + 2) % 2 + 1;
            commit('SET_CURRENT_WEEK_NUMBER', newWeekNumber);
        },

        selectDay({ commit, state }, index) {
            commit('SET_SELECTED_DAY_INDEX', index)
            const day = state.days[index]
            commit('SET_SELECTED_DAY', {
                fullDayName: state.fullDayNames[index],
                date: day.date,
                month: day.month,
                originalDate: day.fullDate
            })
        },
        navigateDay({ commit, state, dispatch }, direction) {
            if (state.selectedDayIndex === null || !state.days.length) return

            const newIndex = state.selectedDayIndex + direction
            if (newIndex >= 0 && newIndex < state.days.length) {
                dispatch('selectDay', newIndex)
            } else {
                // Переход на следующую/предыдущую неделю
                const newOffset = state.currentWeekOffset + (direction > 0 ? 1 : -1)
                if (newOffset >= -2 && newOffset <= 2) {
                    dispatch('changeWeek', newOffset).then(() => {
                        const targetIndex = direction > 0 ? 0 : state.days.length - 1
                        dispatch('selectDay', targetIndex)
                    })
                }
            }
        },
        updateFullWeekSchedule({ commit }, { dayIndex, schedule }) {
            commit('SET_FULL_WEEK_SCHEDULE', { dayIndex, schedule })
        },








        async searchSchedule({ commit, dispatch }, { type, query, isDouble = false, scheduleKey = null }) {
            try {
                commit('SET_LOADING', true);
                if (!isDouble) {
                    commit('CLEAR_SCHEDULE');
                    commit('CLEAR_SEARCH');
                }

                switch (type) {
                    case 'group':
                        if (!isDouble) commit('SET_CURRENT_GROUP', query);
                        break;
                    case 'teacher':
                        if (!isDouble) commit('SET_CURRENT_TEACHER', query);
                        break;
                    case 'room':
                        if (!isDouble) commit('SET_CURRENT_ROOM', query);
                        break;
                }

                const response = await fetch(`http://${localhost}/api/${type}s/${encodeURIComponent(query)}`);
                if (!response.ok) throw new Error('Ошибка загрузки расписания');
                const scheduleData = await response.json();

                if (isDouble && scheduleKey) {
                    await dispatch('processDoubleScheduleData', { scheduleData, scheduleKey });
                } else {
                    await dispatch('processScheduleData', { scheduleData, searchType: type });
                }
            } catch (error) {
                commit('SET_ERROR', error.message);
                console.error('Ошибка поиска:', error);
                throw error;
            } finally {
                commit('SET_LOADING', false);
            }
        },

        // Добавьте новый action:

        async processDoubleScheduleData({ commit, state }, { scheduleData, scheduleKey }) {

            if (!scheduleData || !scheduleData.lessons) {
                console.error('[processDoubleScheduleData] Нет данных или lessons');
                return;
            }

            // Очищаем расписание
            for (let week = 1; week <= 2; week++) {
                for (let day = 0; day < 6; day++) {
                    commit('SET_DOUBLE_WEEK_SCHEDULE', {
                        key: scheduleKey,
                        weekType: `week${week}`,
                        dayIndex: day,
                        schedule: []
                    });
                }
            }

            const formatTime = (number, isSaturday) => {
                const times = isSaturday ? [
                    '08:00<br>09:30', '09:45<br>11:15', '11:30<br>13:00',
                    '13:15<br>14:45', '15:00<br>16:30', '16:45<br>18:15'
                ] : [
                    '08:00<br>09:30', '09:45<br>11:15', '11:30<br>13:00',
                    '13:50<br>15:20', '15:35<br>17:05', '17:20<br>18:50'
                ];
                return times[number - 1] || '';
            };

            scheduleData.lessons.forEach((lesson, index) => {
                const weekType = `week${lesson.numberWeek}`;
                const dayIndex = lesson.numberDay - 1;
                const isSaturday = lesson.numberDay === 6;
                const time = getTimeString(lesson.number, isSaturday);


                const transformedLesson = {
                    time,
                    type: lesson.type,
                    name: lesson.name,
                    weekNumber: lesson.numberWeek
                };

                if (scheduleData.type === 'group') {
                    transformedLesson.teachers = lesson.details || [];
                } else if (scheduleData.type === 'teacher') {
                    transformedLesson.room = lesson.room || '';
                    transformedLesson.details = lesson.details || [];

                } else if (scheduleData.type === 'room') {
                    transformedLesson.details = lesson.details?.map(d => ({
                        name: d.name,
                        groups: d.groups.map(g => ({
                            group: g.group,
                            subgroup: g.subgroup || ''
                        }))
                    })) || [];
                }

                const currentLessons = state.doubleSchedules[scheduleKey][weekType][dayIndex] || [];

                commit('SET_DOUBLE_WEEK_SCHEDULE', {
                    key: scheduleKey,
                    weekType,
                    dayIndex,
                    schedule: [...currentLessons, transformedLesson]
                });

            });

        },

        // Добавить новый action:
        async fetchScheduleData({ commit }, { type, query }) {
            let endpoint;
            switch (type) {
                case 'group': endpoint = 'groups'; break;
                case 'teacher': endpoint = 'teachers'; break;
                case 'room': endpoint = 'rooms'; break;
                default: throw new Error('Неизвестный тип поиска');
            }

            const response = await fetch(`http://${localhost}/api/${endpoint}/${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Ошибка загрузки расписания');
            return await response.json();
        },

        async fetchSchedule1({ commit }, { dayIndex }) {
            const response = await api.get('/schedule1', { params: { dayIndex } })
            commit('SET_SCHEDULE1', response.data)
            return response.data
        },

        async fetchSchedule2({ commit }, { dayIndex }) {
            const response = await api.get('/schedule2', { params: { dayIndex } })
            commit('SET_SCHEDULE2', response.data)
            return response.data
        },
        async fetchFullWeekSchedule({ commit, state, dispatch }) {
            try {
                commit('SET_LOADING', true);

                if (!state.baseWeekNumber) {
                    commit('CLEAR_SCHEDULE');
                }

                let endpoint, query;

                switch (state.searchType) {
                    case 'group':
                        if (!state.currentGroup) return;
                        endpoint = 'groups';
                        query = encodeURIComponent(state.currentGroup);
                        break;
                    case 'teacher':
                        if (!state.currentTeacher) return;
                        endpoint = 'teachers';
                        query = encodeURIComponent(state.currentTeacher);
                        break;
                    case 'room':
                        if (!state.currentRoom) return;
                        endpoint = 'rooms';
                        query = encodeURIComponent(state.currentRoom);
                        break;
                    default:
                        return;
                }

                const response = await fetch(`http://${localhost}/api/${endpoint}/${query}`);
                if (!response.ok) throw new Error('Ошибка загрузки расписания');

                const scheduleData = await response.json();
                //console.log('Получены данные расписания:', scheduleData);

                if (!state.baseWeekNumber) {
                    const calculatedWeek = getAcademicWeekNumber();
                    //console.log('Математически рассчитанная неделя:', calculatedWeek);

                    const weeksInAPI = [...new Set(scheduleData.lessons.map(l => l.numberWeek))];
                    //console.log('Недели в API:', weeksInAPI);

                    const baseWeek = weeksInAPI.includes(calculatedWeek) ? calculatedWeek :
                        weeksInAPI.includes(1) ? 1 : 2;

                    //console.log('Установлена базовая неделя:', baseWeek);
                    commit('SET_BASE_WEEK_NUMBER', baseWeek);
                    commit('SET_CURRENT_WEEK_NUMBER', baseWeek);
                    commit('SET_CURRENT_WEEK_TYPE', `week${baseWeek}`);
                }

                // Вызываем как отдельный action
                await dispatch('processScheduleData', { scheduleData, searchType: state.searchType });

            } catch (error) {
                console.error('Ошибка загрузки расписания:', error);
                commit('SET_ERROR', error.message);
            } finally {
                commit('SET_LOADING', false);
            }
        },

        async processScheduleData({ commit }, { scheduleData, searchType }) {
            const formatLessonTime = (number) => {
                const times = {
                    1: '08:00<br>09:30',
                    2: '09:45<br>11:15',
                    3: '11:30<br>13:00',
                    4: '13:50<br>15:20',
                    5: '15:35<br>17:05',
                    6: '17:20<br>18:50',
                    11: '08:00<br>09:30',
                    12: '09:45<br>11:15',
                    13: '11:30<br>13:00',
                    14: '13:15<br>14:45',
                    15: '15:00<br>16:30',
                    16: '16:45<br>18:15'
                };
                return times[number] || '';
            };

            const transformedData = {
                week1: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [] },
                week2: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [] }
            };

            scheduleData.lessons.forEach(lesson => {
                const weekType = `week${lesson.numberWeek}`;
                const dayIndex = lesson.numberDay - 1;
                let num = lesson.numberDay === 6 ? lesson.number + 10 : lesson.number;

                const transformedLesson = {
                    time: formatLessonTime(num),
                    type: lesson.type,
                    lesson: lesson.name,
                    weekNumber: lesson.numberWeek
                };

                switch (searchType) {
                    case 'group':
                        transformedLesson.teachers = lesson.details || [];
                        break;
                    case 'teacher':
                        transformedLesson.room = lesson.room || '';
                        transformedLesson.details = lesson.details || [];
                        break;
                    case 'room':
                        transformedLesson.details = lesson.details?.map(d => ({
                            name: d.name,
                            groups: d.groups || []
                        })) || [];
                        break;
                }

                transformedData[weekType][dayIndex].push(transformedLesson);
            });

            for (const weekType of ['week1', 'week2']) {
                for (let dayIndex = 0; dayIndex < 6; dayIndex++) {
                    commit('SET_WEEK_SCHEDULE', {
                        weekType,
                        dayIndex,
                        schedule: transformedData[weekType][dayIndex] || []
                    });
                }
            }
        },



        async fetchAllDataLists({ commit }) {
            try {
                const response = await fetch(`http://${localhost}/api/users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: 123231,
                        firstname: "Test",
                        username: "testuser"
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                //console.log('Получены данные с сервера:', data); // Добавим лог для отладки

                // Проверяем наличие notes в ответе
                if (!data.notes) {
                    console.warn('Сервер не вернул заметки в ответе');
                    data.notes = [];
                }

                commit('SET_ALL_DATA_LISTS', {
                    groups: data.data?.groups || [],
                    teachers: data.data?.teachers || [],
                    rooms: data.data?.rooms || []
                });

                commit('SET_SERVER_NOTES', data.notes);

                return data;
            } catch (error) {
                console.error('Ошибка загрузки данных:', error);
                commit('SET_ERROR', 'Не удалось загрузить данные с сервера');
                return {
                    groups: [],
                    teachers: [],
                    rooms: [],
                    notes: []
                };
            }
        },












        async syncNoteToServer({ state }, { numWeek, numDay, num, text }) {
            try {
                // Валидация параметров
                if (isNaN(numWeek)) numWeek = 1;
                if (isNaN(numDay)) numDay = 1;
                if (isNaN(num)) num = 1;

                const requestBody = {
                    userId: state.userId,
                    numWeek: Math.max(1, Math.min(2, parseInt(numWeek))),
                    numDay: Math.max(1, Math.min(6, parseInt(numDay))),
                    num: Math.max(1, Math.min(6, parseInt(num))),
                    text: text?.toString() || " "
                };
                //console.log('Sending to server:', requestBody) // Логируем отправляемые данные
                const response = await fetch(`http://${localhost}/api/notes/add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody)
                });

                if (!response.ok) throw new Error(await response.text());
                return await response.json();
            } catch (error) {
                console.error('Ошибка синхронизации:', error);
                throw error;
            }
        },

        async deleteNoteFromServer({ state }, { numWeek, numDay, num }) {
            try {
                const response = await fetch(`http://${localhost}/api/notes/remove`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: state.userId,
                        numWeek,
                        numDay,
                        num
                    })
                });
                return await response.json();
            } catch (error) {
                console.error('Ошибка удаления заметки:', error);
            }
        },

        // Обновленный метод для добавления заметки
        async addNote({ commit, dispatch, state }, note) {
            // Добавляем только на сервер, затем обновляем список
            try {
                const pos = this.getters.getLessonPosition(note);
                await dispatch('syncNoteToServer', {
                    numWeek: pos.numberWeek,
                    numDay: pos.numberDay,
                    num: pos.number,
                    text: note.content
                });

                // Обновляем весь список с сервера
                await dispatch('fetchAllDataLists');
            } catch (error) {
                console.error('Ошибка синхронизации:', error);
                // Можно добавить уведомление пользователю
            }
        },

        async updateNote({ commit, dispatch, state }, updatedNote) {
            try {
                // Для серверных заметок
                if (updatedNote.source === 'server') {
                    const pos = {
                        numberWeek: updatedNote.serverData.number_week,
                        numberDay: updatedNote.serverData.number_day,
                        number: updatedNote.serverData.number
                    }

                    await dispatch('syncNoteToServer', {
                        numWeek: pos.numberWeek,
                        numDay: pos.numberDay,
                        num: pos.number,
                        text: updatedNote.content
                    })
                }
                // Для локальных заметок
                else {
                    const pos = this.getters.getLessonPosition(updatedNote)
                    await dispatch('syncNoteToServer', {
                        numWeek: pos.numberWeek,
                        numDay: pos.numberDay,
                        num: pos.number,
                        text: updatedNote.content
                    })
                }

                // Обновляем данные
                await dispatch('fetchAllDataLists')
            } catch (error) {
                console.error('Update note error:', error)
                throw error
            }
        },

        // Обновленный метод для удаления заметки
        async deleteNote({ commit, dispatch, state }, noteId) {
            const note = state.notes.find(n => n.id === noteId) ||
                state.serverNotes.find(n => `server-${n.number_week}-${n.number_day}-${n.number}` === noteId);

            if (!note) return;

            // Удаляем из локального хранилища
            commit('DELETE_NOTE', noteId);

            // Для серверных заметок
            if (noteId.startsWith('server-')) {
                const [_, numWeek, numDay, num] = noteId.match(/server-(\d+)-(\d+)-(\d+)/) || [];
                await dispatch('deleteNoteFromServer', {
                    numWeek: parseInt(numWeek),
                    numDay: parseInt(numDay),
                    num: parseInt(num)
                });
            } else {
                // Для локальных заметок
                const { numberWeek, numberDay, number } = this.getters.getLessonPosition(note);
                await dispatch('deleteNoteFromServer', {
                    numWeek: numberWeek,
                    numDay: numberDay,
                    num: number
                });
            }

            // Обновляем список с сервера
            await dispatch('fetchAllDataLists');
        },










        setCurrentWeekType({ commit }, weekType) {
            commit('SET_CURRENT_WEEK_TYPE', weekType);
        },
        updateWeekSchedule({ commit }, { weekType, dayIndex, schedule }) {
            commit('SET_WEEK_SCHEDULE', { weekType, dayIndex, schedule });
        },
        updateWeekOffset({ commit }, offset) {
            commit('SET_WEEK_OFFSET', offset)
        },
        initWeekNumber({ commit }) {
            commit('INIT_WEEK_NUMBER');
        },


    },
    getters: {
        getNotes: state => state.notes,
        activeTab: state => state.activeTab,
        selectedDay: state => state.selectedDay,
        isAddNoteModalOpen: state => state.isAddNoteModalOpen,
        availableLessons: state => state.availableLessons.filter(lesson => lesson.lesson),
        activeNoteId: state => state.activeNoteId,
        // Добавляем геттер для диалога
        noteDialog: state => state.noteDialog,
        // И геттер для получения заметки по ID
        getNoteById: (state, getters) => id => {
            // Обрабатываем случай, когда id - это объект (из noteDialog)
            const noteId = typeof id === 'object' ? id.noteId : id;
            //console.log('Поиск заметки по ID:', noteId);

            if (!noteId) {
                console.warn('Пустой ID заметки');
                return null;
            }

            // Ищем в локальных заметках
            const localNote = state.notes.find(note => note.id === noteId);
            if (localNote) {
                //console.log('Найдена локальная заметка:', localNote);
                return localNote;
            }

            // Ищем в серверных заметках
            const serverNoteMatch = String(noteId).match(/server-(\d+)-(\d+)-(\d+)/);
            if (serverNoteMatch) {
                const [_, numWeek, numDay, num] = serverNoteMatch;
                const serverNote = state.serverNotes.find(note =>
                    note.number_week == numWeek &&
                    note.number_day == numDay &&
                    note.number == num
                );

                if (serverNote) {
                    //console.log('Найдена серверная заметка:', serverNote);
                    const lesson = getters.getLessonByServerNote(serverNote);
                    //console.log('Данные пары для заметки:', lesson);

                    return {
                        id: `server-${serverNote.number_week}-${serverNote.number_day}-${serverNote.number}`,
                        lesson: lesson?.lesson || 'Неизвестная пара',
                        time: convertNumberToTime(serverNote.number, serverNote.number_day === 6),
                        content: (serverNote.text || '').trim(),
                        date: convertToDate(serverNote.number_week, serverNote.number_day),
                        source: 'server',
                        serverData: serverNote
                    };
                }
            }

            console.warn('Заметка не найдена ни в локальных, ни в серверных');
            return null;
        },
        days: state => state.days.map((day, index) => ({
            ...day,
            fullDayName: state.fullDayNames[index], // Исправляем индекс
            month: state.monthNames[new Date(day.originalDate).getMonth()]
        })),
        currentWeekOffset: state => state.currentWeekOffset,
        selectedDayIndex: state => state.selectedDayIndex,
        canNavigatePrev: state => state.currentWeekOffset > -2,
        canNavigateNext: state => state.currentWeekOffset < 2,
        currentWeekType: state => state.currentWeekType,
        currentWeekSchedule: (state, getters) => state.weeksData[getters.currentWeekType] || {},
        currentWeekNumber: state => state.currentWeekNumber,
        currentGroup: state => state.currentGroup,
        searchType: state => state.searchType,
        currentTeacher: state => state.currentTeacher,
        currentRoom: state => state.currentRoom,
        baseWeekNumber: state => state.baseWeekNumber,
        getWeekTypeByOffset: (state) => (offset) => {
            // Определяем тип недели по абсолютному смещению
            const absoluteOffset = Math.abs(offset);
            return absoluteOffset % 2 === 0 ? 'week1' : 'week2';
        },
        monthNames: state => state.monthNames,
        fullWeekSchedule: (state, getters) => getters.currentWeekSchedule,

        allGroups: state => state.allGroups,
        allTeachers: state => state.allTeachers,
        allRooms: state => state.allRooms,
        userNotes: state => state.userNotes,



        getLessonPosition: (state) => (note) => {
            // Преобразуем время пары в номер (1-6)
            const timeToNumberMap = {
                '08:00<br>09:30': 1,
                '09:45<br>11:15': 2,
                '11:30<br>13:00': 3,
                '13:50<br>15:20': 4,
                '15:35<br>17:05': 5,
                '17:20<br>18:50': 6
            };

            const date = new Date(note.date);
            const dayOfWeek = date.getDay(); // 0-6 (воскресенье-суббота)
            const numDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Приводим к 0-5 (пн-сб)

            return {
                numberWeek: state.currentWeekNumber,
                numberDay: numDay + 1, // На сервере дни 1-6
                number: timeToNumberMap[note.time] || 1
            };
        },

        // Объединенные заметки (из БД и localStorage)
        allNotes: (state, getters) => {
            const localNotes = state.notes.map(note => ({
                ...note,
                source: 'local'
            }));

            const serverNotes = state.serverNotes
                .filter(note => {
                    const lesson = getters.getLessonByServerNote(note);
                    return lesson && lesson.lesson; // Фильтруем заметки без урока
                })
                .map(note => {
                    const lesson = getters.getLessonByServerNote(note) || {};
                    const noteDate = convertToDate(note.number_week, note.number_day);

                    return {
                        id: `server-${note.number_week}-${note.number_day}-${note.number}`,
                        lesson: lesson.lesson,
                        time: convertNumberToTime(note.number, note.number_day === 6),
                        content: note.text,
                        date: noteDate,
                        teacher: lesson.teacher || '',
                        room: lesson.room || '',
                        source: 'server',
                        serverData: note
                    };
                });

            return [...localNotes, ...serverNotes];
        },

        getLessonByServerNote: (state) => (serverNote) => {
            if (!serverNote) {
                console.warn('getLessonByServerNote: serverNote не определен');
                return null;
            }

            try {
                const weekKey = `week${serverNote.number_week}`;
                const dayIndex = serverNote.number_day - 1;
                const daySchedule = state.weeksData[weekKey]?.[dayIndex] || [];

                // console.log('Поиск пары для серверной заметки:', {
                //     weekKey,
                //     dayIndex,
                //     dayScheduleLength: daySchedule.length,
                //     serverNoteNumber: serverNote.number
                // });

                const foundLesson = daySchedule.find(lesson => {
                    const lessonNumber = getNumberFromTime(lesson.time, dayIndex === 5);
                    // console.log('Сравнение:', {
                    //     lessonTime: lesson.time,
                    //     lessonNumber,
                    //     serverNoteNumber: serverNote.number,
                    //     match: lessonNumber === serverNote.number
                    // });
                    return lessonNumber === serverNote.number;
                });

                if (foundLesson) {
                    //console.log('Пара найдена:', foundLesson);
                    return foundLesson;
                }

                //console.warn('Пара не найдена, возвращаем заглушку');
                return {
                    lesson: 'Серверная заметка',
                    time: convertNumberToTime(serverNote.number, dayIndex === 5),
                    type: 'unknown'
                };
            } catch (error) {
                //console.error('Ошибка поиска урока:', error);
                return {
                    lesson: 'Неизвестная пара',
                    time: '--:--',
                    type: 'unknown'
                };
            }
        },

        getLessonsForDay: (state) => (week, day) => {
            const weekKey = `week${week}`;
            const dayIndex = day - 1; // Преобразуем 1-6 в 0-5
            return state.weeksData[weekKey]?.[dayIndex] || [];
        },

        getLessonPosition: (state) => (note) => {
            // Для серверных заметок
            if (note.source === 'server' && note.serverData) {
                return {
                    numberWeek: note.serverData.number_week,
                    numberDay: note.serverData.number_day,
                    number: note.serverData.number
                };
            }

            // Для локальных заметок
            const noteDate = new Date(note.date);
            const startOfYear = new Date(2024, 8, 1); // 1 сентября

            if (noteDate < startOfYear) {
                startOfYear.setFullYear(startOfYear.getFullYear() - 1);
            }

            const diffTime = noteDate - startOfYear;
            const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
            const numberWeek = ((diffWeeks + 1) % 2) + 1;

            // Номер дня (1-6, Пн-Сб)
            let numberDay = noteDate.getDay();
            numberDay = numberDay === 0 ? 6 : numberDay;

            // Номер пары
            const isSaturday = numberDay === 6;
            const number = getNumberFromTime(note.time, isSaturday) || 1;

            return {
                numberWeek,
                numberDay,
                number
            };
        }
    }
})

