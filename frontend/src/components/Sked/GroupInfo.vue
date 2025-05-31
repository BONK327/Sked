<template>
  <section class="name">
    <h1 class="name__title">
      <span v-if="currentGroup">{{ formattedGroupName }}</span>
      <span v-else-if="currentTeacher">{{ formattedTeacherName }}</span>
      <span v-else-if="currentRoom">{{ currentRoom }}</span>
      <span v-else>Расписание</span>
    </h1>
    <strong class="name__slash">|</strong>
    <h2 class="name__week">
      {{ weekName }}
      <span v-if="debugInfo">(Неделя API: {{ apiWeekNumber }}, Смещение: {{ weekOffset }})</span>
    </h2>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'GroupInfo',
  data() {
    return {
      debugInfo: false
    }
  },
  computed: {
    ...mapGetters([
      'currentGroup',
      'currentTeacher',
      'currentRoom',
      'currentWeekNumber',
      'baseWeekNumber',
      'currentWeekOffset'
    ]),
    weekName() {
      return `Неделя ${this.currentWeekNumber}`;
    },
    apiWeekNumber() {
      return this.baseWeekNumber || 'N/A';
    },
    weekOffset() {
      return this.currentWeekOffset || 0;
    },
    hasSchedule() {
      return this.currentGroup || this.currentTeacher || this.currentRoom;
    },
    formattedTeacherName() {
      if (!this.currentTeacher) return '';

      // Если имя уже в формате "Иванов И.И.", просто возвращаем его
      if (this.currentTeacher.match(/[а-яё]+\s[А-Я]\.\s?[А-Я]?\.?/i)) {
        return this.currentTeacher;
      }

      // Для формата API "Иванов_И_И"
      const parts = this.currentTeacher.split('_');
      let formatted = parts[0];
      if (parts[1]) {
        formatted += ` ${parts[1][0].toUpperCase()}. `;
      }
      if (parts[2]) {
        formatted += `${parts[2][0].toUpperCase()}. `;
      }
      return formatted;
    },
    formattedGroupName() {
      if (!this.currentGroup) return '';
      const firstDigitIndex = this.currentGroup.search(/\d/);
      if (firstDigitIndex === -1) return this.currentGroup.toUpperCase();

      const letters = this.currentGroup.slice(0, firstDigitIndex).toUpperCase();
      const numbers = this.currentGroup.slice(firstDigitIndex);
      return letters + numbers;
    }
  },
  methods: {
    capitalizeFirstLetter(str) {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
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