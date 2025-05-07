<template>
  <div :class="{'tg-theme': isTelegram}" :data-theme="isDarkTheme ? 'dark' : 'light'" v-if="noteDialog.isOpen" class="note-dialog-overlay" @click.self="closeDialog">
    <div class="note-dialog">
      <h3 class="dialog-title">Редактирование заметки</h3>
      <div class="dialog-meta">
        <span class="dialog-lesson">{{ currentNote.lesson }}</span>
        <span class="dialog-time">{{ formattedTime }}</span>
      </div>
      <textarea
          v-model="currentNote.content"
          class="dialog-textarea"
          placeholder="Введите текст заметки..."
          ref="textarea"
          @click="focusTextarea"
      ></textarea>
      <div class="dialog-actions">
        <button @click="deleteNote" class="dialog-button delete">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 12L12 4M4 4L12 12" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          Удалить
        </button>
        <button @click="navigateToNote" class="dialog-button view">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M11.78 7.47C11.9205 7.61063 11.9993 7.80125 11.9993 8C11.9993 8.19875 11.9205 8.38937 11.78 8.53L9.28 11.03C9.21134 11.1037 9.12854 11.1628 9.03654 11.2038C8.94454 11.2448 8.84522 11.2668 8.74452 11.2686C8.64382 11.2704 8.54379 11.2518 8.4504 11.2141C8.35701 11.1764 8.27218 11.1203 8.20096 11.049C8.12974 10.9778 8.0736 10.893 8.03588 10.7996C7.99816 10.7062 7.97963 10.6062 7.98141 10.5055C7.98319 10.4048 8.00523 10.3055 8.04622 10.2135C8.08721 10.1215 8.14631 10.0387 8.22 9.97L9.44 8.75H1.75C1.55109 8.75 1.36032 8.67098 1.21967 8.53033C1.07902 8.38968 1 8.19891 1 8C1 7.80109 1.07902 7.61032 1.21967 7.46967C1.36032 7.32902 1.55109 7.25 1.75 7.25H9.44L8.22 6.03C8.08752 5.88783 8.0154 5.69978 8.01882 5.50548C8.02225 5.31118 8.10097 5.12579 8.23838 4.98838C8.37579 4.85097 8.56118 4.77225 8.75548 4.76883C8.94978 4.7654 9.13782 4.83752 9.28 4.97L11.78 7.47ZM4 11.75C4 11.5511 4.07902 11.3603 4.21967 11.2197C4.36032 11.079 4.55109 11 4.75 11C4.94891 11 5.13968 11.079 5.28033 11.2197C5.42098 11.3603 5.5 11.5511 5.5 11.75V12C5.5 12.3978 5.65804 12.7794 5.93934 13.0607C6.22064 13.342 6.60218 13.5 7 13.5H12C12.3978 13.5 12.7794 13.342 13.0607 13.0607C13.342 12.7794 13.5 12.3978 13.5 12V4C13.5 3.60218 13.342 3.22064 13.0607 2.93934C12.7794 2.65804 12.3978 2.5 12 2.5H7C6.60218 2.5 6.22064 2.65804 5.93934 2.93934C5.65804 3.22064 5.5 3.60218 5.5 4V4.25C5.5 4.44891 5.42098 4.63968 5.28033 4.78033C5.13968 4.92098 4.94891 5 4.75 5C4.55109 5 4.36032 4.92098 4.21967 4.78033C4.07902 4.63968 4 4.44891 4 4.25V4C4 3.20435 4.31607 2.44129 4.87868 1.87868C5.44129 1.31607 6.20435 1 7 1H12C12.7956 1 13.5587 1.31607 14.1213 1.87868C14.6839 2.44129 15 3.20435 15 4V12C15 12.7956 14.6839 13.5587 14.1213 14.1213C13.5587 14.6839 12.7956 15 12 15H7C6.20435 15 5.44129 14.6839 4.87868 14.1213C4.31607 13.5587 4 12.7956 4 12V11.75Z" fill="white"/>
          </svg>
          К заметке
        </button>
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
        date: '',

        //TG
        isTelegram: false,
        isDarkTheme: false,
        tgThemeParams: {}
      }
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
    ...mapGetters(['noteDialog', 'getNoteById']),
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
    currentNote() {
      const note = this.getNoteById(this.noteDialog.noteId)
      return note || this.localNote
    },
    formattedTime() {
      if (!this.currentNote.time) return ''
      return this.currentNote.time.replace('<br>', ' - ')
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
      // Фокусируемся только при явном клике
      this.$refs.textarea?.focus()
    },
    navigateToNote() {
      this.setActiveTab('notes')
      this.setActiveNote(this.currentNote.id)
      this.closeDialog()
    },
    deleteNote() {
      // Вызываем действие Vuex через this.$store.dispatch с другим именем
      this.$store.dispatch('deleteNote', this.currentNote.id)
      this.closeDialog()
    }
  },
  watch: {
    'noteDialog.isOpen'(newVal) {

    }
  }
}
</script>

