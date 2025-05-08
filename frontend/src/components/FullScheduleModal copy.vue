<template>
  <div class="full-schedule-modal" @click.self="closeModal" :class="{ 'tg-theme': isTelegram, 'tg-dark': isDarkTheme }">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="table__title">Расписание на неделю (Неделя {{ currentWeekNumber }})</h2>
        <button class="close-btn" @click="closeModal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" :stroke="isTelegram ? 'var(--tg-button-text-color)' : '#FFFFFF'"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
      <div class="modal-body">
        <div v-if="isLoading" class="loading">Загрузка...</div>
        <div v-else class="week-schedule">
          <div v-for="(day, dayIndex) in weekDays" :key="dayIndex" class="table">
            <h3 class="table__title">{{ day.fullName }}</h3>
            <div class="table__content">
              <div v-for="(row, rowIndex) in getTimeSlotsForDay(dayIndex)" :key="rowIndex" class="table__content-row">
                <div class="table__content-row-time" v-html="row.time"></div>
                <div
                  :class="['table__content-row-color', `table__content-row-color--${getTypeForLesson(dayIndex, row.time)}`]">
                </div>
                <div class="table__content-row-lesson">
                  <span class="table__content-row-lesson--class">{{ getLessonName(dayIndex, row.time) }}</span>
                  <span :class="[
                    'table__content-row-lesson--details',
                    'green-text'
                  ]" v-html="getMainDetails(dayIndex, row.time)"></span>
                </div>
                <div class="table__content-row-room">
                  <span :class="[
                    'table__content-row-room--num',
                  ]" v-html="getRoomDetails(dayIndex, row.time)"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

const defaultRows = [
  { time: '08:00<br>09:30', type: 'seminar' },
  { time: '09:45<br>11:15', type: 'seminar' },
  { time: '11:30<br>13:00', type: 'seminar' },
  { time: '13:50<br>15:20', type: 'seminar' },
  { time: '15:35<br>17:05', type: 'seminar' },
  { time: '17:20<br>18:50', type: 'seminar' },
]

const saturdayRows = [
  { time: '08:00<br>09:30', type: 'seminar' },
  { time: '09:45<br>11:15', type: 'seminar' },
  { time: '11:30<br>13:00', type: 'seminar' },
  { time: '13:15<br>14:45', type: 'seminar' },
  { time: '15:00<br>16:30', type: 'seminar' },
  { time: '16:45<br>18:15', type: 'seminar' },
]

