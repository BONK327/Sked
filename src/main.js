import { createApp } from 'vue'
import App from './App.vue'
import store from './store'

const app = createApp(App)

// Добавляем Telegram WebApp в глобальные свойства
app.config.globalProperties.$tg = window.Telegram?.WebApp

// Функция применения Telegram темы
const applyTelegramTheme = () => {
  const tg = window.Telegram?.WebApp
  if (!tg) return

  const theme = tg.themeParams || {}
  const root = document.documentElement

  // Устанавливаем CSS-переменные с fallback значениями
  root.style.setProperty('--tg-bg-color', theme.bg_color || '#ffffff')
  root.style.setProperty('--tg-text-color', theme.text_color || '#000000')
  root.style.setProperty('--tg-button-color', theme.button_color || '#2481cc')
  root.style.setProperty('--tg-button-text-color', theme.button_text_color || '#ffffff')
  
  // Добавляем класс для тёмной темы
  if (tg.colorScheme === 'dark') {
    document.body.classList.add('tg-dark')
  } else {
    document.body.classList.remove('tg-dark')
  }
}

// Применяем тему при загрузке
applyTelegramTheme()

// Слушаем изменения темы
window.Telegram?.WebApp?.onEvent('themeChanged', applyTelegramTheme)

app.use(store)
app.mount('#app')