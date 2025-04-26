<template>
  <section class="name">
    <h1 class="name__title">
      <span v-if="currentGroup">{{ currentGroup }}</span>
      <span v-else-if="currentTeacher">{{ currentTeacher }}</span>
      <span v-else-if="currentRoom">{{ currentRoom }}</span>
    </h1>
    <strong class="name__slash">|</strong>
    <h2 class="name__week">{{ weekName }}</h2>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'GroupInfo',
  computed: {
    ...mapGetters([
      'currentGroup', 
      'currentTeacher', 
      'currentRoom', 
      'currentWeekNumber',
      'currentWeekType'
    ]),
    weekName() {
      if (this.currentWeekNumber !== null) {
        return `Неделя ${this.currentWeekNumber}`;
      }
      // Резервный вариант, если по какой-то причине номер недели не установлен
      return this.currentWeekType === 'week1' ? 'Неделя 1' : 'Неделя 2';
    }
  }
}
</script>

<style lang="sass" scoped>
@import "@/assets/styles/variables.sass"
@import "@/assets/styles/mixins.sass"

.name
  display: flex
  gap: 0.5rem
  margin-bottom: 1.5rem
  align-items: center
  &__title,
  &__slash
    font-size: 2.6rem
    font-weight: 400
    letter-spacing: -0.05rem
  &__week
    font-size: 1.6rem
    font-weight: 400
    letter-spacing: -0.05rem

  @include respond(small-phone)
    &__title,
    &__slash
      font-size: 2rem
    &__week
      font-size: 1.4rem
  @include respond(phone)
    &__title,
    &__slash
      font-size: 2.6rem
    &__week
      font-size: 1.8rem
</style>