<template>
  <tr class="table__content-row">
    <td class="table__content-row-time" v-html="row.time"></td>
    <td :class="['table__content-row-color', `table__content-row-color--${row.type}`]"></td>
    <td class="table__content-row-lesson">
      <span class="table__content-row-lesson--class">{{ row.lesson }}</span><br>
      <span class="table__content-row-lesson--details">
        {{ displayMainDetails }}
      </span>
    </td>
    <td class="table__content-row-room">
      <span class="table__content-row-room--num">
        {{ displayRoomDetails }}
      </span>
      <div class="table__content-row-room-note-container">
        <svg v-if="hasNote && isLessonExists" @click.stop="handleNoteClick" @touchstart.stop="handleNoteClick"
          class="table__content-row-room-note" width="18" height="18" viewBox="0 0 15 16" fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12.3333 8.33333V6.33333C12.3333 4.13333 12.3333 3.03333 11.65 2.35C10.9667 1.66667 9.86667 1.66667 7.66667 1.66667H5.66667C3.46667 1.66667 2.36667 1.66667 1.68333 2.35C1 3.03333 1 4.13333 1 6.33333V9.66667C1 11.8667 1 12.9667 1.68333 13.65C2.36667 14.3333 3.46667 14.3333 5.66667 14.3333H6.66667M10 1V2.33333M6.66667 1V2.33333M3.33333 1V2.33333M8.33333 13C8.33333 13 9 13 9.66667 14.3333C9.66667 14.3333 11.7847 11 13.6667 10.3333M4 9.66667H6.66667M4 6.33333H9.33333"
            stroke="#3DB95E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
    </td>
  </tr>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ScheduleTableRow',
  props: {
    row: {
      type: Object,
      required: true
    }
  },
  computed: {
    ...mapGetters(['selectedDay', 'getNotes', 'searchType']),

    isLessonExists() {
      return this.row.lesson?.trim() !== ''
    },

    hasNote() {
      const selectedDate = this.selectedDay?.originalDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
      return this.getNotes.some(note =>
        note.lesson === this.row.lesson &&
        note.time === this.row.time &&
        note.date === selectedDate
      )
    },

    displayTeachers() {
      return this.row.teachers?.map(t => t.name).join(', ') || '';
    },

    displayGroups() {
      if (this.searchType === 'teacher') {
        // Для преподавателя: Группа (подгруппа)
        const groups = {};
        this.row.details?.forEach(d => {
          if (d.group) {
            const key = d.group + (d.subgroup ? `_${d.subgroup}` : '');
            groups[key] = d.group + (d.subgroup ? ` (${d.subgroup})` : '');
          }
        });
        return Object.values(groups).join(', ');
      }

      if (this.searchType === 'room') {
        // Для аудитории: только уникальные группы без подгрупп и повторений
        const groups = new Set();
        this.row.details?.forEach(d => {
          d.groups?.forEach(g => {
            if (g.group) {
              // Убираем номер подгруппы в скобках, если он есть
              const baseGroup = g.group.split('(')[0];
              groups.add(baseGroup);
            }
          });
        });
        return [...groups].join(', ');
      }

      return '';
    },

    displayRooms() {
      if (this.searchType === 'group') {
        return this.row.room || '';
      }
      if (this.searchType === 'teacher') {
        return this.row.room || '';
      }
      return '';
    },
    displayMainDetails() {
      switch (this.searchType) {
        case 'group':
          // Для групп: преподаватели с подгруппами
          return this.formatTeachersWithSubgroups(this.row.teachers);
        case 'teacher':
          // Для преподавателей: группы с подгруппами
          return this.formatGroupsWithSubgroups(this.row.details);
        case 'room':
          // Для аудиторий: преподаватели с подгруппами
          return this.formatTeachersWithSubgroups(this.row.details);
        default:
          return '';
      }
    },

    displayRoomDetails() {
      switch (this.searchType) {
        case 'group':
          // Для групп: все аудитории с подгруппами
          return this.formatRoomsWithSubgroups(this.row.teachers);
        case 'teacher':
          // Для преподавателей: аудитории с подгруппами
          return this.row.room || '';
        case 'room':
          // Для аудиторий: группы с подгруппами
          return this.formatGroupsWithSubgroups(
            this.row.details?.flatMap(d => d.groups || [])
          );
        default:
          return '';
      }
    }
  },
  methods: {
    handleNoteClick(e) {
      if (!this.isLessonExists) {
        e.preventDefault()
        e.stopPropagation()
        return
      }
      // Предотвращаем возможное срабатывание других обработчиков
      e.preventDefault()
      e.stopPropagation()

      const selectedDate = this.selectedDay?.originalDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
      const note = this.getNotes.find(note =>
        note.lesson === this.row.lesson &&
        note.time === this.row.time &&
        note.date === selectedDate
      )

      if (note) {
        this.$store.dispatch('openNoteDialog', note.id)
      }
    },
    formatTeachersWithSubgroups(items) {
      if (!items || !items.length) return '';
      
      return items.map(item => {
        // Для поиска по аудиториям структура данных другая
        const teacherName = item.name || item.teacher || '';
        const subgroup = item.subgroup || 
                        (item.groups?.[0]?.subgroup) || 
                        '';
        
        if (!teacherName) return '';
        
        const nameParts = teacherName.split(' ');
        const shortName = nameParts[0] + ' ' + 
                         (nameParts[1] ? nameParts[1][0] + '.' : '') + 
                         (nameParts[2] ? nameParts[2][0] + '.' : '');
        
        return subgroup ? `${teacherName}(${subgroup})` : teacherName;
        // Если нужно короткое имя то заменить на
        //return subgroup ? `${shortName}(${subgroup})` : shortName;
      }).filter(Boolean).join(', ');
    },

    formatGroupsWithSubgroups(groups) {
      if (!groups) return '';
      
      if (this.searchType === 'room') {
        // Для аудиторий: только базовые группы без подгрупп
        const uniqueGroups = new Set();
        groups.forEach(g => {
          if (g.group) {
            // Убираем номер подгруппы в скобках, если он есть
            const baseGroup = g.group.split('(')[0];
            uniqueGroups.add(baseGroup);
          }
        });
        return [...uniqueGroups].join(', ');
      }
      
      // Для других типов поиска оставляем как было
      return groups.map(g => {
        let str = g.group;
        if (g.subgroup) str += `(${g.subgroup})`;
        return str;
      }).join(', ');
    },

    formatRoomsWithSubgroups(items) {
      if (!items) return '';
      const roomMap = new Map();
      const allSubgroups = new Set();

      // Собираем все подгруппы
      items.forEach(item => {
        if (item.subgroup) {
          allSubgroups.add(item.subgroup);
        }
      });

      // Группируем по аудиториям
      items.forEach(item => {
        if (item.room) {
          if (!roomMap.has(item.room)) {
            roomMap.set(item.room, new Set());
          }
          if (item.subgroup) {
            roomMap.get(item.room).add(item.subgroup);
          }
        }
      });

      // Формируем результат
      return [...roomMap.entries()].map(([room, subgroups]) => {
        // Не показываем подгруппы если в аудитории все подгруппы
        return subgroups.size === allSubgroups.size ? room : `${room}(${[...subgroups].join(',')})`;
      }).join(', ');
    }
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
  &__title
    font-size: 1.2rem
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
      align-items: flex-start
      &-time
        align-self: center
        padding: 1.5rem 0.5rem
        flex: 0 0 auto
      &-color
        width: 0.75rem
        flex: 0 0 auto
        min-height: 5rem
        align-self: stretch
      &-color--seminar
        background-color: $color-table-border
      &-color--lection
        background-color: $color-orange
      &-lesson
        padding: 0.5rem 0.8rem
        flex: 1
        &--class,
        &--teacher
          white-space: normal
          word-break: break-word
          display: inline-block
          width: 100%
        &--class
          line-height: 1rem
          margin-bottom: 0.2rem
        &--teacher
          color: $color-light-green
      &-room
        align-self: flex-start
        text-align: center
        padding: 0.5rem 0.3rem 0.5rem 0
        flex: 0 0 auto
        display: flex
        flex-direction: column
        align-items: flex-end
        position: relative
        &--num
          letter-spacing: -0.03rem
        &-note
          width: 2.5rem
          cursor: pointer
          transition: transform .2s ease
          touch-action: manipulation  // Оптимизация для касаний
          -webkit-tap-highlight-color: transparent  // Убираем подсветку при касании на iOS
          &:hover
            transform: scale(1.1)
          &-container
            display: flex
            justify-content: flex-end
            align-items: center
            height: 100%
            padding-top: 0.3rem
            z-index: 1
    //pointer-events: auto

    tr
      min-height: 5rem
      height: auto !important
      background-color: white
      border: solid 0.1rem $color-table-border
      margin-top: -0.1rem

    th,
    td
      font-size: 1rem
      font-weight: 400
      box-sizing: border-box
      overflow-wrap: break-word
      @include respond(small-phone)
        font-size: 0.8rem


        
.table__content-row-lesson--details 
  color: $color-light-green;
  

        
.table__content-row-room--num 
  font-weight: 500;


        
</style>