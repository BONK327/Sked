<template>
  <div class="schedule">
    <div class="container">
      <div class="grid">
        <keep-alive>
          <component :is="currentComponent"></component>
        </keep-alive>
      </div>
    </div>
    <Footer/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import sked from "@/components/Sked/sked.vue"
import Notes from "@/views/Notes.vue"
import Footer from "@/components/Footer.vue"

export default {
  name: 'App',
  components: {
    Footer,
    sked,
    Notes
  },
  computed: {
    ...mapGetters(['activeTab']),
    currentComponent() {
      return this.activeTab === 'schedule' ? 'sked' : 'Notes'
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
  box-sizing: border-box

html
  font-size: 62.5%
  background-color: #212529

body
  font-family: 'Roboto', sans-serif
  color: $color-text
  margin: 0 auto
  max-width: $content-max-width
  background-color: $color-white
  min-height: 100vh
  position: relative

.container
  width: 100%
  min-height: calc(100vh - #{$footer-height})
  padding: 2rem
  position: relative
  z-index: 0
  transition: all 0.3s ease

  @media (max-width: $mobile-breakpoint)
    padding: 1rem

// Анимация переключения вкладок
.fade-enter-active,
.fade-leave-active
  transition: opacity 0.3s, transform 0.3s

.fade-enter,
.fade-leave-to
  opacity: 0
  transform: translateY(10px)
</style>