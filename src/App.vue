<template>
  <div class="schedule">
    <div class="container">
      <div class="grid">
        <Header/>
        <Slider/>
        <GroupInfo/>
        <Search/>
        <Schedule/>
        <Buttons/>
        <Footer/>

      </div>
    </div>
  </div>
</template>

<script>
import Header from "@/components/header.vue";
import Slider from "@/components/Slider.vue";
import GroupInfo from "@/components/GroupInfo.vue";
import Search from "@/components/Search.vue";
import Schedule from "@/components/Schedule.vue";
import Buttons from "@/components/UI/Buttons.vue";
import Footer from "@/components/Footer.vue";

export default {
  name: 'App',
  components: {Footer, Buttons, Schedule, Search, GroupInfo, Slider, Header}

}

</script>

<style lang="sass">
@import "@/assets/styles/variables.sass"

*
  margin: 0
  padding: 0
  box-sizing: border-box

html
  font-size: 62.5%

body
  font-family: 'Roboto', sans-serif
  background-color: #212529
  color: $color-text

.container
  margin: 0 auto
  max-width: 30rem
  height: 64rem
  background-color: $color-white
  position: relative
  z-index: 0

.grid
  padding: 2rem 2rem 0 2rem
</style>