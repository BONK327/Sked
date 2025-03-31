<template>
  <div class="notes">
    <Header title="Заметки"/>
    <div v-if="selectedDay" class="notes-date">
      {{ formattedDate }}
    </div>
    <div v-if="filteredNotes.length > 0" class="notes-list">
      <div
          v-for="note in filteredNotes"
          :key="note.id"
          class="note-item"
          :class="{ 'note-item--active': note.id === activeNoteId }"
          ref="noteItems"
          :data-note-id="note.id"
      >
        <div class="note-header">
          <h3 class="note-lesson">{{ note.lesson }}</h3>
          <div class="note-actions">
            <button
                v-if="!editingNote || editingNote.id !== note.id"
                @click="startEditing(note)"
                class="note-edit-btn"
                :disabled="hasNoteForLesson(note)"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 13.3333H14M11 2.33333L13.6667 5L5.66667 13H3V10.3333L11 2.33333Z" stroke="#3DB95E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button @click="deleteNote(note.id)" class="note-delete-btn">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 12L12 4M4 4L12 12" stroke="#FF3B30" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="note-time" v-html="note.time"></div>
        <div class="note-meta">
          <span class="note-teacher">{{ note.teacher }}</span>
          <span class="note-room">{{ note.room }}</span>
        </div>

        <div v-if="editingNote && editingNote.id === note.id" class="note-edit">
          <textarea
              v-model="editingNote.content"
              class="note-edit-textarea"
              placeholder="Введите текст заметки..."
              ref="textarea"
          ></textarea>
          <div class="note-edit-actions">
            <button @click="cancelEditing" class="note-edit-cancel">Отмена</button>
            <button @click="saveNote" class="note-edit-save">Сохранить</button>
          </div>
        </div>
        <div v-else class="note-content">
          {{ note.content || 'Нет текста заметки' }}
        </div>
      </div>
    </div>
    <div v-else class="notes-empty">
      У вас пока нет заметок
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Header from "@/components/header.vue"

export default {
  name: 'Notes',
  components: { Header },
  data() {
    return {
      editingNote: null,
      localActiveNoteId: null,
      highlightTimeout: null
    }
  },
  computed: {
    ...mapGetters(['getNotes', 'selectedDay', 'activeNoteId']),
    formattedDate() {
      if (!this.selectedDay) return ''
      const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
      const date = this.selectedDay.originalDate
      const dayName = days[date.getDay()]
      const formattedDate = date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
      return `${dayName}, ${formattedDate}`
    },
    filteredNotes() {
      if (!this.selectedDay) return this.getNotes
      const selectedDate = this.selectedDay.originalDate.toISOString().split('T')[0]
      return this.getNotes
          .filter(note => note.date === selectedDate)
          .sort((a, b) => new Date(b.date + 'T' + b.time.replace('<br>', ' ')) - new Date(a.date + 'T' + a.time.replace('<br>', ' ')))
    },
    activeNoteId() {
      return this.$store.getters.activeNoteId || this.localActiveNoteId
    }
  },
  methods: {
    ...mapActions(['updateNote', 'deleteNote']),
    hasNoteForLesson(note) {
      return this.filteredNotes.some(n =>
          n.lesson === note.lesson &&
          n.time === note.time &&
          n.id !== note.id
      )
    },
    startEditing(note) {
      if (this.hasNoteForLesson(note)) {
        return
      }
      this.editingNote = { ...note }
      this.$nextTick(() => {
        const textarea = this.$el.querySelector(`[data-note-id="${note.id}"] textarea`)
        if (textarea) {
          textarea.focus()
        }
      })
    },
    cancelEditing() {
      this.editingNote = null
    },
    async saveNote() {
      if (this.editingNote) {
        await this.updateNote(this.editingNote)
        this.editingNote = null
      }
    },
    clearHighlightTimer() {
      if (this.highlightTimeout) {
        clearTimeout(this.highlightTimeout)
        this.highlightTimeout = null
      }
    }
  },
  beforeUnmount() {
    this.clearHighlightTimer()
  }
}
</script>

<style lang="sass" scoped>
@import "@/assets/styles/variables.sass"

.notes
  &__title
    font-size: 1.5rem
    font-weight: 500
    margin-bottom: 1.5rem
    color: $color-text

.notes-date
  font-size: 1.1rem
  color: $color-text
  margin-bottom: 1.5rem
  padding: 0.5rem 0
  border-bottom: 1px solid $color-table-border

.notes-list
  display: flex
  flex-direction: column
  gap: 1.5rem

.note-item
  background: white
  border-radius: 0.5rem
  padding: 1.25rem
  transition: all 0.3s ease
  box-shadow: 0 0.1rem 0.3rem rgba(0, 0, 0, 0.1)
  &--active
    position: relative
    border-left: .4rem solid $color-light-green
    background-color: rgba($color-light-green, 0.05)
    animation: pulse-highlight 3s ease-out forwards
  &:not(.note-item--active)
    transition: all .5s ease

@keyframes pulse-highlight
  0%
    background-color: rgba($color-light-green, 0.1)
    border-left-color: $color-light-green
  70%
    background-color: rgba($color-light-green, 0.05)
    border-left-color: $color-light-green
  100%
    background-color: transparent
    border-left-color: transparent

.note-header
  display: flex
  justify-content: space-between
  align-items: center
  margin-bottom: 0.5rem

.note-lesson
  font-size: 1.1rem
  font-weight: 500
  color: $color-text
  margin: 0

.note-actions
  display: flex
  gap: 0.5rem

.note-edit-btn,
.note-delete-btn
  background: none
  border: none
  cursor: pointer
  padding: 0.3rem
  display: flex
  align-items: center
  justify-content: center
  border-radius: 50%
  transition: background 0.2s ease
  &:hover
    background: rgba(0, 0, 0, 0.05)
  &:disabled
    opacity: 0.5
    cursor: not-allowed
    svg path
      stroke: #ccc

.note-time
  color: $color-light-green
  font-size: 0.9rem
  margin-bottom: 0.3rem

.note-meta
  display: flex
  gap: 1rem
  font-size: 0.9rem
  color: lighten($color-text, 20%)
  margin-bottom: 0.8rem

.note-room
  &::before
    content: "•"
    margin-right: 0.5rem

.note-content
  color: $color-text
  white-space: pre-line
  line-height: 1.5
  padding-top: 0.5rem
  border-top: 1px solid $color-table-border

.note-edit
  margin-top: 1rem

.note-edit-textarea
  width: 100%
  min-height: 100px
  padding: 0.8rem
  border: 1px solid $color-table-border
  border-radius: 0.3rem
  font-family: inherit
  font-size: 0.95rem
  resize: vertical
  &:focus
    outline: none
    border-color: $color-light-green
    box-shadow: 0 0 0 2px rgba($color-light-green, 0.2)

.note-edit-actions
  display: flex
  justify-content: flex-end
  gap: 0.8rem
  margin-top: 0.8rem

.note-edit-cancel,
.note-edit-save
  padding: 0.5rem 1rem
  border-radius: 0.3rem
  font-size: 0.9rem
  cursor: pointer
  transition: all 0.2s ease

.note-edit-cancel
  background: none
  border: 1px solid $color-table-border
  color: $color-text
  &:hover
    background: rgba(0, 0, 0, 0.05)

.note-edit-save
  background: $color-light-green
  border: 1px solid $color-light-green
  color: white
  &:hover
    background: darken($color-light-green, 5%)
    border-color: darken($color-light-green, 5%)

.notes-empty
  text-align: center
  color: lighten($color-text, 30%)
  padding: 2rem
  font-size: 1.1rem
</style>