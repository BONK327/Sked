<template>
  <section>
    <swiper
        class="table-swiper"
        :slides-per-view="1"
        :space-between="50"
        @swiper="onSwiper"
        @slide-change="onSlideChange"
        :initial-slide="initialSlide"
        :key="swiperKey"
    >
      <swiper-slide v-for="(day, index) in days" :key="index">
        <section class="table">
          <h2 class="table__title">
            {{ day?.fullDayName || '' }} | {{ day?.date || '' }} {{ day?.month || '' }}
          </h2>
          <ScheduleTableContent :day-index="index" />
        </section>
      </swiper-slide>
    </swiper>
  </section>
</template>

<script>
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import { mapGetters, mapActions } from 'vuex'
import ScheduleTableContent from "@/components/Sked/ScheduleTableContent.vue"

export default {
  name: 'ScheduleTable',
  components: {
    Swiper,
    SwiperSlide,
    ScheduleTableContent
  },
  data() {
    return {
      swiperInstance: null,
      localSelectedDayIndex: 0 // Track the selected day index locally
    }
  },
  computed: {
    ...mapGetters(['days', 'selectedDayIndex', 'monthNames', 'currentWeekType']),
    initialSlide() {
      // Initialize with the stored selected day index
      return this.localSelectedDayIndex;
    },
    swiperKey() {
      // Include currentWeekType to force swiper recreation when week changes
      return `${this.currentWeekType}`;
    }
  },
  methods: {
    ...mapActions(['setSelectedDay']),

    onSwiper(swiper) {
      this.swiperInstance = swiper;
      // Set initial slide based on localSelectedDayIndex
      swiper.slideTo(this.localSelectedDayIndex);
    },

    onSlideChange(swiper) {
      const dayIndex = swiper.activeIndex;
      this.localSelectedDayIndex = dayIndex; // Update local index
      if (this.days[dayIndex]) {
        this.setSelectedDay({
          ...this.days[dayIndex],
          dayIndex: dayIndex
        });
      }
    },
  },
  watch: {
    // When days change (week switch), reset to the stored day index
    days() {
      this.$nextTick(() => {
        if (this.swiperInstance && this.localSelectedDayIndex !== undefined) {
          this.swiperInstance.slideTo(this.localSelectedDayIndex);
        }
      });
    },

    // Handle external changes to selectedDayIndex
    selectedDayIndex(newIndex) {
      if (newIndex !== undefined && newIndex !== this.localSelectedDayIndex) {
        this.localSelectedDayIndex = newIndex;
        if (this.swiperInstance) {
          this.swiperInstance.slideTo(newIndex);
        }
      }
    }
  },
  created() {
    // Initialize localSelectedDayIndex with the store value
    this.localSelectedDayIndex = this.selectedDayIndex || 0;
  }
}
</script>

<style lang="sass" scoped>
@import "@/assets/styles/variables.sass"
@import "@/assets/styles/mixins.sass"
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
      @include respond(small-phone)
        height: 6rem
        border: solid 0.15rem $color-table-border
      @include respond(phone)
        height: 6rem
        border: solid 0.15rem $color-table-border
    th,
    td
      font-size: 0.8rem
      font-weight: 400
      @include respond(small-phone)
        font-size: 1.2rem
      @include respond(phone)
        font-size: 1.2rem

.table-swiper
  width: 100%
  height: 100%


.swiper-slide
  height: 100%

</style>