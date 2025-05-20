<template>
  <div class="double-week-schedule" ref="scrollContainer">
    <div class="schedule-container">
      <div v-for="(day, dayIndex) in weekDays" :key="dayIndex" class="day-section">
        <h3 class="day-title">{{ day.fullName }}</h3>
        <div class="double-table-container">
          <!-- Первое расписание -->
          <div class="table-wrapper">
            <div class="table">
              <h4 class="table__title">{{ firstTitle || 'Первое расписание' }}</h4>
              <div class="table__content">
                <div v-for="(row, rowIndex) in getTimeSlotsForDay(dayIndex)" :key="'first-' + rowIndex"
                  class="table__content-row">
                  <div class="table__content-row-time" v-html="row.time"></div>
                  <div class="table__content-row-color" :class="{
                    'table__content-row-color--lection': getLessonType(dayIndex, row.time, 'first') === 'lection',
                    'table__content-row-color--seminar': getLessonType(dayIndex, row.time, 'first') !== 'lection'
                  }"></div>
                  <div class="table__content-row-lesson">
                    <template v-if="getLessonForDay(dayIndex, row.time, 'first')">
                      <span class="table__content-row-lesson--class">
                        {{ getLessonName(dayIndex, row.time, 'first') }}
                      </span>
                      <span class="table__content-row-lesson--details"
                        v-html="getMainDetails(dayIndex, row.time, 'first')"></span>
                    </template>
                    <template v-else>
                      <span class="table__content-row-lesson--class"></span>
                    </template>
                  </div>
                  <div class="table__content-row-room" v-html="getRoomDetails(dayIndex, row.time, 'first')"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Второе расписание -->
          <div class="table-wrapper">
            <div class="table">
              <h4 class="table__title">{{ secondTitle || 'Второе расписание' }}</h4>
              <div class="table__content">
                <div v-for="(row, rowIndex) in getTimeSlotsForDay(dayIndex)" :key="'second-' + rowIndex"
                  class="table__content-row">
                  <div class="table__content-row-time" v-html="row.time"></div>
                  <div class="table__content-row-color" :class="{
                    'table__content-row-color--lection': getLessonType(dayIndex, row.time, 'second') === 'lection',
                    'table__content-row-color--seminar': getLessonType(dayIndex, row.time, 'second') !== 'lection'
                  }"></div>
                  <div class="table__content-row-lesson">
                    <template v-if="getLessonForDay(dayIndex, row.time, 'second')">
                      <span class="table__content-row-lesson--class">
                        {{ getLessonName(dayIndex, row.time, 'second') }}
                      </span>
                      <span class="table__content-row-lesson--details"
                        v-html="getMainDetails(dayIndex, row.time, 'second')"></span>
                    </template>
                    <template v-else>
                      <span class="table__content-row-lesson--class"></span>
                    </template>
                  </div>
                  <div class="table__content-row-room" v-html="getRoomDetails(dayIndex, row.time, 'second')"></div>
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
  { time: '17:20<br>18:50', type: 'seminar' }
];

const saturdayRows = [
  { time: '08:00<br>09:30', type: 'seminar' },
  { time: '09:45<br>11:15', type: 'seminar' },
  { time: '11:30<br>13:00', type: 'seminar' },
  { time: '13:15<br>14:45', type: 'seminar' },
  { time: '15:00<br>16:30', type: 'seminar' },
  { time: '16:45<br>18:15', type: 'seminar' }
];

