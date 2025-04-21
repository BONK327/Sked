<template>
  <table v-if="normalizedRows.length" class="table__content">
    <tbody>
    <ScheduleTableRow v-for="(row, index) in normalizedRows" :key="index" :row="row"/>
    </tbody>
  </table>
  <div v-else class="no-data">
    Нет данных для отображения
  </div>
</template>

<script>
import {mapActions} from 'vuex'
import ScheduleTableRow from './ScheduleTableRow.vue'

const defaultRows = [
  {time: '08:00<br>09:30', type: 'seminar'},
  {time: '09:45<br>11:15', type: 'seminar'},
  {time: '11:30<br>13:00', type: 'seminar'},
  {time: '13:50<br>15:20', type: 'seminar'},
  {time: '15:35<br>17:05', type: 'seminar'},
  {time: '17:20<br>18:50', type: 'seminar'},
];

const saturdayRows = [
  {time: '08:00<br>09:30', type: 'seminar'},
  {time: '09:45<br>11:15', type: 'seminar'},
  {time: '11:30<br>13:00', type: 'seminar'},
  {time: '13:15<br>14:45', type: 'seminar'},
  {time: '15:00<br>16:30', type: 'seminar'},
  {time: '16:45<br>18:15', type: 'seminar'},
];

export default {
  name: 'ScheduleTableContent',
  components: {
    ScheduleTableRow
  },
  props: {
    dayIndex: {
      type: Number,
      required: true
    }
  },
  computed: {
    currentDaySchedule() {
      return this.$store.getters.currentWeekSchedule[this.dayIndex] || [];
    },
    timeSlots() {
      return this.dayIndex === 5 ? saturdayRows : defaultRows
    },
    normalizedRows() {
      return this.timeSlots.map(defaultRow => {
        const dataRow = this.currentDaySchedule.find(r => r.time === defaultRow.time) || {}
        return {
          ...defaultRow,
          type: dataRow.type || defaultRow.type,
          lesson: dataRow.lesson || '',
          teacher: dataRow.teacher || '',
          room: dataRow.room || ''
        }
      })
    }
  },
  methods: {
    ...mapActions(['updateAvailableLessons', 'updateFullWeekSchedule'])
  },
  watch: {
    normalizedRows: {
      immediate: true,
      handler(rows) {
        this.updateAvailableLessons(rows)
      }
    }
  }
}
</script>