export default {
  name: 'FullScheduleModal',
  data() {
    return {
      weekDays: [
        { shortName: 'Пн', fullName: 'Понедельник' },
        { shortName: 'Вт', fullName: 'Вторник' },
        { shortName: 'Ср', fullName: 'Среда' },
        { shortName: 'Чт', fullName: 'Четверг' },
        { shortName: 'Пт', fullName: 'Пятница' },
        { shortName: 'Сб', fullName: 'Суббота' }
      ],
      isLoading: false,
      // Telegram
      isTelegram: false,
      isDarkTheme: false,
      tgThemeParams: {}
    }
  },
  computed: {
    ...mapGetters([
      'currentWeekSchedule',
      'currentWeekNumber',
      'searchType',
      'currentWeekType' // Добавляем получение текущего типа недели
    ]),
    displayedWeekSchedule() {
      return this.$store.state.weeksData[this.currentWeekType] || {};
    }
  },
  methods: {
    ...mapActions(['fetchFullWeekSchedule']),
    getTimeSlotsForDay(dayIndex) {
      return dayIndex === 5 ? saturdayRows : defaultRows;
    },
    initTelegramTheme() {
      const WebApp = window.Telegram.WebApp;

      // Получаем параметры темы
      this.tgThemeParams = WebApp.themeParams || {};
      this.isDarkTheme = WebApp.colorScheme === 'dark';

      // Применяем тему
      this.applyTelegramTheme();

      // Подписываемся на изменение темы
      WebApp.onEvent('themeChanged', this.applyTelegramTheme);
    },

    applyTelegramTheme() {
      const WebApp = window.Telegram.WebApp;
      this.isDarkTheme = WebApp.colorScheme === 'dark';

      // Обновляем CSS-переменные
      document.documentElement.style.setProperty('--tg-bg-color', this.tgThemeParams.bg_color || '#ffffff');
      document.documentElement.style.setProperty('--tg-text-color', this.tgThemeParams.text_color || '#000000');
      document.documentElement.style.setProperty('--tg-button-color', this.tgThemeParams.button_color || '#2481cc');
      document.documentElement.style.setProperty('--tg-button-text-color', this.tgThemeParams.button_text_color || '#ffffff');
      document.documentElement.style.setProperty('--tg-hint-color', this.tgThemeParams.hint_color || '#707579');
      document.documentElement.style.setProperty('--tg-link-color', this.tgThemeParams.link_color || '#168acd');
      document.documentElement.style.setProperty('--tg-secondary-bg-color', this.tgThemeParams.secondary_bg_color || '#f4f4f5');
    },

    closeModal() {
      this.$emit('close')
    },

    getLessonsForDay(dayIndex) {
      return this.displayedWeekSchedule[dayIndex] || [];
    },

    getLessonsForDay(dayIndex) {
      return this.currentWeekSchedule[dayIndex] || []
    },

    getLessonForDay(dayIndex, time) {
      const lessons = this.getLessonsForDay(dayIndex)
      return lessons.find(lesson => lesson.time === time) || null
    },

    getLessonName(dayIndex, time) {
      const lesson = this.getLessonForDay(dayIndex, time)
      return lesson?.name || lesson?.lesson || ''
    },

    getTypeForLesson(dayIndex, time) {
      const lesson = this.getLessonForDay(dayIndex, time)
      return lesson?.type || 'seminar'
    },

    getMainDetails(dayIndex, time) {
      const lesson = this.getLessonForDay(dayIndex, time)
      if (!lesson) return ''

      switch (this.searchType) {
        case 'group':
          return this.formatTeachersWithSubgroups(lesson.teachers || [])
        case 'teacher':
          return this.formatGroupsWithSubgroups(lesson.details || [])
        case 'room':
          return this.formatTeachersWithSubgroups(lesson.details || [])
        default:
          return ''
      }
    },

    getRoomDetails(dayIndex, time) {
      const lesson = this.getLessonForDay(dayIndex, time)
      if (!lesson) return ''

      switch (this.searchType) {
        case 'group':
          return this.formatRoomsWithSubgroups(lesson.teachers || [])
        case 'teacher':
          return lesson.room || ''
        case 'room':
          return this.formatGroupsWithSubgroups(
            lesson.details?.flatMap(d => d.groups || []) || []
          )
        default:
          return ''
      }
    },

    formatTeachersWithSubgroups(items) {
      if (!items || !items.length) return ''

      // Сначала собираем всех уникальных преподавателей
      const uniqueTeachers = new Map()

      items.forEach(item => {
        const teacherName = item.name || item.teacher || ''
        if (!teacherName) return

        const subgroup = item.subgroup || (item.groups?.[0]?.subgroup) || ''

        if (!uniqueTeachers.has(teacherName)) {
          uniqueTeachers.set(teacherName, new Set())
        }
        if (subgroup) {
          uniqueTeachers.get(teacherName).add(subgroup)
        }
      })

      // Формируем строку для каждого преподавателя
      const result = []
      uniqueTeachers.forEach((subgroups, teacherName) => {
        const nameParts = teacherName.split(' ')
        const shortName = nameParts[0] + ' ' +
          (nameParts[1] ? nameParts[1][0] + '.' : '') +
          (nameParts[2] ? nameParts[2][0] + '.' : '')

        if (subgroups.size > 0) {
          result.push(`${teacherName}(${[...subgroups].join(',')})`)
        } else {
          result.push(teacherName)
        }
      })

      return result.join('<br>')
    },

    formatGroupsWithSubgroups(groups) {
      if (!groups) return ''

      if (this.searchType === 'room') {
        const uniqueGroups = new Set()
        groups.forEach(g => {
          if (g.group) {
            const baseGroup = g.group.split('(')[0]
            uniqueGroups.add(baseGroup)
          }
        })
        return [...uniqueGroups].join('<br>')
      }

      return groups.map(g => {
        let str = g.group
        if (g.subgroup) str += `(${g.subgroup})`
        return str
      }).join('<br>')
    },

    formatRoomsWithSubgroups(items) {
      if (!items) return '';

      // Собираем все уникальные аудитории
      const roomMap = new Map();

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

      // Формируем строки для аудиторий
      const result = [];
      roomMap.forEach((subgroups, room) => {
        // Добавляем подгруппы только если они не охватывают все возможные
        if (subgroups.size > 0) {
          // Проверяем, есть ли все подгруппы (1 и 2)
          const hasAllSubgroups = subgroups.has(1) && subgroups.has(2);
          result.push(hasAllSubgroups ? room : `${room}(${[...subgroups].join(',')})`);
        } else {
          result.push(room);
        }
      });

      return result.join('<br>');
    }
  },
  async created() {
    if (window.Telegram && window.Telegram.WebApp) {
      this.isTelegram = true;
      this.initTelegramTheme();
    }

    this.isLoading = true;
    try {
      await this.fetchFullWeekSchedule();
    } catch (error) {
      console.error('Ошибка загрузки расписания:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
</script>

<style lang="sass" scoped>
@import "@/assets/styles/variables.sass"
@import "@/assets/styles/mixins.sass"

.full-schedule-modal
  position: fixed
  top: 0
  left: 0
  right: 0
  bottom: 0
  background-color: rgba(0, 0, 0, 0.5)
  display: flex
  justify-content: center
  align-items: center
  z-index: 1000
  overflow: auto
  .tg-theme &
    background-color: rgba(0, 0, 0, 0.7)

.modal-content
  background-color: $color-white
  width: 100%
  max-width: 40rem
  align-self: flex-start
  height: calc(100vh - #{$header-height} - #{$footer-height} + 8rem)
  display: flex
  flex-direction: column
  overflow: hidden
  border-radius: 0.8rem
  .tg-theme.tg-dark &
    background-color: var(--tg-bg-color)
  
  &::-webkit-scrollbar
    width: .6rem
  &::-webkit-scrollbar-track
    background: rgba(0, 0, 0, 0.05)
    border-radius: .3rem
    .tg-theme.tg-dark &
      background: rgba(255, 255, 255, 0.1)
  &::-webkit-scrollbar-thumb
    background: $color-light-green
    border-radius: .3rem

.close-btn
  background: none
  border: none
  cursor: pointer
  z-index: 10
  padding: 0.5rem

.modal-header
  display: flex
  justify-content: space-between
  padding: 1rem
  background-color: $color-light-green
  color: white
  border-radius: 0.8rem 0.8rem 0 0
  
  h2
    font-size: 1.5rem
    font-weight: 400
    margin: 0
    .tg-theme &
      color: var(--tg-button-text-color)

.modal-body
  flex: 1
  overflow-y: auto
  padding: 1.5rem 1.5rem 4rem 1.5rem
  &::-webkit-scrollbar
    width: .6rem
  &::-webkit-scrollbar-track
    background: rgba(0, 0, 0, 0.05)
    border-radius: 3px
    .tg-theme.tg-dark &
      background: rgba(255, 255, 255, 0.1)
  &::-webkit-scrollbar-thumb
    background: $color-light-green
    border-radius: 3px

.week-schedule
  display: grid
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))
  gap: 1.5rem

.loading
  text-align: center
  padding: 2rem
  font-size: 1.2rem
  .tg-theme.tg-dark &
    color: var(--tg-text-color)

.table
  width: 100%
  min-height: 100%
  background-color: $color-table-border
  border-radius: 0.3rem 0.3rem 0 0
  overflow: hidden
  display: flex
  flex-direction: column
  .tg-theme.tg-dark &
    background-color: var(--tg-hint-color)
  
  &__title
    font-size: 1.2rem
    font-weight: 400
    padding: 0.5rem 1rem
    background-color: $color-light-green
    color: $color-white
  &__content
    width: 100%
    border-collapse: collapse
    display: flex
    flex-direction: column
    
    &-row
      position: relative
      display: flex
      width: 100%
      justify-content: space-between
      align-items: flex-start
      min-height: 5rem
      height: auto !important
      background-color: white
      border: solid 0.1rem $color-table-border
      margin-top: -0.1rem
      .tg-theme.tg-dark &
        background-color: var(--tg-bg-color)
        border-color: var(--tg-hint-color)
      
      &-time
        align-self: center
        padding: 1.5rem 0.5rem
        flex: 0 0 auto
        font-size: 1rem
        font-weight: 400
        box-sizing: border-box
        overflow-wrap: break-word
        .tg-theme.tg-dark &
          color: var(--tg-text-color)
        @include respond(small-phone)
          font-size: 0.8rem
      
      &-color
        width: 0.75rem
        flex: 0 0 auto
        min-height: 5rem
        align-self: stretch
      
      &-color--seminar
        background-color: $color-table-border
        .tg-theme.tg-dark &
          background-color: var(--tg-hint-color)
      
      &-color--lection
        background-color: $color-orange
      
      &-lesson
        padding: 0.5rem 0.8rem
        flex: 1
        &--class,
        &--details
          white-space: normal
          word-break: break-word
          display: inline-block
          width: 100%
          font-size: 1rem
          font-weight: 400
          box-sizing: border-box
          @include respond(small-phone)
            font-size: 0.8rem
        
        &--class
          line-height: 1rem
          margin-bottom: 0.2rem
      
      &-room
        align-self: flex-start
        text-align: center
        padding: 0.5rem 0.3rem 0.5rem 0
        flex: 0 0 auto
        display: flex
        flex-direction: column
        align-items: flex-end
        position: relative
        font-size: 1rem
        font-weight: 400
        box-sizing: border-box
        .tg-theme.tg-dark &
          color: var(--tg-text-color)
        @include respond(small-phone)
          font-size: 0.8rem
        
        &--num
          letter-spacing: -0.03rem

.green-text
  color: $color-light-green
</style>