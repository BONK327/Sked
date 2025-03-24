<template>
  <Header title="Расписание"/>
  <Slider/>
  <GroupInfo/>
  <Search/>
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

export default {
  name: 'sked',
  components: {Header, Buttons, ScheduleTable, Search, GroupInfo, Slider}

}
</script>

<style lang="sass" scoped>

</style>