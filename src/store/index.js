import { createStore } from 'vuex'

export default createStore({
    state: {
        notes: JSON.parse(localStorage.getItem('notes')) || [],
        activeTab: 'schedule',
        selectedDay: null,
        isAddNoteModalOpen: false,
        availableLessons: [],
        activeNoteId: null,
        // Добавляем состояние для диалога заметки
        noteDialog: {
            isOpen: false,
            noteId: null
        },
        currentWeekOffset: 0,
        selectedDayIndex: null,
        days: [],
        weekDays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
        fullDayNames: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
        monthNames: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
        fullWeekSchedule: {
            0: [], // Понедельник
            1: [], // Вторник
            2: [], // Среда
            3: [], // Четверг
            4: [], // Пятница
            5: []  // Суббота
        }

    },
    mutations: {
        ADD_NOTE(state, note) {
            state.notes.push(note)
            localStorage.setItem('notes', JSON.stringify(state.notes))
        },
        UPDATE_NOTE(state, updatedNote) {
            const index = state.notes.findIndex(n => n.id === updatedNote.id)
            if(index !== -1) {
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
            state.selectedDay = day
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
        async fetchFullWeekSchedule({ commit }) {
            // Временные мок-данные - замените на реальные
            const mockData = {
                0: [{ time: '08:00<br>09:30', type: 'lection', lesson: 'Математика', teacher: 'Иванов И.И.', room: '101' }],
                1: [{ time: '09:45<br>11:15', type: 'seminar', lesson: 'Физика', teacher: 'Петров П.П.', room: '202' }],
                // ... остальные дни
            }

            for (let dayIndex = 0; dayIndex < 6; dayIndex++) {
                commit('SET_FULL_WEEK_SCHEDULE', {
                    dayIndex,
                    schedule: mockData[dayIndex] || []
                })
            }
        }

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
        days: state => state.days,
        currentWeekOffset: state => state.currentWeekOffset,
        selectedDayIndex: state => state.selectedDayIndex,
        canNavigatePrev: state => state.currentWeekOffset > -2,
        canNavigateNext: state => state.currentWeekOffset < 2,
        fullWeekSchedule: state => state.fullWeekSchedule
    }
})