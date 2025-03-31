<template>
  <transition name="fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>Выберите пару для заметки</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-content">
          <div
              v-for="lesson in availableLessons"
              :key="lesson.time"
              class="lesson-item"
              :class="{ 'lesson-item--has-note': hasNoteForLesson(lesson) }"
              @click="!hasNoteForLesson(lesson) && handleAddNote(lesson)"
          >
            <div class="lesson-time" v-html="lesson.time"></div>
            <div class="lesson-title">{{ lesson.lesson }}</div>
            <div class="lesson-teacher">{{ lesson.teacher }}</div>
            <div v-if="hasNoteForLesson(lesson)" class="lesson-has-note">
              Заметка уже добавлена
            </div>
          </div>
          <p v-if="availableLessons.length === 0" class="no-lessons">
            Нет доступных пар для добавления заметки
          </p>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'AddNoteModal',
  computed: {
    ...mapGetters(['isAddNoteModalOpen', 'availableLessons', 'getNotes', 'selectedDay']),
    isOpen() {
      return this.isAddNoteModalOpen
    },
    selectedDate() {
      return this.selectedDay?.originalDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
    }
  },
  methods: {
    ...mapActions(['closeAddNoteModal', 'addNote']),
    closeModal() {
      this.closeAddNoteModal()
    },
    hasNoteForLesson(lesson) {
      return this.getNotes.some(note =>
          note.date === this.selectedDate &&
          note.lesson === lesson.lesson &&
          note.time === lesson.time
      )
    },
    handleAddNote(lesson) {
      const newNote = {
        id: Date.now(),
        lesson: lesson.lesson,
        time: lesson.time,
        teacher: lesson.teacher,
        room: lesson.room,
        content: '',
        date: this.selectedDate
      }
      this.addNote(newNote)
      this.closeModal()
    }
  }
}
</script>

<style lang="sass" scoped>
@import "@/assets/styles/variables.sass"

.modal-overlay
  position: fixed
  top: 0
  left: 0
  right: 0
  bottom: 0
  background: rgba(0, 0, 0, 0.5)
  display: flex
  justify-content: center
  align-items: center
  z-index: 1000

.modal
  background: $color-white
  border-radius: 0.5rem
  padding: 1.5rem
  width: 100%
  max-width: 500px
  max-height: 80vh
  overflow-y: auto
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1)

.modal-header
  display: flex
  justify-content: space-between
  align-items: center
  margin-bottom: 1.5rem
  h3
    font-size: 1.3rem
    font-weight: 500
    color: $color-text

.close-btn
  background: none
  border: none
  font-size: 1.5rem
  cursor: pointer
  color: $color-text
  padding: 0.5rem

.lesson-item
  padding: 1rem
  border-bottom: 1px solid $color-table-border
  cursor: pointer
  transition: all 0.2s ease
  position: relative
  &:hover:not(.lesson-item--has-note)
    background: #f5f5f5
  &:last-child
    border-bottom: none
  &--has-note
    cursor: not-allowed
    opacity: 0.7
    background: rgba(0, 0, 0, 0.03)

.lesson-time
  color: $color-light-green
  font-size: 0.9rem
  margin-bottom: 0.3rem

.lesson-title
  font-weight: 500
  margin-bottom: 0.3rem

.lesson-teacher
  color: lighten($color-text, 20%)
  font-size: 0.9rem

.lesson-has-note
  color: $color-light-green
  font-size: 0.8rem
  margin-top: 0.5rem
  font-style: italic

.no-lessons
  text-align: center
  color: lighten($color-text, 30%)
  padding: 1rem

.fade-enter-active,
.fade-leave-active
  transition: opacity 0.3s ease

.fade-enter-from,
.fade-leave-to
  opacity: 0
</style>