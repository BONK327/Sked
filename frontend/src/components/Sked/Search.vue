<template>
  <section class="search" :class="{ 'tg-theme': isTelegram, 'tg-dark': isDarkTheme }">
    <input class="search__input" 
           type="text" 
           v-model="searchInput" 
           @input="handleInput"
           @blur="hideSuggestions"
           placeholder="Группа, преподаватель, аудитория"
           @keyup.enter="handleSearch"
           @keydown.down="moveSelection(1)"
           @keydown.up="moveSelection(-1)"
           ref="searchInput">
    <transition name="fade">
      <div v-if="errorMessage" class="search-error">
        {{ errorMessage }}
      </div>
    </transition>
    <div v-if="showSuggestions && suggestions.length > 0" class="suggestions">
      <div v-for="(item, index) in suggestions" :key="item" class="suggestion-item"
        :class="{ 'suggestion-active': index === activeSuggestionIndex }" @keyup.enter="handleEnter" @mousedown.prevent="selectSuggestion(item)">
        {{ item }}
      </div>
    </div>
    <svg class="search__loupe btn" width="13" height="13" viewBox="0 0 13 13" fill="none"
      xmlns="http://www.w3.org/2000/svg" @click="handleSearch">
      <path fill-rule="evenodd" clip-rule="evenodd"
        d="M1.46466 1.40156C1.00031 1.86591 0.631959 2.41718 0.380652 3.02389C0.129346 3.6306 6.91942e-09 4.28086 0 4.93756C-6.91942e-09 5.59426 0.129346 6.24452 0.380652 6.85123C0.631959 7.45794 1.00031 8.0092 1.46466 8.47356C1.92901 8.93791 2.48028 9.30626 3.08699 9.55757C3.6937 9.80887 4.34396 9.93822 5.00066 9.93822C5.65736 9.93822 6.30762 9.80887 6.91433 9.55757C7.52104 9.30626 8.0723 8.93791 8.53666 8.47356C9.44745 7.53055 9.95142 6.26754 9.94003 4.95655C9.92864 3.64557 9.40279 2.39151 8.47575 1.46447C7.54871 0.537426 6.29465 0.0115811 4.98366 0.000189013C3.67268 -0.0112031 2.40967 0.492769 1.46666 1.40356M7.83066 7.76756C7.46074 8.14579 7.01946 8.44687 6.53238 8.65339C6.04529 8.8599 5.52208 8.96773 4.99303 8.97065C4.46399 8.97356 3.93962 8.8715 3.45029 8.67036C2.96096 8.46922 2.51639 8.17302 2.14233 7.79889C1.76826 7.42476 1.47213 6.98014 1.27108 6.49077C1.07003 6.00141 0.968061 5.47702 0.971068 4.94797C0.974075 4.41893 1.082 3.89573 1.2886 3.40869C1.4952 2.92164 1.79637 2.48041 2.17466 2.11056C2.92767 1.37434 3.94064 0.964788 4.99374 0.970774C6.04683 0.976759 7.05508 1.3978 7.79968 2.14253C8.54428 2.88726 8.96514 3.89558 8.97094 4.94868C8.97674 6.00178 8.56701 7.01468 7.83066 7.76756Z"
        :fill="isTelegram ? 'var(--tg-button-text-color)' : 'white'" />
      <path
        d="M7.82859 9.20055C7.64108 9.01291 7.53579 8.75847 7.53589 8.4932C7.53598 8.22793 7.64145 7.97356 7.82909 7.78605C8.01673 7.59854 8.27117 7.49325 8.53644 7.49335C8.80172 7.49344 9.05608 7.59891 9.24359 7.78655L12.0716 10.6155C12.1671 10.7078 12.2433 10.8181 12.2957 10.9401C12.3481 11.0621 12.3757 11.1934 12.3768 11.3261C12.378 11.4589 12.3527 11.5906 12.3024 11.7135C12.2521 11.8364 12.1779 11.9481 12.084 12.0419C11.9901 12.1358 11.8784 12.2101 11.7555 12.2604C11.6326 12.3107 11.501 12.336 11.3682 12.3348C11.2354 12.3336 11.1042 12.3061 10.9822 12.2537C10.8602 12.2012 10.7498 12.1251 10.6576 12.0295L7.82859 9.20055Z"
        :fill="isTelegram ? 'var(--tg-button-text-color)' : 'white'" />
    </svg>
  </section>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'Search',
  data() {
    return {
      searchInput: '',
      errorMessage: '',
      // Telegram
      isTelegram: false,
      isDarkTheme: false,
      tgThemeParams: {},
      showSuggestions: false,
      activeSuggestionIndex: -1,
    }
  },
  created() {
    // Проверяем, открыто ли приложение в Telegram
    if (window.Telegram && window.Telegram.WebApp) {
      this.isTelegram = true;
      this.initTelegramTheme();
      this.setupTelegramBackButton();

      // Развернуть приложение на весь экран
      window.Telegram.WebApp.expand();
    }

    this.$store.dispatch('fetchAllDataLists').catch(error => {
      console.error('Ошибка загрузки списков:', error);
    });
  },
  methods: {
    ...mapActions(['searchSchedule']),
    initTelegramTheme() {
      const WebApp = window.Telegram.WebApp;

      // Получаем параметры темы
      this.tgThemeParams = WebApp.themeParams || {};
      this.isDarkTheme = WebApp.colorScheme === 'dark';

      // Применяем тему
      this.applyTelegramTheme();

      // Подписываемся на изменение темы
      WebApp.onEvent('themeChanged', this.applyTelegramTheme);
    },
    applyTelegramTheme() {
      const WebApp = window.Telegram.WebApp;
      this.isDarkTheme = WebApp.colorScheme === 'dark';

      // Обновляем CSS-переменные
      document.documentElement.style.setProperty('--tg-bg-color', this.tgThemeParams.bg_color || '#ffffff');
      document.documentElement.style.setProperty('--tg-text-color', this.tgThemeParams.text_color || '#000000');
      document.documentElement.style.setProperty('--tg-button-color', this.tgThemeParams.button_color || '#2481cc');
      document.documentElement.style.setProperty('--tg-button-text-color', this.tgThemeParams.button_text_color || '#ffffff');
      document.documentElement.style.setProperty('--tg-hint-color', this.tgThemeParams.hint_color || '#707579');
      document.documentElement.style.setProperty('--tg-link-color', this.tgThemeParams.link_color || '#168acd');
      document.documentElement.style.setProperty('--tg-secondary-bg-color', this.tgThemeParams.secondary_bg_color || '#f4f4f5');
      document.documentElement.style.setProperty('--tg-disabled', this.tgThemeParams.disabled || '#5c5c5c');
    },
    setupTelegramBackButton() {
      const WebApp = window.Telegram.WebApp;

      // Показываем кнопку "Назад", если это необходимо
      WebApp.BackButton.show();
      WebApp.BackButton.onClick(() => {
        // Здесь можно добавить логику навигации назад
        WebApp.close(); // или другая логика
      });
    },
    selectTeacher(teacher) {
      try {
        if (!teacher || typeof teacher !== 'string') return;

        this.searchInput = teacher;
        this.showSuggestions = false;

        this.$nextTick(() => {
          if (this.$refs.searchInput) {
            this.$refs.searchInput.focus();
          }
          this.handleSearch();
        });
      } catch (error) {
        console.error('Ошибка при выборе преподавателя:', error);
      }
    },

    getteacherSuggestions() {
      return this.getTeacherSuggestions(this.searchInput);
    },

    onInput() {
      if (this.searchInput.trim().length >= 3) {
        this.showSuggestions = true;
      } else {
        this.showSuggestions = false;
      }
    },

    hideSuggestions() {
      // Небольшая задержка, чтобы можно было кликнуть на подсказку
      setTimeout(() => {
        this.showSuggestions = false;
      }, 200);
    },

    handleEnter() {
  if (this.activeSuggestionIndex >= 0 && this.suggestions.length) {
    this.selectSuggestion(this.suggestions[this.activeSuggestionIndex]);
  } else {
    this.handleSearch();
  }
},

    // Форматируем группу (делаем буквы перед цифрами заглавными)
    formatGroupName(group) {
      if (!group) return group;
      // Находим индекс первой цифры
      const firstDigitIndex = group.search(/\d/);
      if (firstDigitIndex === -1) return group.toUpperCase();

      const letters = group.slice(0, firstDigitIndex).toUpperCase();
      const numbers = group.slice(firstDigitIndex);
      return letters + numbers;
    },

    // Проверка стандартных аудиторий (цифры+буквы)
    isStandardRoom(query) {
      return /^\d+[а-яё]+$/i.test(query); // Например: 229гл, 704гл
    },

    // Проверка аудиторий с пробелом (цифры пробел буквы)
    isRoomWithSpace(query) {
      return /^\d+[а-яё]?\s[а-яё]+$/i.test(query); // Например: 130а зоо, 459а мх
    },

    // Проверка специальных аудиторий (точное совпадение)
    isSpecialRoom(query) {
      const specialRooms = [
        '129 1общ',
        'бокс мтп', 'бокс пм', 'бокс тр',
        'спортивный комплекс', 'учхоз'
      ];
      return specialRooms.includes(query.toLowerCase());
    },

    // Форматирование имени преподавателя для API (убираем точки)
    formatTeacherForApi(input) {
      if (!input) return null;

      // Нормализуем ввод
      const normalizedInput = input.trim().toLowerCase()
        .replace(/\./g, '') // Удаляем точки
        .replace(/\s+/g, ' ') // Заменяем множественные пробелы
        .replace(/-/g, ' '); // Заменяем дефисы на пробелы

      const inputParts = normalizedInput.split(' ');
      const allTeachers = this.$store.getters.allTeachers || [];

      // Ищем всех преподавателей с подходящей фамилией
      let candidates = allTeachers.filter(teacher => {
        const teacherParts = teacher.toLowerCase().split(' ');
        return teacherParts[0] === inputParts[0];
      });

      // Если ввели только фамилию
      if (inputParts.length === 1) {
        return candidates.length === 1
          ? candidates[0].replace(/ /g, '_')
          : null;
      }

      // Фильтруем по имени (первая буква)
      if (inputParts.length > 1) {
        candidates = candidates.filter(teacher => {
          const teacherParts = teacher.toLowerCase().split(' ');
          return teacherParts[1]?.charAt(0) === inputParts[1].charAt(0);
        });
      }

      // Фильтруем по отчеству (первая буква)
      if (inputParts.length > 2) {
        candidates = candidates.filter(teacher => {
          const teacherParts = teacher.toLowerCase().split(' ');
          return teacherParts[2]?.charAt(0) === inputParts[2].charAt(0);
        });
      }

      return candidates.length === 1
        ? candidates[0].replace(/ /g, '_')
        : null;
    },

    // Форматирование для отображения: "иванов иван" → "Иванов И."
    formatTeacherForDisplay(name) {
      if (!name || typeof name !== 'string') return '';

      // Удаляем точки и лишние пробелы
      const parts = name.replace(/\./g, '').replace(/\s+/g, ' ').trim().split(' ');

      // Фамилия с большой буквы
      let result = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();

      // Инициал имени
      if (parts.length > 1 && parts[1]) {
        result += ` ${parts[1].charAt(0).toUpperCase()}.`;
      }

      // Инициал отчества
      if (parts.length > 2 && parts[2]) {
        result += ` ${parts[2].charAt(0).toUpperCase()}.`;
      }

      return result;
    },

    // Основное определение типа поиска
    determineSearchType(query) {
      query = query.trim();

      // 1. Специальные аудитории
      if (this.isSpecialRoom(query)) return 'room';

      // 2. Аудитории с пробелом
      if (this.isRoomWithSpace(query)) return 'room';

      // 3. Стандартные аудитории
      if (this.isStandardRoom(query)) return 'room';

      // 4. Группы (буквы + цифры)
      if (/^[а-яё]+\d+$/i.test(query)) return 'group';

      // 5. Всё остальное - преподаватель
      return 'teacher';
    },

    // Валидация ввода
    validateInput(query) {
      query = query.trim();
      if (!query) return null;

      // Проверяем, загружены ли списки
      const listsLoaded = this.$store.getters.allGroups &&
        this.$store.getters.allTeachers &&
        this.$store.getters.allRooms;

      if (!listsLoaded) {
        console.error('Списки данных не загружены');
        return null;
      }

      const type = this.determineSearchType(query);

      // Дополнительная валидация для преподавателей
      if (type === 'teacher' && !/^[а-яё\s\-\.]+$/i.test(query)) {
        return null;
      }

      return type;
    },

    async handleSearch() {



      console.log('Поиск:', {
        input: this.searchInput,
        type: this.validateInput(this.searchInput),
        allTeachers: this.$store.getters.allTeachers,
        apiFormat: this.formatTeacherForApi(this.searchInput)
      });

      if (this.activeSuggestionIndex >= 0 && this.suggestions.length) {
        this.searchInput = this.suggestions[this.activeSuggestionIndex];
      }

      const query = this.searchInput.trim();
      if (!query) return;

      const type = this.validateInput(query);
      if (!type) {
        this.errorMessage = 'Введите: группу (ПИ2303), преподавателя (Иванов) или аудиторию (405эк)';
        setTimeout(() => this.errorMessage = '', 3000);
        return;
      }

      try {
        if (type === 'teacher') {
          const apiQuery = this.formatTeacherForApi(query);
          const allTeachers = this.$store.getters.allTeachers || [];

          if (apiQuery === null) {
            const suggestions = this.getTeacherSuggestions(query);
            this.errorMessage = suggestions.length
              ? `Уточните преподавателя: ${suggestions.join(', ')}`
              : 'Найдено несколько преподавателей с такой фамилией. Уточните имя.';
            setTimeout(() => this.errorMessage = '', 5000);
            return;
          }

          if (!apiQuery) {
            this.errorMessage = 'Преподаватель не найден';
            setTimeout(() => this.errorMessage = '', 3000);
            return;
          }

          // Проверяем существование в списке
          const exists = allTeachers.some(t =>
            t.replace(/ /g, '_').toLowerCase() === apiQuery.toLowerCase()
          );

          if (!exists) {
            this.errorMessage = `Преподаватель ${this.formatTeacherForDisplay(apiQuery.replace(/_/g, ' '))} не найден`;
            setTimeout(() => this.errorMessage = '', 3000);
            return;
          }

          await this.$store.dispatch('searchSchedule', {
            type,
            query: apiQuery,
            displayQuery: this.formatTeacherForDisplay(apiQuery.replace(/_/g, ' '))
          });
          return;
        } else {
          // Логика для групп и аудиторий
          const list = type === 'group'
            ? this.$store.getters.allGroups || []
            : this.$store.getters.allRooms || [];

          const exists = list.some(item =>
            item.toLowerCase() === query.toLowerCase()
          );

          if (!exists) {
            this.errorMessage = `${this.getTypeName(type)} "${query}" не найден(а)`;
            setTimeout(() => this.errorMessage = '', 3000);
            return;
          }

          await this.$store.dispatch('searchSchedule', {
            type,
            query,
            displayQuery: query
          });
        }
      } catch (error) {
        console.error('Ошибка поиска:', error);
        this.errorMessage = 'Ошибка при загрузке расписания';
        setTimeout(() => this.errorMessage = '', 3000);
      } finally {
        this.showSuggestions = false;
      }
    },

    formatSearchQuery(type, query) {
      if (type !== 'teacher') return query;

      // Приводим к формату "Фамилия И О"
      const parts = query.split(' ');
      let formatted = parts[0]; // Фамилия

      if (parts.length > 1) {
        formatted += ` ${parts[1][0].toUpperCase()}.`; // Инициал имени
      }

      if (parts.length > 2) {
        formatted += ` ${parts[2][0].toUpperCase()}.`; // Инициал отчества
      }

      return formatted;
    },

    getTypeName(type) {
      const names = {
        group: 'Группа',
        teacher: 'Преподаватель',
        room: 'Аудитория'
      };
      return names[type] || '';
    },

    async checkIfExists(type, query) {
      if (type !== 'teacher') {
        const list = this.$store.getters[`all${type.charAt(0).toUpperCase() + type.slice(1)}`] || [];
        return list.some(item => item.toLowerCase() === query.toLowerCase());
      }

      const apiFormat = this.formatTeacherForApi(query);
      if (!apiFormat) return false;

      const allTeachers = this.$store.getters.allTeachers || [];
      return allTeachers.some(t => {
        const teacherApiFormat = t.replace(/ /g, '_').toLowerCase();
        return teacherApiFormat === apiFormat.toLowerCase();
      });
    },
    getTeacherSuggestions(input) {
      // Добавляем проверку на undefined и null
      if (!input || typeof input.trim !== 'function') return [];

      const query = input.trim();
      if (query.length < 3) return [];

      const allTeachers = this.$store.getters.allTeachers || [];
      if (!allTeachers.length) return [];

      const queryLower = query.toLowerCase();
      const queryParts = queryLower.split(' ');

      return allTeachers.filter(teacher => {
        if (!teacher || typeof teacher !== 'string') return false;

        const teacherLower = teacher.toLowerCase();
        const teacherParts = teacherLower.split(' ');

        // Проверяем совпадение фамилии
        if (!teacherParts[0]?.includes(queryParts[0])) return false;

        // Проверяем совпадение инициалов имени
        if (queryParts.length > 1 && teacherParts[1]) {
          return teacherParts[1].startsWith(queryParts[1].charAt(0));
        }

        return true;
      }).slice(0, 5);
    },
    getSuggestions(input) {
      if (!input || input.trim().length < 3) return []; // Показываем после 2 символов

      const type = this.determineSearchType(input);
      const searchLower = input.toLowerCase();

      switch (type) {
        case 'teacher':
          const allTeachers = this.$store.getters.allTeachers || [];
          return allTeachers
            .filter(teacher => teacher.toLowerCase().includes(searchLower))
            .slice(0, 5);

        case 'group':
          const allGroups = this.$store.getters.allGroups || [];
          return allGroups
            .filter(group => group.toLowerCase().includes(searchLower))
            .slice(0, 5);

        case 'room':
          const allRooms = this.$store.getters.allRooms || [];
          return allRooms
            .filter(room => room.toLowerCase().includes(searchLower))
            .slice(0, 5);

        default:
          return [];
      }
    },

    // Выбор подсказки
    selectSuggestion(item) {
      this.searchInput = item;
      this.showSuggestions = false;
      this.activeSuggestionIndex = -1;
      this.handleSearch();
    },

    // Навигация по подсказкам клавиатурой
    moveSelection(direction) {
      if (!this.showSuggestions) return;

      const newIndex = this.activeSuggestionIndex + direction;
      if (newIndex >= 0 && newIndex < this.suggestions.length) {
        this.activeSuggestionIndex = newIndex;
      }

      // Автопрокрутка списка
      const suggestionElements = this.$el.querySelectorAll('.suggestion-item');
      if (suggestionElements[newIndex]) {
        suggestionElements[newIndex].scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    },

    // Обработка ввода
    handleInput() {
      if (this.searchInput && this.searchInput.trim().length >= 2) {
        this.showSuggestions = true;
        this.activeSuggestionIndex = -1;
      } else {
        this.showSuggestions = false;
      }
    },



  },
  computed: {
    suggestions() {
      return this.getSuggestions(this.searchInput);
    },
    teacherSuggestions() {
      try {
        return this.searchInput ? this.getTeacherSuggestions(this.searchInput) : [];
      } catch (error) {
        console.error('Ошибка получения подсказок:', error);
        return [];
      }
    }
  }
}
</script>

