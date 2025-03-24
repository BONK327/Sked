<template>
  <Header title="Заметки"/>
  <div class="notes-container">
    <div
        v-for="note in notes"
        :key="note.id"
        class="note-card">
      <div class="note-header">
        <h3 class="note-title">{{ note.lesson }}</h3>
        <span class="note-time">{{ note.time }} • {{ note.date }}</span>
      </div>
      <textarea
          v-model="note.content"
          @input="updateNote(note)"
          class="note-content"
          placeholder="Добавьте свои заметки..."
      ></textarea>
    </div>
    <div v-if="!notes.length" class="empty-state">
      Нет сохраненных заметок
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Header from "@/components/header.vue"

export default {
  components: { Header },
  computed: {
    ...mapGetters(['getNotes']),
    notes() {
      return this.getNotes
    }
  },
  methods: {
    ...mapActions(['updateNote'])
  }
}
</script>

<style lang="sass" scoped>
.notes-container
  padding: 1rem

.note-card
  background: white
  border-radius: 8px
  padding: 1rem
  margin-bottom: 1rem
  box-shadow: 0 2px 8px rgba(0,0,0,0.1)

.note-header
  margin-bottom: 0.5rem

.note-title
  font-size: 1.1rem
  margin: 0

.note-time
  font-size: 0.9rem
  color: #666

.note-content
  width: 100%
  height: 100px
  padding: 0.5rem
  border: 1px solid #ddd
  border-radius: 4px
  resize: vertical

.empty-state
  text-align: center
  color: #666
  padding: 2rem
</style>