<template>
    <div class="preloader" :class="{ 'tg-theme': isTelegram }" :data-theme="isDark ? 'dark' : 'light'">
      <div class="preloader__content">
        <div class="preloader__spinner"></div>
        <div class="preloader__text">Загрузка</div>
      </div>
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
    justify-content: center
    align-items: center
    z-index: 9999
    transition: background-color 0.3s ease-out
  
    &.tg-theme
      background-color: var(--tg-secondary-bg-color)
  
    &[data-theme="dark"]
      background-color: var(--tg-secondary-bg-color)
  
    &__content
      display: flex
      flex-direction: column
      align-items: center
      gap: 1rem
  
    &__spinner
      width: 5rem
      height: 5rem
      border: 4px solid rgba($color-light-green, 0.2)
      border-radius: 50%
      border-top-color: $color-light-green
      animation: spin 1.5s ease infinite
  
  
    &__text
      font-size: 2rem
      color: $color-text
  
      .tg-theme &
        color: var(--tg-text-color)
  
  @keyframes spin
    to
      transform: rotate(360deg)
  </style>