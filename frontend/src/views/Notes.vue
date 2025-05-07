<template>
  <div class="notes" :class="{'tg-theme': isTelegram}" :data-theme="isDarkTheme ? 'dark' : 'light'">
    <Header title="Заметки"/>
    <div v-if="notes.length > 0" class="notes-list">
      <div
          v-for="note in sortedNotes"
          :key="note.id"
          class="note-item"
          :class="{ 'note-item--active': note.id === activeNoteId }"
          :data-note-id="note.id"
      >
        <div class="note-header">
          <div class="note-meta">
            <span class="note-date">{{ formatDate(note.date) }}</span>
            <span class="note-time">{{ note.time }}</span>
          </div>
          <div class="note-actions">
            <button
                @click="startEditing(note)"
                class="note-edit-btn"
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
        <div class="note-content-wrapper">
          <h3 class="note-lesson">{{ note.lesson }}</h3>
          <div class="note-details">
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
      highlightTimeout: null,
      isTelegram: false,
      isDarkTheme: false,
      tgThemeParams: {}
    }
  },
  created() {
    // Проверяем, открыто ли приложение в Telegram
    if (window.Telegram && window.Telegram.WebApp) {
      this.isTelegram = true;
      this.initTelegramTheme();
      this.setupTelegramBackButton();
      window.Telegram.WebApp.expand();
    }
  },
  computed: {
    ...mapGetters(['getNotes', 'activeNoteId']),
    notes() {
      // Форматируем время для всех заметок
      return this.getNotes.map(note => ({
        ...note,
        time: note.time.replace('<br>', ' - ')
      }))
    },
    sortedNotes() {
      return [...this.notes].sort((a, b) => {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        return dateB - dateA || a.time.localeCompare(b.time)
      })
    }
  },
  methods: {
    ...mapActions(['updateNote', 'deleteNote']),
    initTelegramTheme() {
      const WebApp = window.Telegram.WebApp;
      this.tgThemeParams = WebApp.themeParams || {};
      this.isDarkTheme = WebApp.colorScheme === 'dark';
      this.applyTelegramTheme();
      WebApp.onEvent('themeChanged', this.applyTelegramTheme);
    },
    applyTelegramTheme() {
      const WebApp = window.Telegram.WebApp;
      this.isDarkTheme = WebApp.colorScheme === 'dark';
      document.documentElement.style.setProperty('--tg-bg-color', this.tgThemeParams.bg_color || (this.isDarkTheme ? '#18222d' : '#ffffff'));
      document.documentElement.style.setProperty('--tg-text-color', this.tgThemeParams.text_color || (this.isDarkTheme ? '#ffffff' : '#000000'));
      document.documentElement.style.setProperty('--tg-button-color', this.tgThemeParams.button_color || '#2481cc');
      document.documentElement.style.setProperty('--tg-button-text-color', this.tgThemeParams.button_text_color || '#ffffff');
      document.documentElement.style.setProperty('--tg-hint-color', this.tgThemeParams.hint_color || (this.isDarkTheme ? '#aaaaaa' : '#707579'));
      document.documentElement.style.setProperty('--tg-link-color', this.tgThemeParams.link_color || '#168acd');
      document.documentElement.style.setProperty('--tg-secondary-bg-color', this.tgThemeParams.secondary_bg_color || (this.isDarkTheme ? '#212529' : '#f4f4f5'));
    },
    setupTelegramBackButton() {
      const WebApp = window.Telegram.WebApp;
      WebApp.BackButton.show();
      WebApp.BackButton.onClick(() => {
        WebApp.close();
      });
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
      const dayName = days[date.getDay()]
      const formattedDate = date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
      return `${dayName}, ${formattedDate}`
    },
    startEditing(note) {
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
        // Проверяем, содержит ли текст "Нет текста заметки"
        if (this.editingNote.content && this.editingNote.content.trim() === 'Нет текста заметки') {
          this.editingNote.content = 'Ну и зачем ты это пишешь ;(|'
        }

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
  display: flex
  flex-direction: column
  height: calc(100vh - #{$header-height} - #{$footer-height} - 2rem)
  width: 100%
  background: var(--tg-secondary-bg-color)
  overflow: hidden
  padding: 1.5rem
  color: var(--tg-text-color)

  &.tg-theme
    background: var(--tg-secondary-bg-color)
    color: var(--tg-text-color)

.notes-list
  display: flex
  flex-direction: column
  gap: 1rem
  flex: 1
  overflow-y: auto
  padding-right: 0.5rem

  // Стили для скроллбара в Telegram теме
  .tg-theme &
    &::-webkit-scrollbar
      width: .4rem
    &::-webkit-scrollbar-track
      background: rgba($tg-text, 0.05)
      border-radius: .3rem
    &::-webkit-scrollbar-thumb
      background: $color-light-green
      border-radius: .3rem

.note-item
  +telegram-element
  transition: all 0.3s ease
  box-shadow: none
  margin-bottom: 0
  border-left: 3px solid transparent

  .tg-theme &
    background-color: var(--tg-bg-color)
    color: var(--tg-text-color)

  &--active
    position: relative
    border-left-color: $color-light-green
    background-color: rgba($color-light-green, 0.1)
    animation: pulse-highlight 3s ease-out forwards

    .tg-theme &
      background-color: rgba($color-light-green, 0.2)

@keyframes pulse-highlight
  0%
    background-color: rgba($color-light-green, 0.2)
    border-left-color: $color-light-green
  70%
    background-color: rgba($color-light-green, 0.1)
    border-left-color: $color-light-green
  100%
    background-color: var(--tg-bg-color)
    border-left-color: transparent

.note-header
  display: flex
  justify-content: space-between
  align-items: center
  margin-bottom: 0.8rem

.note-meta
  display: flex
  flex-direction: column
  gap: 0.3rem
  font-size: 0.85rem
  color: var(--tg-hint-color)

.note-date
  font-weight: 600
  font-size: 1.1rem
  color: var(--tg-text-color)

.note-time
  color: $color-light-green
  font-size: 1.1rem
  font-weight: 600

.note-content-wrapper
  display: flex
  flex-direction: column
  gap: 0.5rem

.note-lesson
  font-size: 1.2rem
  font-weight: 500
  color: var(--tg-text-color)
  margin: 0

.note-details
  display: flex
  gap: 1rem
  font-size: 0.9rem
  color: var(--tg-hint-color)

.note-teacher
  font-size: 1rem
  color: $color-light-green

.note-room
  font-size: 1rem
  color: var(--tg-hint-color)
  &::before
    content: "•"
    margin-right: 0.5rem
    color: var(--tg-hint-color)

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

  .tg-theme &
    &:hover
      background: rgba(var(--tg-text-color), 0.1)

.note-edit-btn svg path
  stroke: $color-light-green

.note-delete-btn svg path
  stroke: $color-error

.note-content
  color: var(--tg-text-color)
  white-space: pre-line
  line-height: 1.5
  padding-top: 0.5rem
  border-top: 1px solid rgba(var(--tg-text-color), 0.1)
  font-size: 1.1rem

  .tg-theme &
    color: var(--tg-text-color)

.note-edit
  margin-top: 1rem

.note-edit-textarea
  width: 100%
  min-height: 5rem
  max-height: 15rem
  padding: 0.8rem
  border: 1px solid rgba(var(--tg-text-color), 0.2)
  border-radius: 0.5rem
  font-family: inherit
  font-size: 1.1rem
  resize: vertical
  background: var(--tg-secondary-bg-color)
  color: var(--tg-text-color)

  .tg-theme &
    background: var(--tg-bg-color)
    border-color: rgba(var(--tg-text-color), 0.3)

  &:focus
    outline: none
    border-color: $color-light-green

.note-edit-actions
  display: flex
  justify-content: flex-end
  gap: 0.8rem
  margin-top: 0.8rem

.note-edit-cancel,
.note-edit-save
  padding: 0.5rem 1rem
  border-radius: 0.5rem
  font-size: 0.9rem
  cursor: pointer
  transition: all 0.2s ease

.note-edit-cancel
  background: none
  border: 1px solid rgba(var(--tg-text-color), 0.2)
  color: var(--tg-text-color)

  .tg-theme &
    &:hover
      background: rgba(var(--tg-text-color), 0.1)

.note-edit-save
  +telegram-button
  font-size: 0.9rem

.notes-empty
  text-align: center
  color: var(--tg-hint-color)
  padding: 2rem
  font-size: 1.1rem
</style>