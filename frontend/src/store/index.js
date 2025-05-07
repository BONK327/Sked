import { createStore } from 'vuex'

const localhost = "0n3jzfgz-3000.inc1.devtunnels.ms";
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
        searchType: 'group' // 'group', 'teacher' или 'room'


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
            state.noteDialog.isOpen = true
            state.noteDialog.noteId = payload.noteId
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
        SET_CURRENT_TEACHER(state, teacher) {
            state.currentTeacher = teacher
            state.searchType = 'teacher'
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








        async searchSchedule({ commit, dispatch }, { type, query }) {
            try {
                commit('SET_LOADING', true);
                commit('CLEAR_SCHEDULE');
                commit('CLEAR_SEARCH');

                switch (type) {
                    case 'group':
                        commit('SET_CURRENT_GROUP', query);
                        break;
                    case 'teacher':
                        commit('SET_CURRENT_TEACHER', query);
                        break;
                    case 'room':
                        commit('SET_CURRENT_ROOM', query);
                        break;
                }

                await dispatch('fetchFullWeekSchedule');
            } catch (error) {
                commit('SET_ERROR', error.message);
                console.error('Ошибка поиска:', error);
            } finally {
                commit('SET_LOADING', false);
            }
        },

        async fetchFullWeekSchedule({ commit, state }) {
            try {
                commit('SET_LOADING', true);
                commit('CLEAR_SCHEDULE');

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

                const response = await fetch(`https://${localhost}/api/${endpoint}/${query}`);
                if (!response.ok) throw new Error('Ошибка загрузки расписания');

                const scheduleData = await response.json();
                console.log('Получены данные расписания:', scheduleData);

                // Определяем номер текущей недели математически
                const calculatedWeek = getAcademicWeekNumber();
                console.log('Математически рассчитанная неделя:', calculatedWeek);

                // Проверяем, есть ли такая неделя в данных API
                const weeksInAPI = [...new Set(scheduleData.lessons.map(l => l.numberWeek))];
                console.log('Недели в API:', weeksInAPI);

                // Определяем базовую неделю (используем рассчитанную, если она есть в API)
                const baseWeek = weeksInAPI.includes(calculatedWeek) ? calculatedWeek :
                    weeksInAPI.includes(1) ? 1 : 2;

                console.log('Установлена базовая неделя:', baseWeek);
                commit('SET_BASE_WEEK_NUMBER', baseWeek);
                commit('SET_CURRENT_WEEK_NUMBER', baseWeek);
                commit('SET_CURRENT_WEEK_TYPE', `week${baseWeek}`);

                // Обработка данных расписания
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

                    if (state.searchType === 'group') {
                        transformedLesson.teachers = lesson.details || [];
                    }
                    else if (state.searchType === 'teacher') {
                        transformedLesson.room = lesson.room || '';
                        transformedLesson.details = lesson.details || [];
                    }
                    else if (state.searchType === 'room') {
                        transformedLesson.details = lesson.details?.map(d => ({
                            name: d.name,
                            groups: d.groups || []
                        })) || [];
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

            } catch (error) {
                console.error('Ошибка загрузки расписания:', error);
                commit('SET_ERROR', error.message);
            } finally {
                commit('SET_LOADING', false);
            }
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
        getNoteById: state => id => state.notes.find(note => note.id === id),
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
        currentWeekSchedule: state => state.weeksData[state.currentWeekType] || {},
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
        fullWeekSchedule: (state, getters) => getters.currentWeekSchedule
    }
})

