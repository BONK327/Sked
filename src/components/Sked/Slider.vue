<template>
  <section class="slider">
    <svg
        class="slider__left"
        :class="{ 'slider__arrow-disabled': weekOffset <= -2 }"
        width="6"
        height="10"
        viewBox="0 0 6 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        @click="prevWeek"
    >
      <path d="M5.74688 0.246261C5.66733 0.168229 5.57268 0.106294 5.46841 0.0640274C5.36413 0.021761 5.25228 0 5.13931 0C5.02635 0 4.9145 0.021761 4.81022 0.0640274C4.70594 0.106294 4.6113 0.168229 4.53175 0.246261L0.253122 4.4089C0.172916 4.4863 0.109255 4.57838 0.0658112 4.67983C0.0223672 4.78128 0 4.8901 0 5C0 5.1099 0.0223672 5.21872 0.0658112 5.32017C0.109255 5.42162 0.172916 5.5137 0.253122 5.5911L4.53175 9.75374C4.6113 9.83177 4.70594 9.89371 4.81022 9.93597C4.9145 9.97824 5.02635 10 5.13931 10C5.25228 10 5.36413 9.97824 5.46841 9.93597C5.57268 9.89371 5.66733 9.83177 5.74688 9.75374C5.82708 9.67634 5.89074 9.58427 5.93419 9.48281C5.97763 9.38136 6 9.27255 6 9.16264C6 9.05274 5.97763 8.94392 5.93419 8.84247C5.89074 8.74102 5.82708 8.64894 5.74688 8.57155L2.06726 5L5.74688 1.42845C5.82708 1.35106 5.89074 1.25898 5.93419 1.15753C5.97763 1.05608 6 0.94726 6 0.837356C6 0.727452 5.97763 0.618636 5.93419 0.517185C5.89074 0.415733 5.82708 0.323655 5.74688 0.246261Z"
            :fill="weekOffset <= -2 ? '#CCCCCC' : '#1E1E1E'"/>
    </svg>

    <div class="slider-days">
      <div
          v-for="(day, index) in days"
          :key="'day-'+index"
          class="slider__day"
          :class="{
          'slider__day-active': day.isActive,
          'slider__day-prev-active': day.isCurrentDay
        }"
          @click="handleDayClick(index)"
      >
        <div class="date-container">
          <transition name="date-flip" mode="out-in">
            <p :key="day.date" class="slider__day-date">{{ day.date }}</p>
          </transition>
        </div>
        <h2 class="slider__day-week">{{ day.weekDay }}</h2>
      </div>
    </div>

    <svg
        class="slider__right"
        :class="{ 'slider__arrow-disabled': weekOffset >= 2 }"
        width="6"
        height="10"
        viewBox="0 0 6 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        @click="nextWeek"
    >
      <path d="M0.253122 0.246261C0.332673 0.168229 0.427317 0.106294 0.531595 0.0640274C0.635873 0.021761 0.747721 0 0.860687 0C0.973653 0 1.0855 0.021761 1.18978 0.0640274C1.29406 0.106294 1.3887 0.168229 1.46825 0.246261L5.74688 4.4089C5.82708 4.4863 5.89074 4.57838 5.93419 4.67983C5.97763 4.78128 6 4.8901 6 5C6 5.1099 5.97763 5.21872 5.93419 5.32017C5.89074 5.42162 5.82708 5.5137 5.74688 5.5911L1.46825 9.75374C1.3887 9.83177 1.29406 9.89371 1.18978 9.93597C1.0855 9.97824 0.973653 10 0.860687 10C0.747721 10 0.635873 9.97824 0.531595 9.93597C0.427317 9.89371 0.332673 9.83177 0.253122 9.75374C0.172916 9.67634 0.109255 9.58427 0.0658112 9.48281C0.022367 9.38136 0 9.27255 0 9.16264C0 9.05274 0.022367 8.94392 0.0658112 8.84247C0.109255 8.74102 0.172916 8.64894 0.253122 8.57155L3.93274 5L0.253122 1.42845C0.172916 1.35106 0.109255 1.25898 0.0658112 1.15753C0.022367 1.05608 0 0.94726 0 0.837356C0 0.727452 0.022367 0.618636 0.0658112 0.517185C0.109255 0.415733 0.172916 0.323655 0.253122 0.246261Z"
            :fill="weekOffset >= 2 ? '#CCCCCC' : '#1E1E1E'"/>
    </svg>
  </section>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'Slider',
  data() {
    return {
      weekOffset: 0,
      weekDays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
      fullDayNames: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
      monthNames: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
      days: [],
      selectedDate: null // Будем хранить полную дату выбранного дня
    };
  },
  methods: {
    ...mapActions(['setSelectedDay']),

    handleDayClick(index) {
      const clickedDate = new Date();
      clickedDate.setDate(clickedDate.getDate() + this.weekOffset * 7);
      const dayDiff = clickedDate.getDay() === 0 ? 6 : clickedDate.getDay() - 1;
      clickedDate.setDate(clickedDate.getDate() - dayDiff + index);

      this.selectedDate = clickedDate;
      this.updateDays();

      this.setSelectedDay({
        fullDayName: this.fullDayNames[index],
        date: clickedDate.getDate(),
        month: this.monthNames[clickedDate.getMonth()],
        originalDate: clickedDate
      });
    },

    getDayOfWeekName(date) {
      const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
      return days[date.getDay()];
    },

    isSameDay(date1, date2) {
      return date1.getDate() === date2.getDate() &&
          date1.getMonth() === date2.getMonth() &&
          date1.getFullYear() === date2.getFullYear();
    },

    updateDays() {
      const today = new Date();
      const currentDate = today.getDate();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() + this.weekOffset * 7);
      const dayDiff = weekStart.getDay() === 0 ? 6 : weekStart.getDay() - 1;
      weekStart.setDate(weekStart.getDate() - dayDiff);

      this.days = this.weekDays.map((day, index) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + index);

        const isCurrentDay = this.isSameDay(date, today);
        const isSelectedDay = this.selectedDate && this.isSameDay(date, this.selectedDate);

        return {
          date: date.getDate().toString().padStart(2, '0'),
          weekDay: day,
          isActive: isSelectedDay,
          isCurrentDay: isCurrentDay
        };
      });

      // Если это первая загрузка и ничего не выбрано, выбираем текущий день
      if (!this.selectedDate && this.weekOffset === 0) {
        const currentDayIndex = this.days.findIndex(day => day.isCurrentDay);
        if (currentDayIndex !== -1) {
          this.handleDayClick(currentDayIndex);
        }
      }
    },

    prevWeek() {
      if (this.weekOffset > -2) {
        this.weekOffset--;
        this.updateDays();
      }
    },

    nextWeek() {
      if (this.weekOffset < 2) {
        this.weekOffset++;
        this.updateDays();
      }
    }
  },
  mounted() {
    this.updateDays();
  }
};
</script>

