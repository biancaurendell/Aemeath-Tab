import './styles/index.scss'

import { ElIcon } from 'element-plus'
import { createApp } from 'vue'

import App from './App.vue'

createApp(App).component('ElIcon', ElIcon).mount('#app')
