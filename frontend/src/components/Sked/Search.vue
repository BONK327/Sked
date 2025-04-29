<template>
  <section class="search">
    <input class="search__input" type="text" v-model="searchInput" placeholder="Группа, преподаватель, аудитория"
      @keyup.enter="handleSearch">
    <transition name="fade">
      <div v-if="errorMessage" class="search-error">
        {{ errorMessage }}
      </div>
    </transition>
    <svg class="search__loupe btn" width="13" height="13" viewBox="0 0 13 13" fill="none"
      xmlns="http://www.w3.org/2000/svg" @click="handleSearch">
      <path fill-rule="evenodd" clip-rule="evenodd"
        d="M1.46466 1.40156C1.00031 1.86591 0.631959 2.41718 0.380652 3.02389C0.129346 3.6306 6.91942e-09 4.28086 0 4.93756C-6.91942e-09 5.59426 0.129346 6.24452 0.380652 6.85123C0.631959 7.45794 1.00031 8.0092 1.46466 8.47356C1.92901 8.93791 2.48028 9.30626 3.08699 9.55757C3.6937 9.80887 4.34396 9.93822 5.00066 9.93822C5.65736 9.93822 6.30762 9.80887 6.91433 9.55757C7.52104 9.30626 8.0723 8.93791 8.53666 8.47356C9.44745 7.53055 9.95142 6.26754 9.94003 4.95655C9.92864 3.64557 9.40279 2.39151 8.47575 1.46447C7.54871 0.537426 6.29465 0.0115811 4.98366 0.000189013C3.67268 -0.0112031 2.40967 0.492769 1.46666 1.40356M7.83066 7.76756C7.46074 8.14579 7.01946 8.44687 6.53238 8.65339C6.04529 8.8599 5.52208 8.96773 4.99303 8.97065C4.46399 8.97356 3.93962 8.8715 3.45029 8.67036C2.96096 8.46922 2.51639 8.17302 2.14233 7.79889C1.76826 7.42476 1.47213 6.98014 1.27108 6.49077C1.07003 6.00141 0.968061 5.47702 0.971068 4.94797C0.974075 4.41893 1.082 3.89573 1.2886 3.40869C1.4952 2.92164 1.79637 2.48041 2.17466 2.11056C2.92767 1.37434 3.94064 0.964788 4.99374 0.970774C6.04683 0.976759 7.05508 1.3978 7.79968 2.14253C8.54428 2.88726 8.96514 3.89558 8.97094 4.94868C8.97674 6.00178 8.56701 7.01468 7.83066 7.76756Z"
        fill="white" />
      <path
        d="M7.82859 9.20055C7.64108 9.01291 7.53579 8.75847 7.53589 8.4932C7.53598 8.22793 7.64145 7.97356 7.82909 7.78605C8.01673 7.59854 8.27117 7.49325 8.53644 7.49335C8.80172 7.49344 9.05608 7.59891 9.24359 7.78655L12.0716 10.6155C12.1671 10.7078 12.2433 10.8181 12.2957 10.9401C12.3481 11.0621 12.3757 11.1934 12.3768 11.3261C12.378 11.4589 12.3527 11.5906 12.3024 11.7135C12.2521 11.8364 12.1779 11.9481 12.084 12.0419C11.9901 12.1358 11.8784 12.2101 11.7555 12.2604C11.6326 12.3107 11.501 12.336 11.3682 12.3348C11.2354 12.3336 11.1042 12.3061 10.9822 12.2537C10.8602 12.2012 10.7498 12.1251 10.6576 12.0295L7.82859 9.20055Z"
        fill="white" />
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
      errorMessage: ''
    }
  },
  methods: {
    ...mapActions(['searchSchedule']),

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
  formatTeacherForApi(name) {
    if (!name) return '';
    
    // Удаляем точки и лишние пробелы
    const cleaned = name.replace(/\./g, '').replace(/\s+/g, ' ').trim();
    const parts = cleaned.split(' ');
    
    let result = parts[0]; // Фамилия
    
    // Добавляем первую букву имени
    if (parts.length > 1) {
      result += `_${parts[1][0]}`;
    }
    
    // Добавляем первую букву отчества
    if (parts.length > 2) {
      result += `_${parts[2][0]}`;
    }
    
    return result;
  },

  // Форматирование для отображения: "иванов иван" → "Иванов И."
  formatTeacherForDisplay(name) {
    if (!name) return '';
    
    const parts = name.replace(/\./g, '').replace(/\s+/g, ' ').trim().split(' ');
    
    // Фамилия с большой буквы
    let result = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
    
    // Инициал имени
    if (parts.length > 1) {
      result +=  `${parts[1][0].toUpperCase()}.`;
    }
    
    // Инициал отчества
    if (parts.length > 2) {
      result +=  `${parts[2][0].toUpperCase()}.`;
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

    const type = this.determineSearchType(query);
    
    // Разрешаем точки для преподавателей
    if (type === 'teacher' && !/^[а-яё\s\-\.]+$/i.test(query)) {
      return null;
    }
    
    return type;
  },

  handleSearch() {
    const query = this.searchInput.trim();
    if (!query) return;

    const type = this.validateInput(query);

    if (!type) {
      this.errorMessage = 'Введите: группу (ПИ2303), преподавателя (Иванов) или аудиторию (405эк)';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    let searchQuery = query;
    
    if (type === 'group') {
      const firstDigit = query.search(/\d/);
      searchQuery = firstDigit === -1 
        ? query.toUpperCase() 
        : query.slice(0, firstDigit).toUpperCase() + query.slice(firstDigit);
    }
    // Обработка преподавателей
    else if (type === 'teacher') {
      this.searchSchedule({
        type,
        query: this.formatTeacherForApi(query), // Для API
        displayQuery: this.formatTeacherForDisplay(query) // Для отображения
      });
      return;
    }

    this.errorMessage = '';
    this.searchSchedule({ type, query });
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
    @include respond(small-phone)
      height: 3.5rem
    @include respond(phone)
      height: 3.5rem

    &::placeholder
      font-size: 1.3rem
      line-height: 1.5rem
      font-weight: 400
      color: $color-table-border
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
</style>