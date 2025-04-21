import { createStore } from 'vuex'

const timeArray = ['08:00<br>09:30', '09:45<br>11:15', '11:30<br>13:00', '13:50<br>15:20', '15:35<br>17:05', '17:20<br>18:50'];

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
        // Добавляем состояние для диалога заметки
        noteDialog: {
            isOpen: false,
            noteId: null
        },
        currentWeekOffset: 0,

        weekDays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
        fullDayNames: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
        monthNames: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
        currentWeekType: 'week1', // 'week1' или 'week2'
        weeksData: {
            week1: {
                0: [], // Понедельник
                1: [], // Вторник
                2: [], // Среда
                3: [], // Четверг
                4: [], // Пятница
                5: []  // Суббота
            },
            week2: {
                0: [], // Понедельник
                1: [], // Вторник
                2: [], // Среда
                3: [], // Четверг
                4: [], // Пятница
                5: []  // Суббота
            }
        },
        


    },
    mutations: {
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
        SET_AVAILABLE_LESSONS(state, names) {
            state.availableLessons = names
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
        SET_WEEK_SCHEDULE(state, { weekType, dayIndex, schedule }) {
            state.weeksData[weekType][dayIndex] = schedule;
        }

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
        updateAvailableLessons({ commit }, names) {
            commit('SET_AVAILABLE_LESSONS', names)
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
        changeWeek({ commit, dispatch }, offset) {
            commit('SET_WEEK_OFFSET', offset)
            dispatch('updateDays')
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
        // async fetchFullWeekSchedule({ commit, state }) {
        //     // Моковые данные для каждого дня недели
        //     const mockData = {
        //         0: [ // Понедельник
        //             {
        //                 time: '08:00<br>09:30',
        //                 type: 'lection',
        //                 lesson: 'Веб-дизайн и интернет-программирование',
        //                 teacher: 'ПИ2303/1 Лаптев С.В., ПИ2303/2 Чемарина А.В',
        //                 room: '635гл'
        //             },
        //             {
        //                 time: '09:45<br>11:15',
        //                 type: 'lection',
        //                 lesson: 'Веб-дизайн и интернет-программирование',
        //                 teacher: 'ПИ2303/1 Лаптев С.В., ПИ2303/2 Чемарина А.В',
        //                 room: '635гл'
        //             },
        //             // ... остальные пары понедельника
        //         ],
        //         1: [ // Вторник
        //             {
        //                 time: '09:45<br>11:15',
        //                 type: 'lection',
        //                 lesson: 'Веб-дизайн и интернет-программирование',
        //                 teacher: 'ПИ2303/1 Лаптев С.В., ПИ2303/2 Чемарина А.В',
        //                 room: '635гл'
        //             },
        //         ],
        //         // Заполнить данные для остальных дней
        //         2: [ // Среда
        //             {
        //                 time: '08:00<br>09:30',
        //                 type: 'lection',
        //                 lesson: 'Веб-дизайн и интернет-программирование',
        //                 teacher: 'ПИ2303/1 Лаптев С.В., ПИ2303/2 Чемарина А.В',
        //                 room: '635гл'
        //             },
        //         ],
        //         3: [ // Четверг
        //             {
        //                 time: '09:45<br>11:15',
        //                 type: 'lection',
        //                 lesson: 'Веб-дизайн и интернет-программирование',
        //                 teacher: 'ПИ2303/1 Лаптев С.В., ПИ2303/2 Чемарина А.В',
        //                 room: '635гл'
        //             },
        //         ],
        //         4: [ // Пятница
        //             {
        //                 time: '08:00<br>09:30',
        //                 type: 'lection',
        //                 lesson: 'Веб-дизайн и интернет-программирование',
        //                 teacher: 'ПИ2303/1 Лаптев С.В., ПИ2303/2 Чемарина А.В',
        //                 room: '635гл'
        //             },
        //         ],
        //         5: [ // Суббота
        //             {
        //                 time: '08:00<br>09:30',
        //                 type: 'lection',
        //                 lesson: 'Веб-дизайн и интернет-программирование',
        //                 teacher: 'ПИ2303/1 Лаптев С.В., ПИ2303/2 Чемарина А.В',
        //                 room: '635гл'
        //             },
        //             {
        //                 time: '09:45<br>11:15',
        //                 type: 'lection',
        //                 lesson: 'Веб-дизайн и интернет-программирование',
        //                 teacher: 'ПИ2303/1 Лаптев С.В., ПИ2303/2 Чемарина А.В',
        //                 room: '635гл'
        //             },
        //             {
        //                 time: '11:30<br>13:00',
        //                 type: 'lection',
        //                 lesson: 'Веб-дизайн и интернет-программирование',
        //                 teacher: 'ПИ2303/1 Лаптев С.В., ПИ2303/2 Чемарина А.В',
        //                 room: '635гл'
        //             },
        //             {
        //                 time: '13:15<br>14:45',
        //                 type: 'lection',
        //                 lesson: 'Веб-дизайн и интернет-программирование',
        //                 teacher: 'ПИ2303/1 Лаптев С.В., ПИ2303/2 Чемарина А.В',
        //                 room: '635гл'
        //             },
        //             {
        //                 time: '15:00<br>16:30',
        //                 lesson: 'Веб-дизайн и интернет-программирование',
        //                 teacher: 'ПИ2303/1 Лаптев С.В., ПИ2303/2 Чемарина А.В',
        //                 room: '635гл'
        //             },
        //             {
        //                 time: '16:45<br>18:15',
        //                 type: 'lection',
        //                 lesson: 'Веб-дизайн и интернет-программирование',
        //                 teacher: 'ПИ2303/1 Лаптев С.В., ПИ2303/2 Чемарина А.В',
        //                 room: '635гл'
        //             }
        //         ],
        //
        //     };
        //
        //     for (let dayIndex = 0; dayIndex < 6; dayIndex++) {
        //         commit('SET_FULL_WEEK_SCHEDULE', {
        //             dayIndex,
        //             schedule: mockData[dayIndex] || []
        //         });
        //     }
        // },
        // async fetchFullWeekSchedule({ commit, state }) {
        //     try {
        //         // Здесь получаем данные для обеих недель
        //         const response = await fetch('ваш_эндпоинт_парсера');
        //         const data = await response.json();
        //
        //         // Заполняем данные для недель
        //         for (let weekType of ['week1', 'week2']) {
        //             for (let dayIndex = 0; dayIndex < 6; dayIndex++) {
        //                 commit('SET_WEEK_SCHEDULE', {
        //                     weekType,
        //                     dayIndex,
        //                     schedule: data[weekType][dayIndex] || []
        //                 });
        //             }
        //         }
        //     } catch (error) {
        //         console.error('Ошибка загрузки расписания:', error);
        //     }
        // },

        async fetchFullWeekSchedule({ commit, state }) {
            try {
                // Моковые данные для недель
                const mockData = {
                    week1: {
                        0: [ // Понедельник
                            {
                                number: 1,
                                time: timeArray[0],
                                type: "lection",
                                name: "Исследование операций и методы оптимизации",
                                //room: "123",
                                details: [
                                    {
                                        name: "Кудрина Ирина Викторовна",
                                        room: "219гл",
                                        subgroup: ""
                                    }
                                ]
                                
                            },
                            {
                                time: timeArray[1],
                                type: 'lection',
                                lesson: 'Математический анализ',
                                teacher: 'ПИ2303/1 Иванов А.А., ПИ2303/2 Петров Б.Б.',
                                room: '420гл'
                            },
                            {
                                time: '11:30<br>13:00',
                                type: 'seminar',
                                lesson: 'Иностранный язык',
                                teacher: 'ПИ2303/1 Смирнова Е.В.',
                                room: '305'
                            }
                        ],
                        //     1: [ // Вторник
                        //         {
                        //             time: '13:50<br>15:20',
                        //             type: 'seminar',
                        //             lesson: 'Физическая культура',
                        //             teacher: '',
                        //             room: 'Спортзал'
                        //         },
                        //         {
                        //             time: '15:35<br>17:05',
                        //             type: 'lection',
                        //             lesson: 'Дискретная математика',
                        //             teacher: 'ПИ2303/1 Сидоров В.В., ПИ2303/2 Кузнецова Г.Г.',
                        //             room: '512гл'
                        //         }
                        //     ],
                        //     2: [ // Среда
                        //         {
                        //             time: '08:00<br>09:30',
                        //             type: 'seminar',
                        //             lesson: 'Программирование на Python',
                        //             teacher: 'ПИ2303/1 Козлов Д.Д.',
                        //             room: '410'
                        //         },
                        //         {
                        //             time: '09:45<br>11:15',
                        //             type: 'lection',
                        //             lesson: 'Архитектура компьютеров',
                        //             teacher: 'ПИ2303/1-2 Волков Е.Е.',
                        //             room: '215гл'
                        //         }
                        //     ],
                        //     3: [ // Четверг
                        //         {
                        //             time: '11:30<br>13:00',
                        //             type: 'seminar',
                        //             lesson: 'Базы данных',
                        //             teacher: 'ПИ2303/1 Новикова Ж.Ж.',
                        //             room: '320'
                        //         }
                        //     ],
                        //     4: [ // Пятница
                        //         {
                        //             time: '13:50<br>15:20',
                        //             type: 'lection',
                        //             lesson: 'Теория алгоритмов',
                        //             teacher: 'ПИ2303/1-2 Соколов З.З.',
                        //             room: '105гл'
                        //         },
                        //         {
                        //             time: '15:35<br>17:05',
                        //             type: 'seminar',
                        //             lesson: 'Операционные системы',
                        //             teacher: 'ПИ2303/1 Белов И.И.',
                        //             room: '210'
                        //         }
                        //     ],
                        //     5: [ // Суббота
                        //         {
                        //             time: '08:00<br>09:30',
                        //             type: 'seminar',
                        //             lesson: 'Компьютерные сети',
                        //             teacher: 'ПИ2303/2 Григорьев К.К.',
                        //             room: '315'
                        //         },
                        //         {
                        //             time: '09:45<br>11:15',
                        //             type: 'lection',
                        //             lesson: 'Криптография',
                        //             teacher: 'ПИ2303/1-2 Михайлов Л.Л.',
                        //             room: '120гл'
                        //         }
                        //     ]
                        // },
                        // week2: {
                        //     0: [ // Понедельник
                        //         {
                        //             time: '08:00<br>09:30',
                        //             type: 'seminar',
                        //             lesson: 'Веб-дизайн и интернет-программирование',
                        //             teacher: 'ПИ2303/1 Лаптев С.В., ПИ2303/2 Чемарина А.В',
                        //             room: '635гл'
                        //         },
                        //         {
                        //             time: '09:45<br>11:15',
                        //             type: 'seminar',
                        //             lesson: 'Математический анализ',
                        //             teacher: 'ПИ2303/1 Иванов А.А., ПИ2303/2 Петров Б.Б.',
                        //             room: '420гл'
                        //         }
                        //     ],
                        //     1: [ // Вторник
                        //         {
                        //             time: '11:30<br>13:00',
                        //             type: 'lection',
                        //             lesson: 'Иностранный язык',
                        //             teacher: 'ПИ2303/1 Смирнова Е.В.',
                        //             room: '305'
                        //         },
                        //         {
                        //             time: '13:50<br>15:20',
                        //             type: 'lection',
                        //             lesson: 'Физическая культура',
                        //             teacher: '',
                        //             room: 'Спортзал'
                        //         }
                        //     ],
                        //     2: [ // Среда
                        //         {
                        //             time: '15:35<br>17:05',
                        //             type: 'seminar',
                        //             lesson: 'Дискретная математика',
                        //             teacher: 'ПИ2303/1 Сидоров В.В., ПИ2303/2 Кузнецова Г.Г.',
                        //             room: '512гл'
                        //         }
                        //     ],
                        //     3: [ // Четверг
                        //         {
                        //             time: '08:00<br>09:30',
                        //             type: 'lection',
                        //             lesson: 'Программирование на Python',
                        //             teacher: 'ПИ2303/1 Козлов Д.Д.',
                        //             room: '410'
                        //         },
                        //         {
                        //             time: '09:45<br>11:15',
                        //             type: 'seminar',
                        //             lesson: 'Архитектура компьютеров',
                        //             teacher: 'ПИ2303/1-2 Волков Е.Е.',
                        //             room: '215гл'
                        //         }
                        //     ],
                        //     4: [ // Пятница
                        //         {
                        //             time: '11:30<br>13:00',
                        //             type: 'lection',
                        //             lesson: 'Базы данных',
                        //             teacher: 'ПИ2303/1 Новикова Ж.Ж.',
                        //             room: '320'
                        //         },
                        //         {
                        //             time: '13:50<br>15:20',
                        //             type: 'seminar',
                        //             lesson: 'Теория алгоритмов',
                        //             teacher: 'ПИ2303/1-2 Соколов З.З.',
                        //             room: '105гл'
                        //         }
                        //     ],
                        //     5: [ // Суббота
                        //         {
                        //             time: '15:35<br>17:05',
                        //             type: 'lection',
                        //             lesson: 'Операционные системы',
                        //             teacher: 'ПИ2303/1 Белов И.И.',
                        //             room: '210'
                        //         },
                        //         {
                        //             time: '17:20<br>18:50',
                        //             type: 'seminar',
                        //             lesson: 'Компьютерные сети',
                        //             teacher: 'ПИ2303/2 Григорьев К.К.',
                        //             room: '315'
                        //         }
                        //     ]
                    }
                };

                for (let weekType of ['week1', 'week2']) {
                    for (let dayIndex = 0; dayIndex < 6; dayIndex++) {
                        commit('SET_WEEK_SCHEDULE', {
                            weekType,
                            dayIndex,
                            schedule: mockData[weekType][dayIndex] || []
                        });
                    }
                }
            } catch (error) {
                console.error('Ошибка загрузки расписания:', error);
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


    },
    getters: {
        getNotes: state => state.notes,
        activeTab: state => state.activeTab,
        selectedDay: state => state.selectedDay,
        isAddNoteModalOpen: state => state.isAddNoteModalOpen,
        availableLessons: state => state.availableLessons.filter(name => name.name),
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
        getWeekTypeByOffset: (state) => (offset) => {
            // Определяем тип недели по абсолютному смещению
            const absoluteOffset = Math.abs(offset);
            return absoluteOffset % 2 === 0 ? 'week1' : 'week2';
        },
        monthNames: state => state.monthNames,
        fullWeekSchedule: (state, getters) => getters.currentWeekSchedule
    }
})

