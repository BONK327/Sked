import { createStore } from 'vuex'

export default createStore({
    state: {
        notes: JSON.parse(localStorage.getItem('notes')) || [],
        activeTab: 'schedule',
        selectedDay: null,
        isAddNoteModalOpen: false,
        availableLessons: [],
        activeNoteId: null
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
        }
    },
    getters: {
        getNotes: state => state.notes,
        activeTab: state => state.activeTab,
        selectedDay: state => state.selectedDay,
        isAddNoteModalOpen: state => state.isAddNoteModalOpen,
        availableLessons: state => state.availableLessons.filter(lesson => lesson.lesson),
        activeNoteId: state => state.activeNoteId
    }
})