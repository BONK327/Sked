<template>
  <header class="top">
    <h2 class="top__title">{{ title }}</h2>
  </header>
</template>

<script>
export default {
  name: 'Header',
  props: {
    title: {
      type: String,
      required: true
    }
  }
}
</script>

<style lang="sass" scoped>
.top
  margin-bottom: 2rem
  &__title
    font-size: 1.6rem
    font-weight: 600
    letter-spacing: -2%
    line-height: 1.9rem
    text-align: center
</style>