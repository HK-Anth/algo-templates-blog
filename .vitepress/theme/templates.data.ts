// .vitepress/theme/templates.data.ts
// 构建时扫描 templates/ 下所有 Markdown 的 frontmatter，生成结构化数据。
// 首页分类卡片与「模板总览」页面都消费这份数据，新增模板后无需改动任何配置。
import { createContentLoader } from 'vitepress'

export interface TemplateItem {
  title: string
  url: string
  description: string
  category: string
  tags: string[]
  languages: string[]
}

declare const data: TemplateItem[]
export { data }

export default createContentLoader('templates/**/*.md', {
  transform(raw): TemplateItem[] {
    return raw
      // 排除分类目录的 index.md（url 以 / 结尾）
      .filter((page) => !page.url.endsWith('/'))
      .map(({ url, frontmatter }) => ({
        title: frontmatter.title ?? url,
        url,
        description: frontmatter.description ?? '',
        category: frontmatter.category ?? 'other',
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        languages: Array.isArray(frontmatter.languages) ? frontmatter.languages : []
      }))
      .sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title, 'zh-Hans-CN'))
  }
})
