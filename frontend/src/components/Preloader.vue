<template>
  <div class="preloader" :class="{ 'tg-theme': isTelegram }" :data-theme="isDark ? 'dark' : 'light'">
    <span class="loader"></span>
    <!-- <div class="preloader__text">Загрузка</div> -->
  </div>
</template>

<script>
export default {
  name: 'Preloader',
  props: {
    isTelegram: {
      type: Boolean,
      default: false
    },
    isDark: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="sass" scoped>
@import "@/assets/styles/variables.sass"

.preloader
  position: fixed
  top: 0
  left: 0
  width: 100%
  height: 100%
  background-color: $color-white
  display: flex
  flex-direction: column
  justify-content: center
  align-items: center
  z-index: 9999
  transition: background-color 0.3s ease-out
  cursor: wait

  &.tg-theme
    background-color: var(--tg-secondary-bg-color)

  &[data-theme="dark"]
    background-color: var(--tg-secondary-bg-color)

.loader 
  width: 4.8rem
  height: 4.8rem
  display: block
  margin: 2rem auto
  position: relative
  border: .3rem solid $color-light-green
  border-radius: 50%
  box-sizing: border-box
  animation: animloader 2s linear infinite

.loader::after 
  content: ''
  box-sizing: border-box
  width: .6rem
  height: 2.4rem
  background: $color-light-green
  transform: rotate(-45deg)
  position: absolute
  bottom: -2rem
  left: 4.6rem


@keyframes animloader 
  0% 
    transform: translate(-1rem, -1rem)
  
  25% 
    transform: translate(-1rem, 1rem)
  
  50% 
    transform: translate(1rem, 1rem)
  
  75% 
    transform: translate(1rem, -1rem)
  
  100% 
    transform: translate(-1rem, -1rem)
  

</style>