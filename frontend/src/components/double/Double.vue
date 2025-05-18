<template>
  <div class="double-view" :class="{ 'tg-theme': isTelegram }" :data-theme="isDarkTheme ? 'dark' : 'light'">
    <div class="double-content">
      <!-- Первый блок (десктоп и мобильный) -->
      <div class="double-search-block">
        <div class="search-block">
          <div class="search-result">
            <h1 class="result-text">{{ searchResult1 || formattedGroupName }}</h1>
          </div>
          <Search 
            ref="search1"
            placeholder="Группа, преподаватель, аудитория"
            @search="handleSearch(0, $event)"
          />
        </div>

        <!-- Второй блок (десктоп и мобильный) -->
        <div class="search-block">
          <div class="search-result">
            <h1 class="result-text">{{ searchResult2 || formattedGroupName }}</h1>
          </div>
          <Search 
            ref="search2"
            placeholder="Группа, преподаватель, аудитория"
            @search="handleSearch(1, $event)"
          />
        </div>
      </div>

      <!-- Переключатель недель -->
      <div class="week-switcher">
        <button 
          class="week-button"
          :class="{ 'active': currentWeek === 1 }"
          @click="setCurrentWeek(1)"
        >
          Неделя 1
        </button>
        <button 
          class="week-button"
          :class="{ 'active': currentWeek === 2 }"
          @click="setCurrentWeek(2)"
        >
          Неделя 2
        </button>
      </div>
    
      <DoubleWeekSchedule 
        :currentWeekSchedule="week1Schedule"
        :nextWeekSchedule="week2Schedule"
        :firstWeekTitle="searchResult1"
        :secondWeekTitle="searchResult2"
      />
    </div>
  </div>
</template>

<script>
import Search from '@/components/Sked/Search.vue'
import DoubleWeekSchedule from '@/components/double/DoubleWeekSchedule.vue'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Double',
  components: { Search, DoubleWeekSchedule },
  data() {
    return {
      isTelegram: window.Telegram && window.Telegram.WebApp,
      isDarkTheme: false,
      searchResult1: '',
      searchResult2: '',
      currentWeek: 1 // Текущая выбранная неделя
    }
  },
  computed: {
    ...mapGetters([
      'weeksData',
      'currentGroup'
    ]),
    week1Schedule() {
      return this.weeksData?.week1 || []
    },
    week2Schedule() {
      return this.weeksData?.week2 || []
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
    ...mapActions([
      'fetchFullWeekSchedule',
      'searchSchedule',
      'setCurrentWeekNumber'
    ]),
    
    handleSearch(weekIndex, { type, query }) {
      this.searchSchedule({
        type,
        query,
        week: weekIndex === 0 ? 'week1' : 'week2'
      });
      
      if (weekIndex === 0) {
        this.searchResult1 = query || this.formattedGroupName;
      } else {
        this.searchResult2 = query || this.formattedGroupName;
      }
    },
    
    setCurrentWeek(weekNumber) {
      this.currentWeek = weekNumber;
      this.setCurrentWeekNumber(weekNumber);
    },
    
    initTelegramTheme() {
      if (this.isTelegram) {
        const WebApp = window.Telegram.WebApp;
        this.isDarkTheme = WebApp.colorScheme === 'dark';
        this.applyTelegramTheme();
        WebApp.onEvent('themeChanged', this.applyTelegramTheme);
      }
    },
    applyTelegramTheme() {
      const WebApp = window.Telegram.WebApp;
      this.isDarkTheme = WebApp.colorScheme === 'dark';
    }
  },
  async created() {
    this.initTelegramTheme();
    await this.fetchFullWeekSchedule();
    this.searchResult1 = this.formattedGroupName;
    this.searchResult2 = this.formattedGroupName;
  }
}
</script>

<style lang="sass" scoped>
@import "@/assets/styles/variables.sass"
@import "@/assets/styles/mixins.sass"

.double-view
  height: 100vh
  color: var(--app-text-color)
  background-color: var(--app-secondary-bg-color)
  display: flex
  flex-direction: column

.double-content
  flex: 1
  overflow-y: auto
  -webkit-overflow-scrolling: touch
  scroll-behavior: smooth
  display: flex
  flex-direction: column

.double-search-block
  padding: 1rem
  background-color: var(--app-secondary-bg-color)
  display: flex
  gap: 1rem
  flex-wrap: wrap

.search-block
  display: flex
  flex-direction: column
  flex: 1
  min-width: 30rem

.search-result
  text-align: center
  padding: 0.5rem
  display: flex
  align-items: center
  justify-content: center
  border-radius: 0.5rem
  
  .result-text
    font-size: 1.3rem
    font-weight: 500
    margin: 0
    padding: 0
    word-break: break-word
    font-weight: 600
    color: var(--tg-text-color)

.week-switcher
  display: flex
  justify-content: center
  gap: 1rem
  padding: 0.5rem 1rem
  background-color: var(--app-secondary-bg-color)
  border-top: .1rem solid var(--color-light-grey)
  border-bottom: .1rem solid var(--color-light-grey)
  margin-bottom: 1rem
    
  .tg-theme &
    border-color: var(--tg-hint-color)

.week-button
  padding: 0.5rem 1.5rem
  border-radius: 0.5rem
  background-color: var(--color-light-grey)
  border: none
  cursor: pointer
  font-weight: 500
  transition: all 0.2s ease
  color: var(--app-text-color)

  .tg-theme &
    background-color: var(--tg-secondary-bg-color)
    color: var(--tg-text-color)

  &.active
    background-color: var(--color-light-green)
    color: white

    .tg-theme &
      background-color: $color-light-green
      color: var(--tg-button-text-color)

  // Hover только для устройств с курсором мыши
  @media (hover: hover) and (pointer: fine)
    &:not(.active):hover
      box-shadow: 0 0.2rem 0.5rem rgba(0, 0, 0, 0.1)
      
      .tg-theme &
        box-shadow: 0 0.2rem 0.5rem rgba(0, 0, 0, 0.3)

// Медиазапросы
@media (orientation: landscape) and (max-width: 1025px)
  .double-search-block
    padding: 0.5rem 1rem
    flex-wrap: nowrap
  
  .search-block
    min-width: auto

  .week-switcher
    padding: 0.5rem
</style>