<style lang="sass" scoped>
@import "@/assets/styles/variables.sass"
@import "@/assets/styles/mixins.sass"


.search-error
  position: absolute
  top: 18%
  left: 5%
  color: #ff4444
  font-size: 0.9rem
  padding: 0.5rem
  background: #fff
  border-radius: 0.3rem
  box-shadow: 0 2px 4px rgba(0,0,0,0.1)
  z-index: 10
  margin-top: 0.5rem
  .tg-theme &
    background-color: var(--tg-secondary-bg-color)
    color: var(--tg-text-color)

.fade-enter-active,
.fade-leave-active
  transition: opacity 0.3s

.fade-enter,
.fade-leave-to
  opacity: 0
  
.search
  display: flex
  flex-wrap: nowrap
  justify-content: space-between
  align-items: center
  margin-bottom: 1.5rem

  &__input
    padding: 0.9rem 1rem
    border: solid 0.1rem $color-light-grey
    border-radius: 0.3rem
    width: 100%
    height: max-content
    margin-right: 1rem
    &:focus 
      outline: none
    
    .tg-theme &
      background-color: var(--tg-secondary-bg-color)
      border-color: var(--tg-hint-color)
      color: var(--tg-text-color)
    
    @include respond(small-phone)
      height: 3.5rem
    @include respond(phone)
      height: 3.5rem

    &::placeholder
      font-size: 1.3rem
      line-height: 1.5rem
      font-weight: 400
      color: $color-table-border
      .tg-theme &
        color: var(--tg-hint-color)
      
      @include respond(small-phone)
        font-size: 1.3rem
      @include respond(phone)
        font-size: 1.4rem

  &__loupe
    position: relative
    background-color: $color-light-green
    border-radius: 0.3rem
    padding: 0.8rem
    width: 3rem
    height: 3rem
    display: flex
    align-items: center
    justify-content: center
    cursor: pointer
  
    
    @include respond(small-phone)
      height: 3.2rem
      width: 3.2rem
    @include respond(phone)
      height: 3.4rem
      width: 3.4rem

    // Hover-эффекты только для устройств с мышью
    @media (hover: hover) and (pointer: fine)
      &:hover path
        fill: $color-light-green
      .tg-theme:hover path
        fill: var(--tg-button-color)

    &:after
      content: ''
      z-index: -1
      position: absolute
      bottom: -0.2rem
      right: -0.1rem
      width: 100%
      height: 100%
      border-radius: 0.3rem
      background-color: $color-dark-green
      .tg-theme &
        background-color: var(--tg-button-color)
        opacity: 0.8
</style>