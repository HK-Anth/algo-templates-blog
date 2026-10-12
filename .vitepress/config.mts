import { defineConfig } from 'vitepress'

/**
 * 站点根路径。
 * 部署到 GitHub Pages 项目页（https://<user>.github.io/<repo>/）时必须是 "/<repo>/"，
 * 否则静态资源会 404。这里从环境变量 DOCS_BASE 读取（CI 中由 workflow 注入），
 * 本地开发与 Vercel 部署时保持 "/"。
 *
 * 也可以直接写死：const base = '/algo-templates-blog/'
 */
const base = process.env.DOCS_BASE || '/'

export default defineConfig({
  /* ---------------- 站点基础信息 ---------------- */
  lang: 'zh-CN',
  title: 'Algo Templates',
  description: '个人算法竞赛模板博客 —— C++ / Python 双语言模板库，支持全文搜索、代码标签切换与一键复制',

  base,

  /* ---------------- 构建行为 ---------------- */
  cleanUrls: true,        // 生成 /templates/data-structure/dsu 而不是 dsu.html
  lastUpdated: true,      // 基于 git 提交时间显示“最后更新于”
  ignoreDeadLinks: false, // 严格校验内链，避免出现死链

  head: [
    /**
     * ⚠️ head 里的资源路径 VitePress **不会**自动补 base（与 themeConfig.logo 不同），
     * 必须自己拼上，否则部署到子路径后 favicon 会 404。
     */
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}favicon.svg` }],
    ['meta', { name: 'theme-color', content: '#3451b2' }],
    ['meta', { name: 'author', content: 'Algo Templates' }],
    ['meta', {
      name: 'keywords',
      content: '算法竞赛,ACM,OI,模板,并查集,线段树,最短路,动态规划,KMP,C++,Python'
    }]
  ],

  /* ---------------- Markdown 渲染 ---------------- */
  markdown: {
    lineNumbers: true,
    theme: { light: 'github-light', dark: 'github-dark' },
    /**
     * 数学公式：使用 VitePress 内置的 math 选项。
     * 它会自动加载 markdown-it-mathjax3，并把 mjx-* 注册为自定义元素，
     * 因此公式在**构建期**就渲染进静态 HTML，不需要等浏览器执行 JS。
     * 用法：行内 $O(\alpha(n))$，块级 $$ ... $$。
     */
    math: true
  },

  /* ---------------- 主题配置 ---------------- */
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Algo Templates',

    nav: [
      { text: '首页', link: '/' },
      { text: '模板总览', link: '/templates/' },
      {
        text: '分类',
        items: [
          { text: '数据结构', link: '/templates/data-structure/' },
          { text: '图论', link: '/templates/graph/' },
          { text: '动态规划', link: '/templates/dp/' },
          { text: '字符串', link: '/templates/string/' },
          { text: '数学', link: '/templates/math/' }
        ]
      },
      { text: '使用说明', link: '/guide' },
      { text: 'GitHub', link: 'https://github.com/HK-Anth/algo-templates-blog' }
    ],

    /* 侧边栏按 templates/ 下的分类目录分组 */
    sidebar: {
      '/templates/': [
        {
          text: '模板总览',
          collapsed: false,
          items: [{ text: '全部模板', link: '/templates/' }]
        },
        {
          text: '数据结构',
          collapsed: false,
          items: [
            { text: '并查集 DSU', link: '/templates/data-structure/dsu' },
            { text: '树状数组 Fenwick', link: '/templates/data-structure/fenwick' },
            { text: '线段树 Segment Tree', link: '/templates/data-structure/segment-tree' },
            { text: 'ST 表 Sparse Table', link: '/templates/data-structure/sparse-table' }
          ]
        },
        {
          text: '图论',
          collapsed: false,
          items: [
            { text: '堆优化 Dijkstra', link: '/templates/graph/dijkstra' },
            { text: '拓扑排序', link: '/templates/graph/topological-sort' },
            { text: 'Tarjan 强连通分量', link: '/templates/graph/tarjan-scc' },
            { text: '倍增求 LCA', link: '/templates/graph/lca' }
          ]
        },
        {
          text: '动态规划',
          collapsed: false,
          items: [
            { text: '背包问题', link: '/templates/dp/knapsack' },
            { text: '最长上升子序列 LIS', link: '/templates/dp/lis' },
            { text: '数位 DP', link: '/templates/dp/digit-dp' }
          ]
        },
        {
          text: '字符串',
          collapsed: false,
          items: [
            { text: 'KMP 字符串匹配', link: '/templates/string/kmp' },
            { text: 'Z 函数（扩展 KMP）', link: '/templates/string/z-function' },
            { text: '字符串哈希', link: '/templates/string/string-hash' }
          ]
        },
        {
          text: '数学',
          collapsed: false,
          items: [
            { text: '线性筛素数', link: '/templates/math/sieve' },
            { text: '扩展欧几里得 exgcd', link: '/templates/math/exgcd' },
            { text: '快速幂', link: '/templates/math/fast-power' }
          ]
        }
      ],
      '/guide': [
        {
          text: '使用说明',
          items: [
            { text: '站点功能与维护方式', link: '/guide' }
          ]
        }
      ]
    },

    /* VitePress 内置本地全文搜索（纯静态、无需服务端） */
    search: {
      provider: 'local',
      options: {
        // 中文按 2-gram 切分，解决默认分词对中文检索不友好的问题
        miniSearch: {
          options: {
            tokenize: (text: string) => {
              const words = text.split(/[\s\-_/,.:;!?()[\]{}'"<>|\\+=*&^%$#@~`]+/).filter(Boolean)
              const tokens: string[] = []
              for (const w of words) {
                if (/[\u4e00-\u9fa5]/.test(w)) {
                  for (let i = 0; i < w.length; i++) {
                    tokens.push(w[i])
                    if (i + 1 < w.length) tokens.push(w.slice(i, i + 2))
                  }
                } else {
                  tokens.push(w)
                }
              }
              return tokens
            }
          },
          searchOptions: {
            fuzzy: 0.2,
            prefix: true,
            boost: { title: 4, text: 2, titles: 1 }
          }
        },
        translations: {
          button: { buttonText: '搜索模板', buttonAriaLabel: '搜索模板' },
          modal: {
            displayDetails: '显示详情',
            resetButtonTitle: '清除查询条件',
            backButtonTitle: '返回',
            noResultsText: '没有找到相关模板',
            footer: {
              selectText: '选择',
              selectKeyAriaLabel: '回车',
              navigateText: '切换',
              navigateUpKeyAriaLabel: '上箭头',
              navigateDownKeyAriaLabel: '下箭头',
              closeText: '关闭',
              closeKeyAriaLabel: 'Esc'
            }
          }
        }
      }
    },

    /* 其余界面文案 */
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    lastUpdated: {
      text: '最后更新于',
      formatOptions: { dateStyle: 'short', timeStyle: 'short' }
    },
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    sidebarMenuLabel: '目录',
    returnToTopLabel: '回到顶部',
    externalLinkIcon: true,

    footer: {
      message: '仅供学习与交流使用 · 模板代码请自行验证后提交',
      copyright: 'Copyright © 2026 Algo Templates'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/HK-Anth/algo-templates-blog' }
    ]

    // 注意：纯静态站点，不配置 editLink / lastUpdated 之外的后台入口，
    // 访客只能浏览、搜索、切换代码标签与复制，无法在线编辑或投稿。
  }
})
