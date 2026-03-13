import Vue from 'vue'
import VueI18n from 'vue-i18n'
import Cookies from 'js-cookie'
import zh from './lang/zh'
import en from './lang/en'

Vue.use(VueI18n)

const messages = {
  zh,
  en
}

const i18n = new VueI18n({
  locale: Cookies.get('language') || 'zh',
  messages
})

export default i18n
