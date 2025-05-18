<template>
  <div class="schedule" :class="{ 'tg-theme': isTelegram }" :data-theme="isDarkTheme ? 'dark' : 'light'">
    <!-- Preloader показывается до загрузки данных -->
    <Preloader v-if="isLoading" :isTelegram="isTelegram" :isDark="isDarkTheme" />

    <div v-else class="container">
      <div class="grid">
        <keep-alive>
          <component :is="currentComponent"></component>
        </keep-alive>
      </div>
    </div>

    <AddNoteModal />
    <NoteDialog />
    <Footer />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import sked from "@/components/Sked/sked.vue"
import Notes from "@/views/Notes.vue"
import Footer from "@/components/Footer.vue"
import AddNoteModal from "@/components/AddNoteModal.vue"
import NoteDialog from "@/components/NoteDialog.vue"
import Preloader from "@/components/Preloader.vue" // Импортируем Preloader
import Double from './components/double/Double.vue'

export default {
  name: 'App',
  components: {
    Footer,
    sked,
    Notes,
    AddNoteModal,
    NoteDialog,
    Preloader, 
    Double
  },
  data() {
    return {
      isLoading: true, // Флаг загрузки
      isTelegram: false,
      isDarkTheme: false,
      tgThemeParams: {}
    }
  },
  computed: {
    ...mapGetters(['activeTab']),
     currentComponent() {
      const components = {
        'schedule': 'sked',
        'notes': 'Notes',
        'double': 'Double'
      }
      return components[this.activeTab] || 'sked'
    }
  },
  async created() {
    if (window.Telegram && window.Telegram.WebApp) {
      this.isTelegram = true;
      this.initTelegramTheme();
      this.setupTelegramBackButton();
      
      // Отключаем все подтверждения закрытия
      window.Telegram.WebApp.disableClosingConfirmation();
      
      // Отключаем кнопку подтверждения изменений
      window.Telegram.WebApp.MainButton.hide();
      window.Telegram.WebApp.MainButton.offClick();
      
      // Блокируем появление кнопки "Continue" при прокрутке
      window.Telegram.WebApp.enableClosingConfirmation();
      
      // Развернем приложение на весь экран
      window.Telegram.WebApp.expand();
    }
    // Проверяем, открыто ли приложение в Telegram
    if (window.Telegram && window.Telegram.WebApp) {
      this.isTelegram = true;
      this.initTelegramTheme();
      this.setupTelegramBackButton();
      window.Telegram.WebApp.expand();
    }

    // Фиксированная задержка 2 секунды
    const fixedDelay = new Promise(resolve => setTimeout(resolve, 2000));

    // Ваши текущие асинхронные операции
    const dataLoading = (async () => {
      const today = new Date();
      const dayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
      const monthNames = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

      await Promise.all([
        this.$store.dispatch('initWeekNumber'),
        this.$store.dispatch('fetchAllDataLists').catch(() => {
          console.log('Не удалось загрузить списки, но приложение продолжит работу');
        }),
        this.$store.dispatch('fetchFullWeekSchedule', {
          fullDayName: dayNames[today.getDay()],
          date: today.getDate(),
          month: monthNames[today.getMonth()],
          originalDate: today
        })
      ]);
    })();

    // Ждем либо завершения загрузки данных, либо истечения 2 секунд
    await Promise.all([fixedDelay, dataLoading]).catch(error => {
      console.error('Ошибка загрузки:', error);
    });

    this.isLoading = false;
  },
  methods: {
    disableTelegramBehaviors() {
      if (!this.isTelegram) return;
      
      const tg = window.Telegram.WebApp;
      tg.MainButton.hide();
      tg.MainButton.offClick();
      tg.disableClosingConfirmation();
      tg.BackButton.hide();
      tg.setBackgroundColor(this.isDarkTheme ? '#18222d' : '#ffffff');
      
      // Блокируем стандартное поведение
      document.body.style.overscrollBehavior = 'none';
    },
    initTelegramTheme() {
      const WebApp = window.Telegram.WebApp;
      this.tgThemeParams = WebApp.themeParams || {};
      this.isDarkTheme = WebApp.colorScheme === 'dark';
      this.applyTelegramTheme();
      WebApp.onEvent('themeChanged', this.applyTelegramTheme);
    },
    applyTelegramTheme() {
      const WebApp = window.Telegram.WebApp;
      this.isDarkTheme = WebApp.colorScheme === 'dark';
      document.documentElement.style.setProperty('--tg-bg-color', this.tgThemeParams.bg_color || (this.isDarkTheme ? '#18222d' : '#ffffff'));
      document.documentElement.style.setProperty('--tg-text-color', this.tgThemeParams.text_color || (this.isDarkTheme ? '#ffffff' : '#000000'));
      document.documentElement.style.setProperty('--tg-button-color', this.tgThemeParams.button_color || '#2481cc');
      document.documentElement.style.setProperty('--tg-button-text-color', this.tgThemeParams.button_text_color || '#ffffff');
      document.documentElement.style.setProperty('--tg-hint-color', this.tgThemeParams.hint_color || (this.isDarkTheme ? '#aaaaaa' : '#707579'));
      document.documentElement.style.setProperty('--tg-link-color', this.tgThemeParams.link_color || '#168acd');
      document.documentElement.style.setProperty('--tg-secondary-bg-color', this.tgThemeParams.secondary_bg_color || (this.isDarkTheme ? '#212529' : '#f4f4f5'));
    },
    setupTelegramBackButton() {
      const WebApp = window.Telegram.WebApp;
      WebApp.BackButton.hide(); // Сначала скрываем
      
      // Показываем только когда нужно
      // WebApp.BackButton.show();
      WebApp.BackButton.onClick(() => {
        WebApp.close();
      });
      
      // Явно отключаем подтверждение
      WebApp.disableClosingConfirmation();
    }
  }, 
  mounted() {
    if (this.isTelegram) {
      const tg = window.Telegram.WebApp;
      
      // Гарантированно скрываем MainButton
      tg.MainButton.hide();
      tg.MainButton.offClick();
      
      // Отключаем подтверждение закрытия
      tg.disableClosingConfirmation();
      
      // Настраиваем BackButton (если нужно)
      tg.BackButton.hide();
      
      // Устанавливаем цвет фона, чтобы избежать "проседаний"
      tg.setBackgroundColor(this.isDarkTheme ? '#18222d' : '#ffffff');
    }
  }
}
</script>

