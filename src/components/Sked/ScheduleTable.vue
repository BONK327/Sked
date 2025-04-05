<template>
  <section
      class="table"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseLeave"
  >
    <h2 class="table__title">{{ formattedDate }}</h2>
    <ScheduleTableContent />
  </section>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import ScheduleTableContent from "@/components/Sked/ScheduleTableContent.vue"

export default {
  name: 'ScheduleTable',
  components: {
    ScheduleTableContent
  },
  data() {
    return {
      touchStartX: null,
      touchStartY: null,
      mouseStartX: null,
      isSwiping: false,
      swipeThreshold: 50
    }
  },
  computed: {
    ...mapGetters(['selectedDay', 'days']),
    formattedDate() {
      if (this.selectedDay) {
        return `${this.selectedDay.fullDayName} | ${this.selectedDay.date} ${this.selectedDay.month}`
      }
      return ''
    }
  },
  methods: {
    ...mapActions(['navigateDay']),

    handleTouchStart(e) {
      this.touchStartX = e.touches[0].clientX
      this.touchStartY = e.touches[0].clientY
      this.isSwiping = false
    },

    handleTouchMove(e) {
      if (!this.touchStartX) return

      const deltaX = e.touches[0].clientX - this.touchStartX
      const deltaY = e.touches[0].clientY - this.touchStartY

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        e.preventDefault()
        this.isSwiping = true
      }
    },

    handleTouchEnd(e) {
      if (!this.touchStartX || !this.isSwiping) return

      const deltaX = e.changedTouches[0].clientX - this.touchStartX
      if (Math.abs(deltaX) > this.swipeThreshold) {
        this.navigateDay(deltaX > 0 ? -1 : 1)
      }

      this.resetTouch()
    },

    handleMouseDown(e) {
      this.mouseStartX = e.clientX
      this.isSwiping = false
    },

    handleMouseUp(e) {
      if (!this.mouseStartX || !this.isSwiping) return

      const deltaX = e.clientX - this.mouseStartX
      if (Math.abs(deltaX) > this.swipeThreshold) {
        this.navigateDay(deltaX > 0 ? -1 : 1)
      }

      this.resetMouse()
    },

    handleMouseLeave() {
      this.resetMouse()
    },

    resetTouch() {
      this.touchStartX = null
      this.touchStartY = null
      this.isSwiping = false
    },

    resetMouse() {
      this.mouseStartX = null
      this.isSwiping = false
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
  user-select: none
  touch-action: pan-y // Разрешаем вертикальную прокрутку

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