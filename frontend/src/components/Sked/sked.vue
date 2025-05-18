<template>
  <Slider/>
  <GroupInfo/>
  <Search 
    ref="search1"
    placeholder="Группа, преподаватель, аудитория"
    @search="handleSearch($event)"
  />
  <ScheduleTable/>
  <Buttons/>
</template>

<script>
import Header from "@/components/header.vue";
import Slider from "@/components/Sked/Slider.vue";
import GroupInfo from "@/components/Sked/GroupInfo.vue";
import Search from "@/components/Sked/Search.vue";
import ScheduleTable from "@/components/Sked/ScheduleTable.vue";
import Buttons from "@/components/UI/Buttons.vue";
import { mapActions } from 'vuex';

export default {
  name: 'sked',
  components: {Header, Buttons, ScheduleTable, Search, GroupInfo, Slider},
  methods: {
    ...mapActions(['searchSchedule']),
    
    handleSearch(event) {
      this.searchSchedule({
        type: event.type,
        query: event.query,
        week: 'week1' // Используем week1 по умолчанию, как в Double.vue
      });
    }
  },
  mounted() {
    this.$store.dispatch('updateDays');
  }
}
</script>

<style lang="sass" scoped>

</style>