export default {
  name: 'DoubleWeekSchedule',
  props: {
    firstSchedule: {
      type: Object,
      default: () => ({})
    },
    secondSchedule: {
      type: Object,
      default: () => ({})
    },
    firstTitle: String,
    secondTitle: String,
    currentWeek: {
      type: Number,
      default: 1
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
  computed: {
    formattedFirstSchedule() {
      const weekKey = `week${this.currentWeek}`;
      return this.firstSchedule[weekKey] || {};
    },
    formattedSecondSchedule() {
      const weekKey = `week${this.currentWeek}`;
      return this.secondSchedule[weekKey] || {};
    }
  },
  methods: {
    getTimeSlotsForDay(dayIndex) {
      return dayIndex === 5 ? saturdayRows : defaultRows;
    },

    getLessonsForDay(dayIndex, scheduleKey) {
      const schedule = scheduleKey === 'first'
        ? this.formattedFirstSchedule
        : this.formattedSecondSchedule;
      const lessons = schedule[dayIndex] || [];
      return lessons;
    },

    getLessonForDay(dayIndex, time, scheduleKey) {
      const lessons = this.getLessonsForDay(dayIndex, scheduleKey);
      const timeToCompare = time.replace('<br>', ' ');

      const foundLesson = lessons.find(lesson => {
        if (!lesson.time) return false;
        const lessonTime = lesson.time.replace('<br>', ' ');
        return lessonTime === timeToCompare;
      });


      return foundLesson || null;
    },

    getLessonName(dayIndex, time, scheduleKey) {
      const lesson = this.getLessonForDay(dayIndex, time, scheduleKey);
      return lesson?.name || '';
    },

    getLessonType(dayIndex, time, scheduleKey) {
      const lesson = this.getLessonForDay(dayIndex, time, scheduleKey);
      return lesson?.type || 'seminar';
    },

    getMainDetails(dayIndex, time, scheduleKey) {
      const lesson = this.getLessonForDay(dayIndex, time, scheduleKey);
      if (!lesson) return '';

      const searchType = this.$store.state.doubleSchedules[scheduleKey === 'first' ? 'first' : 'second'].type;

      if (searchType === 'room') {
        // Форматирование как в обычном расписании
        const teachers = lesson.details?.map(d => {
          if (!d?.name) return '';
          const nameParts = d.name.split(' ');
          return nameParts[0] + ' ' +
            (nameParts[1]?.[0] || '') + '.' +
            (nameParts[2]?.[0] || '.');
        }).filter(Boolean).join('<br>') || '';

        return `${teachers}<br>`;
      }
      else if (searchType === 'teacher') {
        return lesson.details?.map(d =>
          d.group + (d.subgroup ? `(${d.subgroup})` : '')
        ).join('<br>') || '';
      }
      else {
        return lesson.teachers?.map(t => {
          if (!t?.name) return '';
          const nameParts = t.name.split(' ');
          return nameParts[0] + ' ' +
            (nameParts[1]?.[0] || '') + '.' +
            (nameParts[2]?.[0] || '.') +
            (t.subgroup ? `(${t.subgroup})` : '');
        }).join('<br>') || '';
      }
    },

    getRoomDetails(dayIndex, time, scheduleKey) {
      const lesson = this.getLessonForDay(dayIndex, time, scheduleKey);
      if (!lesson) return '';

      const searchType = this.$store.state.doubleSchedules[scheduleKey === 'first' ? 'first' : 'second'].type;

      if (searchType === 'room') {
        return lesson.details?.flatMap(d =>
          d.groups?.map(g => g.group.split('(')[0])
        ).filter(Boolean).join('<br>') || '';
      }
      else if (searchType === 'teacher') {
        return lesson.room || '';
      }
      else {
        return lesson.teachers?.map(t =>
          t.room.toLowerCase() + (t.subgroup ? `(${t.subgroup})` : '')
        ).join('<br>') || '';
      }
    },

    formatTeachersWithSubgroups(items) {
      if (!items || !items.length) return '';

      const uniqueTeachers = new Map();
      items.forEach(item => {
        const teacherName = item.name || item.teacher || '';
        const subgroup = item.subgroup || (item.groups?.[0]?.subgroup) || '';

        if (teacherName) {
          if (!uniqueTeachers.has(teacherName)) {
            uniqueTeachers.set(teacherName, new Set());
          }
          if (subgroup) {
            uniqueTeachers.get(teacherName).add(subgroup);
          }
        }
      });

      return [...uniqueTeachers.entries()].map(([name, subgroups]) => {
        return subgroups.size > 0 ? `${name}(${[...subgroups].join(',')})` : name;
      }).join('<br>');
    },

    formatGroupsWithSubgroups(groups) {
      if (!groups) return '';

      return groups.map(g => {
        let str = g.group;
        if (g.subgroup) str += `(${g.subgroup})`;
        return str;
      }).join('<br>');
    },

    formatRoomsWithSubgroups(items) {
      if (!items) return '';

      const roomMap = new Map();
      const allSubgroups = new Set();

      items.forEach(item => {
        if (item.subgroup) allSubgroups.add(item.subgroup);
        if (item.room) {
          if (!roomMap.has(item.room)) {
            roomMap.set(item.room, new Set());
          }
          if (item.subgroup) {
            roomMap.get(item.room).add(item.subgroup);
          }
        }
      });

      return [...roomMap.entries()].map(([room, subgroups]) => {
        return subgroups.size > 0 && subgroups.size !== allSubgroups.size
          ? `${room}(${[...subgroups].join(',')})`
          : room;
      }).join('<br>');
    }
  },
  mounted() {
    if (this.isTelegram) {
      this.$refs.scrollContainer.style.overscrollBehavior = 'none';
    }
  },
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
    margin-bottom: calc(2rem + #{$footer-height})

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
    &:active
      cursor: grabbing

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