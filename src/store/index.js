import { createStore } from 'vuex'

export default createStore({
    state: {
        notes: JSON.parse(localStorage.getItem('notes')) || [],
        activeTab: 'schedule' // Добавляем новое состояние
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
        SET_ACTIVE_TAB(state, tab) { // Новая мутация
            state.activeTab = tab
        }
    },
    actions: {
        addNote({ commit }, note) {
            commit('ADD_NOTE', note)
        },
        updateNote({ commit }, note) {
            commit('UPDATE_NOTE', note)
        },
        setActiveTab({ commit }, tab) { // Новое действие
            commit('SET_ACTIVE_TAB', tab)
        }
    },
    getters: {
        getNotes: state => state.notes,
        activeTab: state => state.activeTab // Новый геттер
    }
})