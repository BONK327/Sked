<template>
  <section class="name">
    <h1 class="name__title">ПИ2303</h1>
    <strong class="name__slash">|</strong>
    <h2 class="name__week">Неделя 2</h2>
  </section>
</template>

<script>
export default {
  name: 'GroupInfo'
}
</script>

<style lang="sass" scoped>
.name
  display: flex
  gap: 0.5rem
  margin-bottom: 1.5rem
  align-items: center
  &__title,
  &__slash
    font-size: 2.4rem
    font-weight: 400
    letter-spacing: -0.05rem
  &__week
    font-size: 1.4rem
    font-weight: 400
    letter-spacing: -0.05rem
</style>