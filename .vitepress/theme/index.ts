// .vitepress/theme/index.ts
// 自定义主题：继承 VitePress 默认主题（自带暗色模式、代码复制按钮、代码组标签切换），
// 仅补充首页分类卡片组件与少量样式，不引入任何后端或在线编辑能力。
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import HomeCategories from './components/HomeCategories.vue'
import TemplateList from './components/TemplateList.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 注册为全局组件，可直接在任意 Markdown 中使用
    app.component('HomeCategories', HomeCategories)
    app.component('TemplateList', TemplateList)
  }
} satisfies Theme
