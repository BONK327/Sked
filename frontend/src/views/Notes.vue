<template>
  <div class="notes" :class="{ 'tg-theme': isTelegram }" :data-theme="isDarkTheme ? 'dark' : 'light'">
    <Header title="Заметки" />
    <div v-if="filteredNotes.length > 0" class="notes-list">
      <div v-for="note in filteredNotes" :key="note.id" class="note-item"
        :class="{ 'note-item--active': note.id === activeNoteId }" :data-note-id="note.id">
        <div class="note-header">
          <div class="note-meta">
            <span class="note-date">{{ formatDate(note.date) }}</span>
            <span class="note-time">{{ note.time }}</span>
          </div>
          <div class="note-actions">
            <button @click="startEditing(note)" class="note-edit-btn">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 13.3333H14M11 2.33333L13.6667 5L5.66667 13H3V10.3333L11 2.33333Z" stroke="#3DB95E"
                  stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <button @click="deleteNote(note.id)" class="note-delete-btn">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 12L12 4M4 4L12 12" stroke="#FF3B30" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </button>
          </div>
        </div>
        <div class="note-content-wrapper">
          <h3 class="note-lesson">{{ note.lesson }}</h3>
          <div class="note-details">
            <template v-if="searchType === 'teacher'">
              <span class="note-teacher">{{ note.room }}</span>
              <span class="note-room">{{ formatGroups(note) }}</span>
            </template>
            <template v-else-if="searchType === 'group'">
              <span class="note-teacher">{{ formatTeachers(note) }}</span>
              <span class="note-room">{{ formatRoom(note) }}</span>
            </template>
            <template v-else-if="searchType === 'room'">
              <span class="note-teacher">{{ formatTeachers(note) }}</span>
              <span class="note-room">{{ formatGroups(note) }}</span>
            </template>
            <template v-else>
              <span class="note-teacher">{{ note.teacher }}</span>
              <span class="note-room">{{ note.room }}</span>
            </template>
          </div>
          <div v-if="editingNote && editingNote.id === note.id" class="note-edit">
            <textarea v-model="editingNote.content" class="note-edit-textarea" placeholder="Введите текст заметки..."
              ref="textarea"></textarea>
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
    ...mapGetters(['allNotes', 'activeNoteId', 'searchType']),
    notes() {
      // Форматируем время для всех заметок
      return this.getNotes.map(note => ({
        ...note,
        time: note.time.replace('<br>', ' - ')
      }))
    },
    filteredNotes() {
      return this.allNotes.filter(note => note.source !== 'server' || note.lesson)
        .map(note => ({
          ...note,
          time: note.time.replace('<br>', ' - ')
        }));
    },
    sortedNotes() {
      return [...this.filteredNotes].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA || a.time.localeCompare(b.time);
      });
    }
  },
  methods: {
    ...mapActions(['updateNote', 'deleteNote', 'syncNoteToServer']),
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
      try {
        if (this.editingNote) {
          await this.$store.dispatch('updateNote', this.editingNote);
          this.editingNote = null;
          // Заменяем toast на console.log для отладки
          console.log('Заметка сохранена');
          // Или добавьте инициализацию toast в проекте
        }
      } catch (error) {
        console.error('Ошибка при сохранении заметки:', error);
        // Аналогично для ошибок
        console.error(error.message);
      }
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
      const dayName = days[date.getDay()];
      const formattedDate = date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      return `${dayName}, ${formattedDate}`;
    },

    async deleteNote(noteId) {
      try {
        await this.$store.dispatch('deleteNote', noteId)
          .then(() => this.$store.dispatch('fetchAllDataLists'))
          .catch(error => {
            console.error('Delete error:', error)
            alert('Ошибка при удалении заметки')
          })
      } catch (error) {
        console.error('Delete failed:', error)
        alert('Не удалось удалить заметку')
      }
    },
    clearHighlightTimer() {
      if (this.highlightTimeout) {
        clearTimeout(this.highlightTimeout)
        this.highlightTimeout = null
      }
    },



    formatTeachers(note) {
      // Для серверных заметок
      if (note.source === 'server' && note.serverData) {
        const lesson = this.$store.getters.getLessonByServerNote(note.serverData);
        if (lesson) {
          if (this.searchType === 'room') {
            return this.formatTeachersList(lesson.details || []);
          }
          return this.formatTeachersList(lesson.teachers || []);
        }
        return '';
      }

      // Для локальных заметок
      if (note.teachers) {
        if (Array.isArray(note.teachers)) {
          return this.formatTeachersList(note.teachers);
        }
        return note.teachers;
      }

      // Попробуем извлечь из details, если есть
      if (note.details && Array.isArray(note.details)) {
        return this.formatTeachersList(note.details);
      }

      return '';
    },

    formatGroups(note) {
      // Для серверных заметок
      if (note.source === 'server' && note.serverData) {
        const lesson = this.$store.getters.getLessonByServerNote(note.serverData);
        if (lesson) {
          if (this.searchType === 'teacher') {
            return this.formatGroupsList(lesson.details || []);
          } else if (this.searchType === 'room') {
            const groups = lesson.details?.flatMap(d => d.groups || []) || [];
            return this.formatGroupsList(groups);
          }
        }
        return '';
      }

      // Для локальных заметок
      if (note.groups) {
        if (Array.isArray(note.groups)) {
          return this.formatGroupsList(note.groups);
        }
        return note.groups;
      }

      // Попробуем извлечь из details, если есть
      if (note.details && Array.isArray(note.details)) {
        return this.formatGroupsList(note.details);
      }

      return '';
    },

    formatRoom(note) {
      // Для серверных заметок
      if (note.source === 'server' && note.serverData) {
        const lesson = this.$store.getters.getLessonByServerNote(note.serverData);
        if (lesson) {
          if (this.searchType === 'group') {
            return this.formatRoomsList(lesson.teachers || []);
          }
          return lesson.room || '';
        }
        return '';
      }

      // Для локальных заметок
      return note.room || '';
    },

    formatTeachersList(items) {
      if (!items || !items.length) return '';

      // Сначала собираем всех уникальных преподавателей
      const uniqueTeachers = new Map();

      items.forEach(item => {
        const teacherName = item.name || item.teacher || '';
        if (!teacherName) return;

        const subgroup = item.subgroup || (item.groups?.[0]?.subgroup) || '';

        if (!uniqueTeachers.has(teacherName)) {
          uniqueTeachers.set(teacherName, new Set());
        }
        if (subgroup) {
          uniqueTeachers.get(teacherName).add(subgroup);
        }
      });

      // Формируем строку для каждого преподавателя
      const result = [];
      uniqueTeachers.forEach((subgroups, teacherName) => {
        const nameParts = teacherName.split(' ');
        const shortName = nameParts[0] + ' ' +
          (nameParts[1] ? nameParts[1][0] + '.' : '') +
          (nameParts[2] ? nameParts[2][0] + '.' : '');

        if (subgroups.size > 0) {
          result.push(`${shortName} (${[...subgroups].join(',')})`);
        } else {
          result.push(shortName);
        }
      });

      return result.join(', ');
    },

    formatGroupsList(groups) {
      if (!groups) return '';

      // Для аудиторий показываем только базовые группы
      if (this.searchType === 'room') {
        const uniqueGroups = new Set();
        groups.forEach(g => {
          if (g.group) {
            const baseGroup = g.group.split('(')[0];
            uniqueGroups.add(baseGroup);
          }
        });
        return [...uniqueGroups].join(', ');
      }

      // Для преподавателей и других случаев показываем группы с подгруппами
      return groups.map(g => {
        if (!g.group) return '';
        let str = g.group;
        if (g.subgroup) str += ` (${g.subgroup})`;
        return str;
      }).filter(Boolean).join(', ');
    },


    formatRoomsList(items) {
      if (!items || !items.length) return '';

      const roomMap = new Map();
      const allSubgroups = new Set();

      // Собираем все подгруппы
      items.forEach(item => {
        if (item.subgroup) {
          allSubgroups.add(item.subgroup);
        }
      });

      // Группируем по аудиториям
      items.forEach(item => {
        if (item.room) {
          if (!roomMap.has(item.room)) {
            roomMap.set(item.room, new Set());
          }
          if (item.subgroup) {
            roomMap.get(item.room).add(item.subgroup);
          }
        }
      });

      // Формируем результат
      return [...roomMap.entries()].map(([room, subgroups]) => {
        // Не показываем подгруппы если в аудитории все подгруппы
        return subgroups.size === allSubgroups.size ? room : `${room} (${[...subgroups].join(',')})`;
      }).join(', ');
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
  height: calc(100vh - #{$footer-height})
  width: 100%
  background: var(--tg-secondary-bg-color)
  overflow: hidden
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
  margin-bottom: 2rem

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
  border-left: .3rem solid transparent
  -webkit-box-shadow: 0 .6rem 2.3rem -1.5rem rgba(6, 6, 6, 1)
  -moz-box-shadow: 0 .6rem 2.3rem -1.5rem rgba(6, 6, 6, 1)
  box-shadow: 0 .6rem 2.3rem -1.5rem rgba(6, 6, 6, 1)

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
  border-top: .1rem solid rgba(var(--tg-text-color), 0.1)
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
  border: .1rem solid rgba(var(--tg-text-color), 0.2)
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
  border: .1rem solid rgba(var(--tg-text-color), 0.2)
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

.notes
  @media (orientation: landscape) and (max-width: 1025px)
    height: 100vh
</style>