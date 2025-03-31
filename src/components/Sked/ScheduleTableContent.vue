<template>
  <table class="table__content">
    <tbody>
    <ScheduleTableRow v-for="(row, index) in normalizedRows" :key="index" :row="row"/>
    </tbody>
  </table>
</template>

<script>
import ScheduleTableRow from './ScheduleTableRow.vue'

const defaultRows = [
  { time: '08:00<br>09:30', type: 'seminar' },
  { time: '09:45<br>11:15', type: 'seminar' },
  { time: '11:30<br>13:00', type: 'seminar' },
  { time: '13:50<br>15:20', type: 'seminar' },
  { time: '15:35<br>17:05', type: 'seminar' },
  { time: '17:20<br>18:50', type: 'seminar' },
];

export default {
  name: 'ScheduleTableContent',
  components: {
    ScheduleTableRow
  },
  data() {
    return {
      rows: [
        {
          time: '08:00<br>09:30',
          type: 'lection',
          lesson: 'Веб-дизайн и интернет-программирование',
          teacher: 'ПИ2303/1 Лаптев С.В., ПИ2303/2 Чемарина А.В',
          room: '635гл'
        },
        {
          time: '09:45<br>11:15',
          type: 'lection',
          lesson: 'Веб-дизайн и интернет-программирование',
          teacher: 'ПИ2303/1 Лаптев С.В., ПИ2303/2 Чемарина А.В',
          room: '635гл'
        },{
          time: '11:30<br>13:00',
          type: 'lection',
          lesson: 'Веб-дизайн и интернет-программирование',
          teacher: 'ПИ2303/1 Лаптев С.В., ПИ2303/2 Чемарина А.В',
          room: '635гл'
        },
        {
          time: '13:50<br>15:20',
          type: 'lection',
          lesson: 'Веб-дизайн и интернет-программирование',
          teacher: 'ПИ2303/1 Лаптев С.В., ПИ2303/2 Чемарина А.В',
          room: '635гл'
        },
        {
          time: '15:35<br>17:05',
          type: 'lection',
          lesson: 'Веб-дизайн и интернет-программирование',
          teacher: 'ПИ2303/1 Лаптев С.В., ПИ2303/2 Чемарина А.В',
          room: '635гл'
        },
        {
          time: '17:20<br>18:50',
          lesson: 'Веб-дизайн и интернет-программирование',
          teacher: 'ПИ2303/1 Лаптев С.В., ПИ2303/2 Чемарина А.В',
          room: '209гл'
        },

      ]
    }
  },
  computed: {
    normalizedRows() {
      return defaultRows.map(defaultRow => {
        const dataRow = this.rows.find(r => r.time === defaultRow.time) || {}
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
  watch: {
    normalizedRows: {
      immediate: true,
      handler(rows) {
        this.$store.dispatch('updateAvailableLessons', rows)
      }
    }
  }
}
</script>

