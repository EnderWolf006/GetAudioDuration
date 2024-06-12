import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import {i18n} from './locales/i18n.js'
import 'element-plus/theme-chalk/dark/css-vars.css'
createApp(App).use(ElementPlus).use(i18n).mount('#app') // 注入国际化函数$t