<style lang="sass" scoped>
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

  .tg-theme &
    background: rgba(0, 0, 0, 0.7)

.note-dialog
  background: $color-white
  border-radius: 12px
  position: relative
  width: 38rem
  margin: 0 1rem
  max-width: 38rem
  max-height: 40rem
  padding: 1.5rem
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1)

  .tg-theme &
    background: var(--tg-bg-color)
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3)

.dialog-title
  font-size: 1.5rem
  color: var(--tg-text-color)
  margin-bottom: 1rem
  font-weight: 500

.dialog-meta
  display: flex
  flex-direction: column
  gap: 0.5rem
  margin-bottom: 1.5rem
  padding-bottom: 0.5rem
  border-bottom: 1px solid rgba(var(--tg-text-color), 0.1)

.dialog-lesson
  font-weight: 500
  font-size: 1.2rem
  color: var(--tg-text-color)

.dialog-time
  color: $color-light-green
  font-size: 1rem
  font-weight: 500

  .tg-theme &
    color: $color-light-green

.dialog-textarea
  width: 100%
  height: 20rem
  resize: none
  padding: 1rem
  border: 1px solid rgba(var(--tg-text-color), 0.2)
  border-radius: 8px
  font-family: inherit
  font-size: 1.1rem
  margin-bottom: 1.5rem
  background: var(--tg-secondary-bg-color)
  color: var(--tg-text-color)

  .tg-theme &
    background: var(--tg-bg-color)
    border-color: rgba(var(--tg-text-color), 0.3)

  &:focus
    outline: none
    border-color: $color-light-green

    .tg-theme &
      border-color: $color-light-green

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
  padding: 0.7rem 1rem
  border-radius: 8px
  cursor: pointer
  transition: all 0.2s ease
  border: none
  display: flex
  align-items: center
  gap: 0.5rem
  white-space: nowrap
  font-weight: 500
  font-size: 1rem

  @include respond(small-phone)
    font-size: .8rem
    padding: 0.6rem 0.8rem

  svg
    width: 1.2rem
    height: 1.2rem

  &.delete
    background: $color-error
    color: $color-white

    &:hover
      background: darken($color-error, 5%)
      opacity: 0.9

    .tg-theme &
      background: $color-error
      &:hover
        opacity: 0.8

  &.view
    background: $color-light-green
    color: $color-white

    &:hover
      background: darken($color-light-green, 5%)
      opacity: 0.9

    .tg-theme &
      background: $color-light-green
      &:hover
        opacity: 0.8

    svg path
      fill: $color-white

  &.save
    background: $color-light-green
    color: $color-white

    &:hover
      background: darken($color-light-green, 5%)
      opacity: 0.9

    .tg-theme &
      background: $color-light-green
      &:hover
        opacity: 0.8

// Стили для скроллбара в модальном окне
.note-dialog::-webkit-scrollbar
  width: 6px

.note-dialog::-webkit-scrollbar-track
  background: rgba(0, 0, 0, 0.05)
  border-radius: 3px

.note-dialog::-webkit-scrollbar-thumb
  background: $color-light-green
  border-radius: 3px

.tg-theme .note-dialog::-webkit-scrollbar-thumb
  background: $color-light-green
</style>