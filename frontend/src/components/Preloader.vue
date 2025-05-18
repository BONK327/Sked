<template>
  <div class="preloader" :class="{ 'tg-theme': isTelegram }" :data-theme="isDark ? 'dark' : 'light'">
    <div class="book">
      <div class="inner">
        <div class="left"></div>
        <div class="middle"></div>
        <div class="right"></div>
      </div>
      <ul>
        <li v-for="i in 18" :key="i" :style="getPageStyle(i)"></li>
      </ul>
    </div>
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
  },
  methods: {
    getPageStyle(i) {
      const delay = i * 1.86;
      const delayAfter = i * 1.74;
      const animationName = `page-animation-${i}`;
      
      // Динамически создаем keyframes для каждой страницы
      if (!document.getElementById(animationName)) {
        const style = document.createElement('style');
        style.id = animationName;
        style.innerHTML = `
          @keyframes ${animationName} {
            ${4 + delay}% {
              transform: rotateZ(0deg) translateX(-1.8rem);
            }
            ${13 + delayAfter}%, ${54 + delay}% {
              transform: rotateZ(180deg) translateX(-1.8rem);
            }
            ${63 + delayAfter}% {
              transform: rotateZ(0deg) translateX(-1.8rem);
            }
          }
        `;
        document.head.appendChild(style);
      }
      
      return {
        '--color': this.isTelegram ? 'var(--tg-text-color)' : this.isDark ? '#ffffff' : '#101010',
        'animation': `${animationName} 6.8s ease infinite`
      };
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

  &__text
    font-size: 1.5rem
    margin-top: 2rem
    color: $color-text
    .tg-theme &
      color: var(--tg-text-color)
    &[data-theme="dark"]
      color: var(--tg-text-color)

.book
  --duration: 6.8s
  width: 3.2rem
  height: 1.2rem
  position: relative
  margin: 3.2rem 0 0 0
  zoom: 1.5
  .inner
    width: 3.2rem
    height: 1.2rem
    position: relative
    transform-origin: .2rem .2rem
    transform: rotateZ(-90deg)
    animation: book var(--duration) ease infinite
    .left,
    .right
      width: 6rem
      height: .4rem
      top: 0
      border-radius: .2rem
      background: $color-light-green
      position: absolute
      &:before
        content: ''
        width: 4.8rem
        height: .4rem
        border-radius: .2rem
        background: inherit
        position: absolute
        top: -1rem
        left: .6rem
    .left
      right: 2.8rem
      transform-origin: 5.8rem .2rem
      transform: rotateZ(90deg)
      animation: left var(--duration) ease infinite
    .right
      left: 2.8rem
      transform-origin: .2rem .2rem
      transform: rotateZ(-90deg)
      animation: right var(--duration) ease infinite
    .middle
      width: 3.2rem
      height: 1.2rem
      border: .4rem solid $color-light-green
      border-top: 0
      border-radius: 0 0 .9rem .9rem
      transform: translateY(.2rem)
  ul
    margin: 0
    padding: 0
    list-style: none
    position: absolute
    left: 50%
    top: 0
    li
      height: .4rem
      border-radius: .2rem
      transform-origin: 100% .2rem
      width: 4.8rem
      right: 0
      top: -1rem
      position: absolute
      background: $color-light-green
      transform: rotateZ(0deg) translateX(-1.8rem)

@keyframes left
  4%
    transform: rotateZ(90deg)
  10%, 40%
    transform: rotateZ(0deg)
  46%, 54%
    transform: rotateZ(90deg)
  60%, 90%
    transform: rotateZ(0deg)
  96%
    transform: rotateZ(90deg)

@keyframes right
  4%
    transform: rotateZ(-90deg)
  10%, 40%
    transform: rotateZ(0deg)
  46%, 54%
    transform: rotateZ(-90deg)
  60%, 90%
    transform: rotateZ(0deg)
  96%
    transform: rotateZ(-90deg)

@keyframes book
  4%
    transform: rotateZ(-90deg)
  10%, 40%
    transform: rotateZ(0deg)
    transform-origin: .2rem .2rem
  40.01%, 59.99%
    transform-origin: 3rem .2rem
  46%, 54%
    transform: rotateZ(90deg)
  60%, 90%
    transform: rotateZ(0deg)
    transform-origin: .2rem .2rem
  96%
    transform: rotateZ(-90deg)
</style>