<style lang="sass">
@import "@/assets/styles/variables.sass"
@import "@/assets/styles/mixins.sass"

*
  margin: 0
  padding: 0
  user-zoom: fixed
  box-sizing: border-box

html, body 
  overscroll-behavior-y: none
  overscroll-behavior-x: none
  .tg-theme 
    overscroll-behavior: none
html
  background-color: var(--tg-bg-color)
  height: 100%
  @include respond(big-screen)
    font-size: 82.5%
  @include respond(computer)
    font-size: 79%
  @include respond(tab-lend)
    font-size: 77.5%
  @include respond(tab-port)
    font-size: 75.5%
  @include respond(phone)
    font-size: 72.5%
  @include respond(small-phone)
    font-size: 62.5%

body
  display: flex
  flex-direction: column
  height: 100%
  font-family: 'Roboto', sans-serif
  color: $color-text
  margin: 0 auto
  max-width: $content-max-width
  background-color: $color-white
  min-height: 100vh
  position: relative
  user-select: none
  -webkit-tap-highlight-color: transparent
  @media (orientation: landscape) and (max-width: 1025px)
    margin: 0
    max-width: 100vw  
  
  // Применяем Telegram тему, если приложение открыто в Telegram
  &.tg-theme
    background-color: var(--tg-secondary-bg-color)
    color: var(--tg-text-color)

.schedule
  flex: 1
  display: flex
  flex-direction: column

.container
  flex: 1
  overflow-y: hidden
  overflow-x: hidden
  width: 100%
  min-height: calc(100vh - #{$footer-height})
  padding: 0 1.5rem
  position: relative
  z-index: 0
  // transition: all 0.3s ease
  background-color: $color-white
  color: $color-text
  
  .tg-theme &
    background-color: var(--tg-secondary-bg-color)
    color: var(--tg-text-color)

// Анимация переключения вкладок
.fade-enter-active,
.fade-leave-active
  transition: opacity 0.3s, transform 0.3s

.fade-enter,
.fade-leave-to
  opacity: 0
  transform: translateY(1rem)

// Стили для Telegram-кнопок
.button-tg
  +telegram-button
  font-size: 1rem

.container
  @media (orientation: landscape) and (max-width: 1025px)
    min-height: 100vh
    width: calc(100vw - #{$footer-height}) // учитываем ширину бокового футера
    padding-right: 1.5rem
    padding-left: 1.5rem
</style>