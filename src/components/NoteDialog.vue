<template>
  <div v-if="noteDialog.isOpen" class="note-dialog-overlay" @click.self="closeDialog">
    <div class="note-dialog">
      <h3 class="dialog-title">Редактирование заметки</h3>
      <div class="dialog-meta">
        <span class="dialog-lesson">{{ currentNote.lesson }}</span>
        <span class="dialog-time">{{ currentNote.time }}</span>
      </div>
      <textarea
          v-model="currentNote.content"
          class="dialog-textarea"
          placeholder="Введите текст заметки..."
          ref="textarea"
      ></textarea>
      <div class="dialog-actions">
        <button @click="deleteNote" class="dialog-button delete">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 12L12 4M4 4L12 12" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
        <button @click="navigateToNote" class="dialog-button view">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 13.3333H14M11 2.33333L13.6667 5L5.66667 13H3V10.3333L11 2.33333Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button @click="closeDialog" class="dialog-button cancel">Отмена</button>
        <button @click="saveNote" class="dialog-button save">Сохранить</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'NoteDialog',
  data() {
    return {
      localNote: {
        id: null,
        lesson: '',
        time: '',
        content: '',
        date: ''
      }
    }
  },
  computed: {
    ...mapGetters(['noteDialog', 'getNoteById']),
    currentNote() {
      const note = this.getNoteById(this.noteDialog.noteId)
      return note || this.localNote
    }
  },
  methods: {
    ...mapActions([
      'updateNote',
      'deleteNote',
      'closeNoteDialog',
      'setActiveTab',
      'setActiveNote'
    ]),
    saveNote() {
      this.updateNote(this.currentNote)
      this.closeDialog()
    },
    closeDialog() {
      this.closeNoteDialog()
    },
    focusTextarea() {
      this.$nextTick(() => {
        this.$refs.textarea?.focus()
      })
    },
    navigateToNote() {
      this.setActiveTab('notes')
      this.setActiveNote(this.currentNote.id)
      this.closeDialog()
    },
    deleteNote() {
      this.deleteNote(this.currentNote.id)
      this.closeDialog()
    }
  },
  watch: {
    'noteDialog.isOpen'(newVal) {
      if (newVal) {
        this.focusTextarea()
      }
    }
  }
}
</script>

<style lang="sass" scoped>
/* Стили остаются без изменений */
@import "@/assets/styles/variables.sass"
@import "@/assets/styles/mixins.sass"

.note-dialog-overlay
  position: fixed
  top: 0
  left: 0
  right: 0
  bottom: 0
  background: rgba(0, 0, 0, 0.5)
  display: flex
  align-items: center
  justify-content: center
  z-index: 1000

.note-dialog
  background: $color-white
  border-radius: 0.5rem
  position: relative
  width: 38rem
  margin: 0 1rem
  max-width: 38rem
  max-height: 40rem
  padding: 1.5rem
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1)

.dialog-title
  font-size: 1.2rem
  color: $color-text
  margin-bottom: 1rem

.dialog-meta
  display: flex
  flex-direction: column
  gap: 0.3rem
  margin-bottom: 1rem
  font-size: 0.9rem

.dialog-lesson
  font-weight: 500
  color: $color-text

.dialog-time
  color: $color-light-green

.dialog-textarea
  width: 100%
  min-height: 15rem
  max-height: 25rem
  padding: 0.8rem
  border: 1px solid $color-table-border
  border-radius: 0.3rem
  font-family: inherit
  font-size: 0.95rem
  resize: vertical
  margin-bottom: 1.5rem
  &:focus
    outline: none
    border-color: $color-light-green
    box-shadow: 0 0 0 2px rgba($color-light-green, 0.2)

.dialog-actions
  display: flex
  justify-content: flex-end
  gap: 0.8rem
  flex-wrap: nowrap
  @include respond(small-phone)
    justify-content: space-between
    gap: .8rem
    flex-wrap: wrap

.dialog-button
  padding: 0.6rem 1rem
  border-radius: 0.3rem
  font-size: 0.9rem
  cursor: pointer
  transition: all 0.2s ease
  border: none
  display: flex
  align-items: center
  gap: 0.5rem
  white-space: nowrap

  &.delete
    background: #FF3B30
    color: white
    &:hover
      background: darken(#FF3B30, 5%)
    svg
      width: 14px
      height: 14px

  &.view
    background: $color-light-green
    color: white
    &:hover
      background: darken($color-light-green, 5%)
    svg
      width: 14px
      height: 14px

  &.cancel
    background: none
    border: 1px solid $color-table-border
    color: $color-text
    &:hover
      background: rgba(0, 0, 0, 0.05)

  &.save
    background: $color-light-green
    color: white
    &:hover
      background: darken($color-light-green, 5%)
</style>