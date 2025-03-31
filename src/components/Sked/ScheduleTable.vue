<template>
  <section class="table">
    <h2 class="table__title">{{ formattedDate }}</h2>
    <ScheduleTableContent />
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import ScheduleTableContent from "@/components/Sked/ScheduleTableContent.vue";

export default {
  name: 'ScheduleTable',
  components: {
    ScheduleTableContent
  },
  computed: {
    ...mapGetters(['selectedDay']),
    formattedDate() {
      if (this.selectedDay) {
        return `${this.selectedDay.fullDayName} | ${this.selectedDay.date} ${this.selectedDay.month}`;
      }

      // Дефолтные значения при первой загрузке
      const today = new Date();
      const dayNames = ['Воскресенье', 'Понедельник', 'Вторник',
        'Среда', 'Четверг', 'Пятница', 'Суббота'];
      const monthNames = ['января', 'февраля', 'марта', 'апреля',
        'мая', 'июня', 'июля', 'августа',
        'сентября', 'октября', 'ноября', 'декабря'];

      return `${dayNames[today.getDay()]} | ${today.getDate()} ${monthNames[today.getMonth()]}`;
    }
  }
}
</script>

<style lang="sass" scoped>
@import "@/assets/styles/variables.sass"
.table
  width: 100%
  min-height: 100%
  background-color: $color-table-border
  border-radius: 0.3rem 0.3rem 0 0
  overflow: hidden
  margin-bottom: 1.5rem
  display: flex
  flex-direction: column
  &__title
    font-size: 1.5rem
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
      &-time
        align-self: center
        padding: 1.5rem 0.5rem
        flex: 0 0 auto
      &-color--seminar
        width: 0.75rem
        background-color: $color-table-border
        flex: 0 0 auto
      &-color--lection
        width: 0.75rem
        background-color: $color-orange
        flex: 0 0 auto
      &-lesson
        padding: 0.5rem 0.8rem
        flex: 1
        &--class
          display: inline-block
          line-height: 1rem
          margin-bottom: 0.2rem
        &--teacher
          color: $color-light-green
      &-room
        align-self: flex-start
        text-align: center
        padding: 0.5rem 0.3rem 0.5rem 0
        flex: 0 0 auto
        &--num
          letter-spacing: -0.03rem
        &-note
          margin-top: 0.3rem
          cursor: pointer

    tr
      height: 5rem
      background-color: white
      border: solid 0.1rem $color-table-border
      margin-top: -0.1rem
    th,
    td
      font-size: 0.8rem
      font-weight: 400

</style>