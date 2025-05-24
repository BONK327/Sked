<template>
  <div class="double-view">
    <div v-if="isLoading" class="loading">Загрузка...</div>
    <div v-else class="double-content">
      <div class="double-container" :class="{ 'tg-theme': isTelegram }" :data-theme="isDarkTheme ? 'dark' : 'light'">
        <div class="double-search-block">
          <div class="search-block">
            <div class="search-result">
              <h1 class="result-text">{{ formattedFirstTitle || 'Первое расписание' }}</h1>
            </div>
            <Search ref="search1" placeholder="Группа, преподаватель, аудитория" @search="handleFirstSearch" />
          </div>

          <div class="search-block">
            <div class="search-result">
              <h1 class="result-text">{{ formattedSecondTitle || 'Второе расписание' }}</h1>
            </div>
            <Search ref="search2" placeholder="Группа, преподаватель, аудитория" @search="handleSecondSearch" />
          </div>
        </div>

        <div class="week-switcher">
          <button class="week-button" :class="{ 'active': currentDoubleWeek === 1 }" @click="setCurrentWeek(1)">
            Неделя 1
          </button>
          <button class="week-button" :class="{ 'active': currentDoubleWeek === 2 }" @click="setCurrentWeek(2)">
            Неделя 2
          </button>
        </div>

        <DoubleWeekSchedule 
          :first-schedule="doubleSchedules.first" 
          :second-schedule="doubleSchedules.second"
          :first-title="firstTitle" 
          :second-title="secondTitle" 
          :current-week="currentDoubleWeek" 
        />
      </div>
    </div>
  </div>
</template>
<script>
import Search from '@/components/Sked/Search.vue'
import DoubleWeekSchedule from '@/components/double/DoubleWeekSchedule.vue'
import { mapGetters, mapActions, mapMutations } from 'vuex'

export default {
  name: 'Double',
  components: { Search, DoubleWeekSchedule },
  data() {
    return {
      isTelegram: window.Telegram && window.Telegram.WebApp,
      isDarkTheme: false,
      firstTitle: '',
      secondTitle: '',
      firstSearchParams: null,
      secondSearchParams: null,
      isLoading: false
    }
  },
  computed: {
    ...mapGetters(['currentDoubleWeek']),
    doubleSchedules() {
      return this.$store.state.doubleSchedules || {
        first: { week1: {}, week2: {} },
        second: { week1: {}, week2: {} }
      };
    },
    formattedFirstTitle() {
      return this.formatTitle(this.firstTitle, this.firstSearchParams?.type);
    },
    formattedSecondTitle() {
      return this.formatTitle(this.secondTitle, this.secondSearchParams?.type);
    },
    currentDoubleWeek() {
      return this.$store.state.currentDoubleWeek;
    }
  },
  methods: {
    ...mapActions(['searchSchedule']),
    ...mapMutations(['SET_CURRENT_DOUBLE_WEEK']),

    async handleFirstSearch({ type, query, displayQuery }) {
      try {
        this.isLoading = true;
        this.firstSearchParams = { type, query };
        this.firstTitle = this.formatTitle(displayQuery || query, type);

        await this.$store.dispatch('searchSchedule', {
          type,
          query,
          isDouble: true,
          scheduleKey: 'first'
        });

        // Сохраняем тип поиска в хранилище
        this.$store.commit('SET_DOUBLE_SCHEDULE_TYPE', {
          key: 'first',
          type
        });

      } catch (error) {
        console.error('Ошибка загрузки первого расписания:', error);
      } finally {
        this.isLoading = false;
      }
    },

    async handleSecondSearch({ type, query, displayQuery }) {
      try {
        this.isLoading = true;
        this.secondSearchParams = { type, query };
        this.secondTitle = this.formatTitle(displayQuery || query, type);

        await this.$store.dispatch('searchSchedule', {
          type,
          query,
          isDouble: true,
          scheduleKey: 'second'
        });

        // Сохраняем тип поиска в хранилище
        this.$store.commit('SET_DOUBLE_SCHEDULE_TYPE', {
          key: 'second',
          type
        });

      } catch (error) {
        console.error('Ошибка загрузки второго расписания:', error);
      } finally {
        this.isLoading = false;
      }
    },

    formatTitle(title, type) {
      if (!title) return '';

      // Для групп (ПИ2303)
      if (type === 'group') {
        const firstDigitIndex = title.search(/\d/);
        if (firstDigitIndex === -1) return title.toUpperCase();
        const letters = title.slice(0, firstDigitIndex).toUpperCase();
        const numbers = title.slice(firstDigitIndex);
        return letters + numbers;
      }
      // Для аудиторий (219гл)
      else if (type === 'room') {
        return title.replace(/(\d+)([А-ЯЁ]+)/, (_, num, letters) =>
          num + letters.toLowerCase()
        );
      }
      // Для преподавателей оставляем как есть
      return title;
    },

    setCurrentWeek(weekNumber) {
      this.$store.commit('SET_CURRENT_DOUBLE_WEEK', weekNumber);
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
    },

  },
  created() {
    this.initTelegramTheme();
  },
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
  height: 100%
  min-height: 100vh

.double-container
  flex: 1
  display: flex
  flex-direction: column
  overflow-y: auto
  -webkit-overflow-scrolling: touch

.double-content
  flex: 1
  overflow-y: auto
  -webkit-overflow-scrolling: touch
  scroll-behavior: smooth
  display: flex
  flex-direction: column
  overflow: hidden

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
  min-width: 27rem

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

.loading
  position: absolute 
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)
  font-size: 2rem

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