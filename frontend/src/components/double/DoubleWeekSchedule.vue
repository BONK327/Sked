<template>
  <div class="double-week-schedule" ref="scrollContainer">
    <div class="schedule-container">
      <div v-for="(day, dayIndex) in weekDays" :key="dayIndex" class="day-section">
        <h3 class="day-title">{{ day.fullName }}</h3>
        <div class="double-table-container">
          <!-- Первая неделя -->
          <div class="table-wrapper">
            <div class="table">
              <h4 class="table__title">{{ firstWeekTitle || 'Первое расписание' }}</h4>
              <div class="table__content">
                <div 
                  v-for="(row, rowIndex) in getTimeSlotsForDay(dayIndex)" 
                  :key="'week1-' + rowIndex" 
                  class="table__content-row"
                >
                  <div class="table__content-row-time" v-html="row.time"></div>
                  <div 
                    class="table__content-row-color" 
                    :class="{
                      'table__content-row-color--lection': isLection(row.type),
                      'table__content-row-color--seminar': !isLection(row.type)
                    }"
                  ></div>
                  <div class="table__content-row-lesson">
                    <template v-if="getLessonForDay(dayIndex, row.time, 0)">
                      <span class="table__content-row-lesson--class">
                        {{ getLessonForDay(dayIndex, row.time, 0).subject }}
                      </span>
                      <span class="table__content-row-lesson--details">
                        Креймер Алексей Семенович
                      </span>
                      <span class="table__content-row-lesson--details">
                        {{ getLessonForDay(dayIndex, row.time, 0).group }}
                      </span>
                    </template>
                    <template v-else>
                      <span class="table__content-row-lesson--class">Веб-дизайн и интернет программирование</span>
                    </template>
                  </div>
                  <div class="table__content-row-room">
                    221гл
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Вторая неделя -->
          <div class="table-wrapper">
            <div class="table">
              <h4 class="table__title">{{ secondWeekTitle || 'Второе расписание' }}</h4>
              <div class="table__content">
                <div 
                  v-for="(row, rowIndex) in getTimeSlotsForDay(dayIndex)" 
                  :key="'week2-' + rowIndex" 
                  class="table__content-row"
                >
                  <div class="table__content-row-time" v-html="row.time"></div>
                  <div 
                    class="table__content-row-color" 
                    :class="{
                      'table__content-row-color--lection': isLection(row.type),
                      'table__content-row-color--seminar': !isLection(row.type)
                    }"
                  ></div>
                  <div class="table__content-row-lesson">
                    <template v-if="getLessonForDay(dayIndex, row.time, 1)">
                      <span class="table__content-row-lesson--class">
                        {{ getLessonForDay(dayIndex, row.time, 1).subject }}
                      </span>
                      <span class="table__content-row-lesson--details">
                        Креймер Алексей Семенович
                      </span>
                      <span class="table__content-row-lesson--details">
                        {{ getLessonForDay(dayIndex, row.time, 1).group }}
                      </span>
                    </template>
                    <template v-else>
                      <span class="table__content-row-lesson--class">Нет занятий</span>
                    </template>
                  </div>
                  <div class="table__content-row-room">
                    {{ getLessonForDay(dayIndex, row.time, 1)?.room || '' }}
                  </div>
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
  name: 'DoubleWeekSchedule',
  props: {
    currentWeekSchedule: {
      type: Array,
      default: () => []
    },
    nextWeekSchedule: {
      type: Array,
      default: () => []
    },
    firstWeekTitle: {
      type: String,
      default: 'Введите группу/преподавателя/аудиторию'
    },
    secondWeekTitle: {
      type: String,
      default: 'Введите группу/преподавателя/аудиторию'
    }
  },
  data() {
    return {
      weekDays: [
        { shortName: 'Пн', fullName: 'Понедельник' },
        { shortName: 'Вт', fullName: 'Вторник' },
        { shortName: 'Ср', fullName: 'Среда' },
        { shortName: 'Чт', fullName: 'Четверг' },
        { shortName: 'Пт', fullName: 'Пятница' },
        { shortName: 'Сб', fullName: 'Суббота' }
      ]
    }
  },
  methods: {
    getTimeSlotsForDay(dayIndex) {
      return dayIndex === 5 ? saturdayRows : defaultRows
    },
    getLessonsForDay(dayIndex, weekIndex) {
      return weekIndex === 0 
        ? this.currentWeekSchedule[dayIndex] || []
        : this.nextWeekSchedule[dayIndex] || []
    },
    getLessonForDay(dayIndex, time, weekIndex) {
      const lessons = this.getLessonsForDay(dayIndex, weekIndex)
      return lessons.find(lesson => lesson.time === time.replace('<br>', ' ')) || null
    },
    isLection(type) {
      return type === 'lection'
    },
  },
  mounted() {
    this.initTelegramScroll();
  }
}
</script>

<style lang="sass" scoped>
@import "@/assets/styles/variables.sass"
@import "@/assets/styles/mixins.sass"

.double-week-schedule
  width: 100%
  flex: 1
  background: var(--app-bg-color)
  color: var(--app-text-color)

  // Стили для темной темы Telegram
  .tg-theme-dark &
    scrollbar-color: var(--tg-theme-secondary-bg-color) var(--tg-theme-bg-color)
  
  .tg-theme-light &
    scrollbar-color: var(--tg-theme-secondary-bg-color) var(--tg-theme-bg-color)