<style lang="sass" scoped>
@import "@/assets/styles/variables"

.slider
  display: flex
  width: 100%
  justify-content: space-between
  margin: 0 auto 1.5rem auto
  align-items: center
  position: relative

  &-days
    display: flex
    flex: 1
    justify-content: space-around

  &__left, &__right
    cursor: pointer
    min-width: 1.2rem
    min-height: 1.2rem
    transition: transform 0.2s

    // Hover-эффекты только для устройств с мышью
    @media (hover: hover) and (pointer: fine)
      &:hover:not(.slider__arrow-disabled)
        transform: scale(1.3)

    &:active:not(.slider__arrow-disabled)
      transform: scale(0.8)

  &__arrow-disabled
    cursor: not-allowed
    opacity: 0.5

  &__day
    display: flex
    flex-direction: column
    align-items: center
    cursor: pointer
    padding: .4rem
    min-width: 3rem
    position: relative
    transition: all .3s ease

    // Hover-эффекты только для устройств с мышью
    @media (hover: hover) and (pointer: fine)
      &:hover
        border-radius: .3rem
        box-shadow: 0 .2rem .8rem rgba(0,0,0,0.2)

    .date-container
      height: 1rem
      position: relative
      width: 100%
      text-align: center

    &-date
      font-size: 0.8rem
      font-weight: 400
      line-height: 0.9rem
      display: block
      width: 100%

    &-week
      font-size: 1.6rem
      font-weight: 400
      line-height: 1.9rem

    &-prev-active
      background-color: $color-light-grey
      border-radius: 0.3rem
      transition: all .3s ease

    &-active
      background-color: $color-light-green
      color: white
      border-radius: 0.3rem
      transition: all .3s ease

      // Отключаем hover для активного элемента
      @media (hover: hover) and (pointer: fine)
        &:hover
          box-shadow: none

// Анимации изменения даты
.date-flip-enter-active,
.date-flip-leave-active
  transition: all .2s ease
  position: absolute
  left: 0
  right: 0

.date-flip-enter-from
  opacity: 0
  transform: translateY(-10px)

.date-flip-leave-to
  opacity: 0
  transform: translateY(10px)
</style>