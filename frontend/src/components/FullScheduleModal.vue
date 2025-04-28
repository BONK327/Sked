<template>
  <div class="full-schedule-modal" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="table__title">Расписание на неделю (Неделя {{ currentWeekNumber }})</h2>
        <button class="close-btn" @click="closeModal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
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
                  ]">{{ getMainDetails(dayIndex, row.time) }}</span>
                </div>
                <div class="table__content-row-room">
                  <span :class="[
                    'table__content-row-room--num',

                  ]">{{ getRoomDetails(dayIndex, row.time) }}</span>
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
      isLoading: false
    }
  },
  computed: {
    ...mapGetters([
      'currentWeekSchedule',
      'currentWeekNumber',
      'searchType'
    ])
  },
  methods: {
    ...mapActions(['fetchFullWeekSchedule']),

    closeModal() {
      this.$emit('close')
    },

    getTimeSlotsForDay(dayIndex) {
      return dayIndex === 5 ? saturdayRows : defaultRows
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

      return items.map(item => {
        const teacherName = item.name || item.teacher || ''
        const subgroup = item.subgroup ||
          (item.groups?.[0]?.subgroup) || ''

        if (!teacherName) return ''

        const nameParts = teacherName.split(' ')
        const shortName = nameParts[0] + ' ' +
          (nameParts[1] ? nameParts[1][0] + '.' : '') +
          (nameParts[2] ? nameParts[2][0] + '.' : '')

        return subgroup ? `${teacherName}(${subgroup})` : teacherName
      }).filter(Boolean).join(', ')
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
        return [...uniqueGroups].join(', ')
      }

      return groups.map(g => {
        let str = g.group
        if (g.subgroup) str += `(${g.subgroup})`
        return str
      }).join(', ')
    },

    formatRoomsWithSubgroups(items) {
      if (!items) return ''
      const roomMap = new Map()
      const allSubgroups = new Set()

      items.forEach(item => {
        if (item.subgroup) {
          allSubgroups.add(item.subgroup)
        }
      })

      items.forEach(item => {
        if (item.room) {
          if (!roomMap.has(item.room)) {
            roomMap.set(item.room, new Set())
          }
          if (item.subgroup) {
            roomMap.get(item.room).add(item.subgroup)
          }
        }
      })

      return [...roomMap.entries()].map(([room, subgroups]) => {
        return subgroups.size === allSubgroups.size ? room : `${room}(${[...subgroups].join(',')})`
      }).join(', ')
    }
  },
  async created() {
    this.isLoading = true
    try {
      await this.fetchFullWeekSchedule()
    } catch (error) {
      console.error('Ошибка загрузки расписания:', error)
    } finally {
      this.isLoading = false
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
  background-color: $color-bg-bigScreen
  display: flex
  justify-content: center
  align-items: center
  z-index: 1000
  overflow: auto

.modal-content
  background-color: $color-white
  width: 100%
  max-width: 40rem
  align-self: flex-start
  height: calc(100vh - #{$header-height} - #{$footer-height} + 8rem)
  display: flex
  flex-direction: column
  overflow: hidden
  &::-webkit-scrollbar
    width: .6rem
  &::-webkit-scrollbar-track
    background: rgba(0, 0, 0, 0.05)
    border-radius: .3rem
  &::-webkit-scrollbar-thumb
    background: $color-light-green
    border-radius: .3rem

.close-btn
  background: none
  border: none
  cursor: pointer
  z-index: 10

.modal-header
  display: flex
  justify-content: space-between
  padding: 1rem
  background-color: $color-light-green
  color: white
  border-radius: 0 0 .8rem .8rem
  h2
    font-size: 1.5rem
    font-weight: 400
    margin: 0

.modal-body
  flex: 1
  overflow-y: auto
  padding: 1.5rem 1.5rem 4rem 1.5rem
  &::-webkit-scrollbar
    width: .6rem
  &::-webkit-scrollbar-track
    background: rgba(0, 0, 0, 0.05)
    border-radius: 3px
  &::-webkit-scrollbar-thumb
    background: $color-light-green
    border-radius: 3px

.week-schedule
  display: grid
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))
  gap: 1.5rem

.table
  width: 100%
  min-height: 100%
  background-color: $color-table-border
  border-radius: 0.3rem 0.3rem 0 0
  overflow: hidden
  display: flex
  flex-direction: column
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
      &-time
        align-self: center
        padding: 1.5rem 0.5rem
        flex: 0 0 auto
        font-size: 1rem
        font-weight: 400
        box-sizing: border-box
        overflow-wrap: break-word
        @include respond(small-phone)
          font-size: 0.8rem
      &-color
        width: 0.75rem
        flex: 0 0 auto
        min-height: 5rem
        align-self: stretch
      &-color--seminar
        background-color: $color-table-border
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
        @include respond(small-phone)
          font-size: 0.8rem
        &--num
          letter-spacing: -0.03rem

.green-text
  color: $color-light-green
</style>