.schedule-container
  width: 100%
  min-height: 100%
  display: flex
  flex-direction: column
  gap: 1.5rem
  background-color: var(--tg-secondary-bg-color)
  overflow: visible /* Важно! */

.day-section
  display: flex
  flex-direction: column
  gap: 0.75rem
  overflow: visible /* Важно! */

  &:last-child
    margin-bottom: 2rem 

  // Медиазапросы для разных устройств
  @include respond(small-phone)
    &:last-child
      margin-bottom: calc(2rem + #{$footer-height})

  @include respond(phone)
    &:last-child
      margin-bottom: calc(2rem + #{$footer-height})

  @include respond(tab-port)
    margin-bottom: 1.5rem
    &:last-child
      margin-bottom: calc(2rem + #{$footer-height})

  @include respond(tab-land)
    &:last-child
      margin-bottom: 2rem

.day-title
  font-size: 1.2rem
  font-weight: 600
  color: var(--app-text-color)

.double-table-container
  display: flex
  overflow-x: auto
  overflow-y: hidden
  scrollbar-width: thin
  padding-bottom: 1rem
  min-width: 100%
  cursor: grab
  
  /* Включаем инерционный скролл и разрешаем перетаскивание */
  -webkit-overflow-scrolling: touch
  scroll-behavior: smooth
  
  &::-webkit-scrollbar
    height: .6rem
    display: block
  
  &::-webkit-scrollbar-thumb
    background-color: var(--app-border-color)
    border-radius: .4rem
    
  
  &::-webkit-scrollbar-track
    background-color: var(--app-bg-color)
    border-radius: .4rem
  
  /* Улучшенные стили для Telegram */
  .tg-theme-dark &,
  .tg-theme-light &
    scrollbar-color: var(--tg-theme-secondary-bg-color) var(--tg-theme-bg-color)
    &::-webkit-scrollbar-thumb
      background-color: var(--tg-theme-secondary-bg-color)
    &::-webkit-scrollbar-track
      background-color: var(--tg-theme-bg-color)
  
  @include respond(computer)
    &::-webkit-scrollbar
      height: .8rem

.table-wrapper
  min-width: 100%  
  width: 35rem      
  flex: 0 0 auto  

.table
  min-width: 100%  
  width: 30rem      
  flex: 0 0 auto
  background-color: var(--app-secondary-bg)
  overflow: hidden
  display: flex
  flex-direction: column
  transition: transform 0.2s ease
  border: .1rem solid var(--app-border-color)

  tr
    min-height: 5rem
    height: auto !important
    margin-top: -0.1rem

  th,
  td
    font-size: 1rem
    font-weight: 400
    box-sizing: border-box
    overflow-wrap: break-word
    
    @include respond(small-phone)
      font-size: 0.8rem

  &__title
    font-size: 1.15rem
    font-weight: 600
    padding: 0.9rem
    background-color: var(--app-primary-color)
    color: $color-white
    text-align: center
    margin: 0
    letter-spacing: 0.05rem
    white-space: nowrap
    overflow: hidden
    text-overflow: ellipsis

  &__content
    width: 100%
    display: flex
    flex-direction: column

    &-row
      position: relative
      display: flex
      width: 100%
      justify-content: space-between
      align-items: flex-start
      min-height: 5rem
      background-color: var(--app-bg-color)
      transition: all 0.2s ease
      box-shadow: 0 .1rem .3rem rgba(0, 0, 0, 0.05)
      border: solid 0.1rem var(--app-border-color)
      border-collapse: collapse

      &-time
        align-self: center
        padding: 0.5rem
        flex: 0 0 15%
        font-size: 0.95rem
        color: var(--app-text-color)
        font-weight: 500
        line-height: 1.3
        text-align: center

      &-color
        width: 0.7rem
        min-height: 100%
        margin: 0 0.5rem
        flex-shrink: 0
        align-self: stretch
        background-color: var(--app-border-color)
        &--seminar
          background-color: var(--app-border-color)
        &--lection
          background-color: $color-orange

      &-lesson
        flex: 1
        padding: 0.5rem 0.8rem
        display: flex
        flex-direction: column
        justify-content: center
        min-height: 100%
        &--class
          display: block
          color: var(--app-text-color)
          font-size: 1rem
          margin-bottom: 0.3rem
          line-height: 1.3
        &--details
          color: $color-light-green
          font-size: 0.9rem
          line-height: 1.4
          &:not(:last-child)
            margin-bottom: 0.2rem

      &-room
        flex: 0 0 15%
        text-align: right
        color: var(--app-text-color)
        font-size: 0.95rem
        padding: 0.5rem .5rem 0 0
        white-space: nowrap


@media (orientation: landscape) and (max-width: 1025px)
  .double-week-schedule
    height: 100vh
  
  .double-table-conteiner
    width: 100vw
    gap: 1rem
    
    &::-webkit-scrollbar
      display: none
    
    scrollbar-width: none

  .table-wrapper
    min-width: calc(50vw - 2.5rem) // 50% ширины минус отступы и промежуток
    width: calc(50vw - 2.5rem)
    flex: 0 0 auto

  .table 
    min-width: 100%
    width: 100%
    &__title
      font-size: 1rem
      padding: 0.7rem
</style>