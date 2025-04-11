<template>
  <div class="schedule">
    <div class="container">
      <div class="grid">
        <keep-alive>
          <component :is="currentComponent"></component>
        </keep-alive>
      </div>
    </div>
    <AddNoteModal />
    <NoteDialog />
    <Footer/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import sked from "@/components/Sked/sked.vue"
import Notes from "@/views/Notes.vue"
import Footer from "@/components/Footer.vue"
import AddNoteModal from "@/components/AddNoteModal.vue"
import NoteDialog from "@/components/NoteDialog.vue"

export default {
  name: 'App',
  components: {
    Footer,
    sked,
    Notes,
    AddNoteModal,
    NoteDialog
  },
  computed: {
    ...mapGetters(['activeTab']),
    currentComponent() {
      return this.activeTab === 'schedule' ? 'sked' : 'Notes'
    }
  },
  created() {
    const today = new Date();
    const dayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    const monthNames = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

    this.$store.dispatch('fetchFullWeekSchedule', {
      fullDayName: dayNames[today.getDay()],
      date: today.getDate(),
      month: monthNames[today.getMonth()],
      originalDate: today
    });
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
  height: 100%
  @include respond(big-screen)
    font-size: 84%
  @include respond(computer)
    font-size: 82%
  @include respond(tab-lend)
    font-size: 80%
  @include respond(tab-port)
    font-size: 77%
  @include respond(phone)
    font-size: 72.5%
  @include respond(small-phone)
    font-size: 62.5%
  background-color: #212529

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
  

.schedule
  flex: 1
  display: flex
  flex-direction: column

.container
  flex: 1
  overflow-y: auto
  width: 100%
  min-height: calc(100vh - #{$footer-height})
  padding: 2rem
  position: relative
  z-index: 0
  transition: all 0.3s ease

// Анимация переключения вкладок
.fade-enter-active,
.fade-leave-active
  transition: opacity 0.3s, transform 0.3s

.fade-enter,
.fade-leave-to
  opacity: 0
  transform: translateY(10px)
</style>