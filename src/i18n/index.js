import Vue from 'vue'
import VueI18n from 'vue-i18n'
import ElementUI from 'element-ui'
import Cookies from 'js-cookie'
// 引入 Element UI 自带的语言包
import enLocale from 'element-ui/lib/locale/lang/en'
import zhLocale from 'element-ui/lib/locale/lang/zh-CN'
import zh from './lang/zh/index'
import en from './lang/en/index'

Vue.use(VueI18n)

// 合并 Element 语言包和自定义业务文案
const messages = {
  en: {
    ...en,
    ...enLocale // 关键：合并 Element 的英文配置
  },
  zh: {
    ...zh,
    ...zhLocale // 关键：合并 Element 的中文配置
  }
}

const i18n = new VueI18n({
  locale: Cookies.get('language') || 'zh', // 默认语言
  fallbackLocale: 'zh',
  messages
})

// 关键：让 Element UI 跟随 Vue I18n 的语言切换
Vue.use(ElementUI, {
  i18n: (key, value) => i18n.t(key, value) // 将 Element 的翻译交给 Vue I18n 处理
})

export default i18n
