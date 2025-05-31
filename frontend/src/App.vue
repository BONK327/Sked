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
import { mapGetters, mapActions } from 'vuex'
import sked from "@/components/Sked/sked.vue"
import Notes from "@/views/Notes.vue"
import Footer from "@/components/Footer.vue"
import AddNoteModal from "@/components/AddNoteModal.vue"
import NoteDialog from "@/components/NoteDialog.vue"
import Preloader from "@/components/Preloader.vue"
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
      isLoading: true,
      isTelegram: false,
      isDarkTheme: false,
      tgThemeParams: {},
      userData: null
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
    // Проверяем, открыто ли приложение в Telegram
    if (window.Telegram && window.Telegram.WebApp) {
      this.isTelegram = true;
      this.initTelegramTheme();
      this.setupTelegramBackButton();

      // Получаем данные пользователя из Telegram
      const initData = window.Telegram.WebApp.initData || {};
      const initDataUnsafe = window.Telegram.WebApp.initDataUnsafe || {};
      this.userData = {
        id: initDataUnsafe.user?.id || 123231,
        firstname: initDataUnsafe.user?.first_name || 'Test',
        username: initDataUnsafe.user?.username || 'testuser'
      };

      //console.log('Telegram user data:', this.userData);

      // Отключаем все подтверждения закрытия
      window.Telegram.WebApp.disableClosingConfirmation();

      // Развернем приложение на весь экран
      window.Telegram.WebApp.expand();
    } else {
      // Для локальной разработки без Telegram
      this.userData = {
        id: 123231,
        firstname: 'Test',
        username: 'testuser'
      };
    }

    try {
      // Загружаем данные пользователя
      await this.$store.dispatch('fetchUserData', this.userData);

      // Загружаем расписание пользователя
      const userSchedule = this.$store.state.userSchedule;
      if (userSchedule) {
        await this.loadUserSchedule(userSchedule);
      }

      // Загружаем остальные данные
      await Promise.all([
        this.$store.dispatch('initWeekNumber'),
        this.$store.dispatch('fetchAllDataLists')
      ]);

    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      this.isLoading = false;
    }
  },
  methods: {
    async loadUserSchedule(schedule) {
      try {
        //console.log('Received user schedule from API:', schedule);

        if (!schedule) {
          //console.log('No user schedule found');
          this.$store.commit('SET_CURRENT_GROUP', '');
          this.$store.commit('SET_CURRENT_TEACHER', '');
          this.$store.commit('SET_CURRENT_ROOM', '');
          return;
        }

        let type, query, displayQuery;

        switch (schedule.type) {
          case 'group':
            type = 'group';
            query = schedule.name;
            displayQuery = schedule.name;
            //console.log('Setting group:', { query, displayQuery });
            this.$store.commit('SET_CURRENT_GROUP', query);
            this.$store.commit('SET_SEARCH_TYPE', 'group');
            break;

          case 'teacher':
            type = 'teacher';
            const nameParts = schedule.name.split(' ');
            const lastName = nameParts[0];
            const firstNameInitial = nameParts[1]?.[0]?.toUpperCase() || '';
            const middleNameInitial = nameParts[2]?.[0]?.toUpperCase() || '';

            query = `${lastName}_${firstNameInitial}_${middleNameInitial}`;
            displayQuery = `${lastName} ${firstNameInitial}.${middleNameInitial ? ' ' + middleNameInitial + '.' : ''}`.trim();

            // console.log('Setting teacher:', {
            //   original: schedule.name,
            //   query,
            //   displayQuery
            // });

            this.$store.commit('SET_CURRENT_TEACHER', displayQuery);
            this.$store.commit('SET_TEACHER_API_QUERY', query);
            this.$store.commit('SET_SEARCH_TYPE', 'teacher');
            break;

          case 'room':
            type = 'room';
            query = schedule.name;
            displayQuery = schedule.name;
            //console.log('Setting room:', { query, displayQuery });
            this.$store.commit('SET_CURRENT_ROOM', query);
            this.$store.commit('SET_SEARCH_TYPE', 'room');
            break;
        }

        await this.$store.dispatch('searchSchedule', {
          type,
          query,
          displayQuery
        });

      } catch (error) {
        console.error('Error loading user schedule:', error);
      }
    },
    // async loadUserSchedule(schedule) {
    //   try {
    //     if (!schedule) {
    //       // Если нет расписания пользователя, просто устанавливаем пустое состояние
    //       this.$store.commit('SET_CURRENT_GROUP', '');
    //       this.$store.commit('SET_CURRENT_TEACHER', '');
    //       this.$store.commit('SET_CURRENT_ROOM', '');
    //       return;
    //     }

    //     // Определяем тип расписания и запрос
    //     let type, query, displayQuery;
    //     switch (schedule.type) {
    //       case 'group':
    //         type = 'group';
    //         query = schedule.name;
    //         displayQuery = schedule.name;
    //         this.$store.commit('SET_CURRENT_GROUP', query);
    //         break;
    //       case 'teacher':
    //         type = 'teacher';
    //         // Преобразуем полное имя в формат API (Иванов_И_И)
    //         const nameParts = schedule.name.split(' ');
    //         query = `${nameParts[0]}_${nameParts[1]?.[0] || ''}_${nameParts[2]?.[0] || ''}`;
    //         displayQuery = schedule.name;
    //         this.$store.commit('SET_CURRENT_TEACHER', { query, displayQuery });
    //         break;
    //       case 'room':
    //         type = 'room';
    //         query = schedule.name;
    //         displayQuery = schedule.name;
    //         this.$store.commit('SET_CURRENT_ROOM', query);
    //         break;
    //     }

    //     // Всегда отправляем запрос, даже если расписание пустое
    //     await this.$store.dispatch('searchSchedule', {
    //       type,
    //       query,
    //       displayQuery
    //     });

    //   } catch (error) {
    //     console.error('Ошибка загрузки расписания пользователя:', error);
    //     // Даже если ошибка, сохраняем название группы/преподавателя
    //     if (schedule) {
    //       if (schedule.type === 'group') {
    //         this.$store.commit('SET_CURRENT_GROUP', schedule.name);
    //       } else if (schedule.type === 'teacher') {
    //         this.$store.commit('SET_CURRENT_TEACHER', {
    //           query: schedule.name.replace(/ /g, '_'),
    //           displayQuery: schedule.name
    //         });
    //       } else if (schedule.type === 'room') {
    //         this.$store.commit('SET_CURRENT_ROOM', schedule.name);
    //       }
    //     }
    //   }
    // },

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
      WebApp.BackButton.hide();
      WebApp.BackButton.onClick(() => {
        WebApp.close();
      });
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
