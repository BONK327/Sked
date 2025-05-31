<template>
  <transition name="fade">
    <div :class="{ 'tg-theme': isTelegram }" :data-theme="isDarkTheme ? 'dark' : 'light'" v-if="isOpen"
      class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>Выберите пару для заметки</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-content">
          <div v-for="lesson in todaysLessons" :key="lesson.time" class="lesson-item"
            :class="{ 'lesson-item--has-note': hasNoteForLesson(lesson) }"
            @click="!hasNoteForLesson(lesson) && handleAddNote(lesson)">
            <div class="lesson-time" v-html="lesson.time"></div>
            <div class="lesson-title">{{ lesson.lesson }}</div>
            <div class="lesson-teacher">{{ lesson.teacher }}</div>
            <div v-if="hasNoteForLesson(lesson)" class="lesson-has-note">
              Заметка уже добавлена
            </div>
          </div>
          <p v-if="todaysLessons.length === 0" class="no-lessons">
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
  data() {
    return {
      isTelegram: false,
      isDarkTheme: false,
      tgThemeParams: {}
    }
  },
  computed: {
    ...mapGetters(['isAddNoteModalOpen', 'availableLessons', 'allNotes', 'selectedDay', 'currentWeekSchedule', 'selectedDayIndex']),
    isOpen() {
      return this.isAddNoteModalOpen
    },
    selectedDate() {
      return this.selectedDay?.originalDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
    },
    todaysLessons() {
      // Get lessons for the currently selected day
      return this.currentWeekSchedule[this.selectedDayIndex] || []
    }
  },
  methods: {
    ...mapActions(['closeAddNoteModal', 'addNote']),
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
    closeModal() {
      this.closeAddNoteModal()
    },
    hasNoteForLesson(lesson) {
      if (!this.allNotes) return false;
      return this.allNotes.some(note =>
        note.date === this.selectedDate &&
        note.time === lesson.time &&
        (note.source === 'local' || note.lesson === lesson.lesson)
      );
    },
    async handleAddNote(lesson) {
      try {
        // Получаем данные для заметки в зависимости от типа поиска
        let noteData = {
          id: Date.now(),
          lesson: lesson.lesson,
          time: lesson.time,
          content: '',
          date: this.selectedDate
        };

        // Добавляем дополнительные поля в зависимости от типа поиска
        switch (this.searchType) {
          case 'teacher':
            noteData.room = lesson.room || '';
            noteData.details = lesson.details || [];
            break;
          case 'group':
            noteData.teachers = lesson.teachers || [];
            noteData.room = this.formatRooms(lesson.teachers || []);
            break;
          case 'room':
            noteData.teachers = lesson.details || [];
            noteData.details = lesson.details || [];
            break;
        }

        await this.$store.dispatch('addNote', noteData);
        this.closeModal();
      } catch (error) {
        console.error('Ошибка добавления заметки:', error);
      }
    },

    formatRooms(teachers) {
      if (!teachers || !teachers.length) return '';

      const rooms = new Set();
      teachers.forEach(teacher => {
        if (teacher.room) {
          rooms.add(teacher.room);
        }
      });

      return [...rooms].join(', ');
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

  .tg-theme &
    background: rgba(0, 0, 0, 0.7)

.modal
  background: $color-white
  border-radius: 1.2rem
  padding: 1.5rem
  width: 100%
  max-width: 50rem
  max-height: 80vh
  overflow-y: auto
  box-shadow: 0 .4rem 2rem rgba(0, 0, 0, 0.1)

  .tg-theme &
    background: var(--tg-bg-color)
    box-shadow: 0 .4rem 2rem rgba(0, 0, 0, 0.3)

@media (orientation: landscape) and (max-width: 1025px)Add commentMore actions
  .modal
    height: 100vh
    overflow-y: auto 
    
.modal-header
  display: flex
  justify-content: space-between
  align-items: center
  margin-bottom: 1.5rem
  padding-bottom: 0.5rem
  border-bottom: .1rem solid rgba(var(--tg-text-color), 0.1)

  h3
    font-size: 1.3rem
    font-weight: 500
    color: var(--tg-text-color)

.close-btn
  background: none
  border: none
  font-size: 1.5rem
  cursor: pointer
  color: var(--tg-text-color)
  padding: 0.5rem
  transition: opacity 0.2s

  &:hover
    opacity: 0.8

.lesson-item
  padding: 1rem
  border-radius: .8rem
  margin-bottom: 0.5rem
  cursor: pointer
  transition: all 0.2s ease
  position: relative
  background: $color-white

  .tg-theme &
    background: var(--tg-secondary-bg-color)

  &:hover:not(.lesson-item--has-note)
    background: rgba($color-light-green, 0.1)

    .tg-theme &
      background: rgba($color-light-green, 0.1)

  &--has-note
    cursor: not-allowed
    opacity: 0.7
    background: rgba(0, 0, 0, 0.03)

    .tg-theme &
      background: rgba(var(--tg-text-color), 0.05)

.lesson-time
  color: $color-light-green
  font-size: 0.9rem
  margin-bottom: 0.3rem
  font-weight: 500

  .tg-theme &
    color: $color-light-green

.lesson-title
  font-weight: 500
  margin-bottom: 0.3rem
  color: var(--tg-text-color)

.lesson-teacher
  color: var(--tg-hint-color)
  font-size: 0.9rem

.lesson-has-note
  color: $color-light-green
  font-size: 0.8rem
  margin-top: 0.5rem
  font-style: italic

  .tg-theme &
    color: $color-light-green

.no-lessons
  text-align: center
  color: var(--tg-hint-color)
  padding: 1rem

// Анимации
.fade-enter-active,
.fade-leave-active
  transition: opacity 0.3s ease

.fade-enter-from,
.fade-leave-to
  opacity: 0

// Стили для скроллбара в модальном окне
.modal::-webkit-scrollbar
  width: .6rem

.modal::-webkit-scrollbar-track
  background: rgba(0, 0, 0, 0.05)
  border-radius: .3rem

.modal::-webkit-scrollbar-thumb
  background: $color-light-green
  border-radius: .3rem

.tg-theme .modal::-webkit-scrollbar-thumb
  background: $color-light-green
</style>