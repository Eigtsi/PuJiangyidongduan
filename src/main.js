import { createApp } from 'vue'
import { createPinia } from 'pinia'
import {
  Calendar,
  ConfigProvider,
  Empty,
  Icon,
  Loading,
  Overlay,
  Picker,
  Popup,
  Search,
  Step,
  Steps,
  Tab,
  Tabs,
  Tabbar,
  TabbarItem,
} from 'vant'
import { setRemUnit } from '@/utils/rem'
import { setupMock } from '@/mock'
import router from '@/router'
import App from '@/App.vue'
import 'vant/lib/index.css'
import '@/styles/index.css'

// 750 设计稿适配：1rem = viewport width / 7.5
setRemUnit()
window.addEventListener('resize', setRemUnit)

if (import.meta.env.VITE_MOCK_ENABLED === 'true') {
  setupMock()
}

const app = createApp(App)
app.use(createPinia())
app.use(router)

// Vant 组件统一注册，避免模板中的 van-* 标签被当作未解析的自定义元素。
const vantComponents = [
  Calendar,
  ConfigProvider,
  Empty,
  Icon,
  Loading,
  Overlay,
  Picker,
  Popup,
  Search,
  Step,
  Steps,
  Tab,
  Tabs,
  Tabbar,
  TabbarItem,
]
vantComponents.forEach((component) => app.use(component))

app.mount('#app')
