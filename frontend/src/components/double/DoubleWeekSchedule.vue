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
                  class="table__content-row" :ref="`first-row-${dayIndex}-${rowIndex}`">
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
                  class="table__content-row" :ref="`second-row-${dayIndex}-${rowIndex}`">
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
    syncRowHeights() {
      this.$nextTick(() => {
        const days = this.$el.querySelectorAll('.day-section');
        
        days.forEach(day => {
          const tables = day.querySelectorAll('.table-wrapper');
          if (tables.length !== 2) return;
          
          const rows1 = tables[0].querySelectorAll('.table__content-row');
          const rows2 = tables[1].querySelectorAll('.table__content-row');
          
          // Сначала сбросим все высоты
          rows1.forEach(row => {
            row.style.minHeight = '';
            row.style.height = '';
          });
          rows2.forEach(row => {
            row.style.minHeight = '';
            row.style.height = '';
          });
          
          // Затем синхронизируем
          rows1.forEach((row1, index) => {
            const row2 = rows2[index];
            if (!row2) return;
            
            // Получаем реальные высоты после сброса
            const height1 = row1.getBoundingClientRect().height;
            const height2 = row2.getBoundingClientRect().height;
            
            // Устанавливаем максимальную высоту
            const maxHeight = Math.max(height1, height2);
            if (maxHeight > 0) {
              row1.style.minHeight = `${maxHeight}px`;
              row1.style.height = `${maxHeight}px`;
              row2.style.minHeight = `${maxHeight}px`;
              row2.style.height = `${maxHeight}px`;
            }
          });
        });
      });
    },
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
  watch: {
    firstSchedule: {
      handler() {
        this.syncRowHeights()
      },
      deep: true
    },
    secondSchedule: {
      handler() {
        this.syncRowHeights()
      },
      deep: true
    },
    currentWeek() {
      this.syncRowHeights()
    }
  },
  mounted() {
    this.syncRowHeights();
    if (this.isTelegram) {
      this.$refs.scrollContainer.style.overscrollBehavior = 'none';
    }
    
    window.addEventListener('resize', this.syncRowHeights);
    window.addEventListener('orientationchange', this.syncRowHeights);
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.syncRowHeights);
    window.removeEventListener('orientationchange', this.syncRowHeights);
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
  overflow-x: auto
  padding-bottom: 1rem
  scrollbar-width: none
  &::-webkit-scrollbar
    display: none

.schedule-container
  width: 100%
  min-height: 100%
  display: flex
  flex-direction: column
  gap: clamp(1rem, 3vw, 1.5rem)
  background-color: var(--tg-secondary-bg-color)
  padding: 0 clamp(0.5rem, 2vw, 1rem)

.day-section
  display: flex
  flex-direction: column
  gap: clamp(0.5rem, 2vw, 0.75rem)
  &:last-child
    margin-bottom: $footer-height

.day-title
  font-size: clamp(1rem, 4vw, 1.2rem)
  font-weight: 600
  color: var(--app-text-color)
  margin: 0
  padding: 0 clamp(0.3rem, 1.5vw, 0.5rem)
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis

.double-table-container
  display: flex
  gap: clamp(0.5rem, 2vw, 1rem)
  width: 100%
  align-items: stretch
  overflow-x: auto
  scroll-snap-type: x proximity
  scroll-padding: 1rem
  padding-bottom: 1rem
  -webkit-overflow-scrolling: touch
  flex-wrap: nowrap

  .table-wrapper
    scroll-snap-align: start
    min-width: calc(90vw - 2rem)
    width: calc(90vw - 2rem)
    display: flex
    flex-direction: column
    flex: 1 0 auto
    transition: min-width 0.3s ease, width 0.3s ease

.table
  width: 100%
  flex: 1
  display: flex
  flex-direction: column 
  background-color: var(--app-secondary-bg) 
  overflow: hidden 
  border: clamp(0.05rem, 0.3vw, 0.1rem) solid var(--app-border-color) 
  border-radius: clamp(0.3rem, 1vw, 0.5rem) 
 
  &__title 
    font-size: clamp(0.9rem, 3.5vw, 1.15rem)
    font-weight: 600
    padding: clamp(0.4rem, 1.8vw, 0.9rem)
    background-color: #23783a
    color: $color-white
    text-align: center
    margin: 0
    white-space: nowrap
    overflow: hidden
    text-overflow: ellipsis

  &__content
    width: 100%
    display: flex
    flex-direction: column
    flex: 1

    &-row
      display: flex
      width: 100%
      min-height: clamp(3rem, 10vw, 5rem)
      background-color: var(--app-bg-color)
      border-bottom: clamp(0.05rem, 0.3vw, 0.1rem) solid var(--app-border-color)
      box-sizing: border-box
      
      &:last-child
        border-bottom: none

      &-time
        flex: 0 0 clamp(12%, 15vw, 15%)
        padding: clamp(0.2rem, 1vw, 0.5rem)
        font-size: clamp(0.7rem, 3vw, 0.95rem)
        color: var(--app-text-color)
        font-weight: 500
        line-height: 1.3
        text-align: center
        display: flex
        align-items: center
        justify-content: center
        word-break: break-word

      &-color
        width: clamp(0.4rem, 1.5vw, 0.7rem)
        flex-shrink: 0
        background-color: var(--app-border-color)
        &--seminar
          background-color: var(--app-border-color)
        &--lection
          background-color: $color-orange

      &-lesson
        flex: 1
        padding: clamp(0.3rem, 1vw, 0.5rem) clamp(0.3rem, 1.3vw, 0.8rem)
        display: flex
        flex-direction: column
        justify-content: center
        min-height: 100%
        &--class
          color: var(--app-text-color)
          font-size: clamp(0.75rem, 2.8vw, 1rem)
          margin-bottom: clamp(0.1rem, 0.4vw, 0.3rem)
          line-height: 1.3
          word-break: break-word
        &--details
          color: $color-light-green
          font-size: clamp(0.65rem, 2.3vw, 0.9rem)
          line-height: 1.4
          word-break: break-word

      &-room
        flex: 0 0 auto
        min-width: 15%
        padding: 0.5rem 0.5rem 0 0
        color: var(--app-text-color)
        font-size: clamp(0.7rem, 3vw, 0.95rem)
        display: flex
        align-items: center
        justify-content: flex-end
        white-space: nowrap
        width: max-content

// Мелкие телефоны (до 321px)
@include respond(small-phone)
  .double-table-container
    .table-wrapper
      min-width: 84vw
      width: 84vw

// Телефоны (321px - 481px)
@include respond(phone)
  .double-table-container
    .table-wrapper
      min-width: 86vw
      width: 86vw

// Планшеты в портретной ориентации (481px - 769px)
@include respond(tab-port)
  .double-table-container
    .table-wrapper
      min-width: 62.5vw
      width: 62.5vw

// Планшеты в ландшафтной ориентации (769px - 1025px)
@include respond(tab-lend)
  .double-table-container
    .table-wrapper
      min-width: calc(45vw - 2.3rem)
      width: calc(45vw - 2.3rem)

// Компьютеры (1025px - 1281px)
@include respond(computer)
  .double-table-container
    .table-wrapper
      min-width: 35vw
      width: 35vw

// Большие экраны (от 1281px)
@include respond(big-screen)
  .double-table-container
    .table-wrapper
      min-width: 34vw
      width: 34vw
</style>
