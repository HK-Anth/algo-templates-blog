# Algo Templates · 个人算法竞赛模板博客

基于 **VitePress 1.6.4**（1.x 最新稳定版）+ **Node.js 18+** 的**纯静态**算法竞赛模板博客。  
用 Markdown 维护模板，访客只能**浏览、全文搜索、切换代码标签、复制代码**——没有在线编辑，也没有投稿后台。

- 包管理：**npm**
- 站点语言：中文（`lang: 'zh-CN'`）
- 构建产物：纯静态文件，输出到 `.vitepress/dist`

---

## 1. 初始化命令

```bash
# ① 创建项目目录并进入
mkdir algo-templates-blog
	cd algo-templates-blog

# ② 初始化 npm 项目（生成 package.json）
npm init -y

# ③ 安装依赖（VitePress + 数学公式插件）
#    Node.js 需 18 或更高版本，node -v 可确认
npm install -D vitepress@^1.6.4 vue@^3.5.13 markdown-it-mathjax3@^4.3.2

# ④ 启动开发服务器（默认 http://localhost:5173）
npm run docs:dev
```

安装完成后，把本仓库的 `package.json` 中的 `scripts` 补上（若 `npm init -y` 未生成）：

```json
{
  "name": "algo-templates-blog",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "docs:dev": "vitepress dev",
    "docs:build": "vitepress build",
    "docs:preview": "vitepress preview"
  },
  "devDependencies": {
    "markdown-it-mathjax3": "^4.3.2",
    "vitepress": "^1.6.4",
    "vue": "^3.5.13"
  }
}
```

> `"type": "module"` 必须保留，否则 `.vitepress/config.mts` 中的 ESM 语法会报错。

### 常用命令

| 命令                     | 作用                                     |
| ---------------------- | -------------------------------------- |
| `npm install`          | 安装依赖                                   |
| `npm run docs:dev`     | 启动开发服务器，热更新，默认 `http://localhost:5173` |
| `npm run docs:build`   | 构建静态站点，输出到 `.vitepress/dist`           |
| `npm run docs:preview` | 本地预览构建产物，默认 `http://localhost:4173`    |

> **Windows 用户注意**：若 `npm run docs:build` 报错 `Cannot find module @rollup/rollup-win32-x64-msvc`  
> 或 `The package "@esbuild/win32-x64" could not be found`，这是 npm 可选依赖的已知问题，执行：
>
> ```bash
> npm install @rollup/rollup-win32-x64-msvc @esbuild/win32-x64 --no-save
> ```
>
> 或删除 `node_modules` 与 `package-lock.json` 后重新 `npm install`。

---

## 2. 完整目录结构

```text
algo-templates-blog/
├─ .github/
│  └─ workflows/
│     └─ deploy.yml                    # GitHub Pages 自动部署工作流
├─ .vitepress/
│  ├─ config.mts                       # ★ 站点配置：导航 / 侧边栏 / 搜索 / Markdown
│  ├─ dist/                            # 构建产物（git 忽略）
│  └─ theme/
│     ├─ index.ts                      # 自定义主题入口（继承默认主题）
│     ├─ style.css                     # 自定义样式（品牌色 / 代码块 / 代码组）
│     ├─ templates.data.ts             # 构建时扫描 frontmatter 的数据加载器
│     └─ components/
│        ├─ HomeCategories.vue         # 首页「模板分类入口」组件
│        └─ TemplateList.vue           # 模板总览 / 分类页列表组件
├─ public/                             # 原样拷贝到站点根目录的静态资源
│  ├─ favicon.svg
│  └─ logo.svg
├─ templates/                          # ★ 所有算法模板，按分类建子目录
│  ├─ index.md                         # 模板总览（自动汇总）
│  ├─ data-structure/                  # 数据结构
│  │  ├─ index.md
│  │  ├─ dsu.md                        #   并查集（完整示例）
│  │  ├─ fenwick.md                    #   树状数组
│  │  ├─ segment-tree.md               #   线段树
│  │  └─ sparse-table.md               #   ST 表
│  ├─ graph/                           # 图论
│  │  ├─ index.md
│  │  ├─ dijkstra.md                   #   堆优化 Dijkstra
│  │  ├─ topological-sort.md           #   拓扑排序
│  │  ├─ tarjan-scc.md                 #   Tarjan 强连通分量
│  │  └─ lca.md                        #   倍增求 LCA
│  ├─ dp/                              # 动态规划
│  │  ├─ index.md
│  │  ├─ knapsack.md                   #   背包问题
│  │  ├─ lis.md                        #   最长上升子序列
│  │  └─ digit-dp.md                   #   数位 DP
│  ├─ string/                          # 字符串
│  │  ├─ index.md
│  │  ├─ kmp.md                        #   KMP
│  │  ├─ z-function.md                 #   Z 函数
│  │  └─ string-hash.md                #   字符串哈希
│  └─ math/                            # 数学
│     ├─ index.md
│     ├─ sieve.md                      #   线性筛素数
│     ├─ exgcd.md                      #   扩展欧几里得
│     └─ fast-power.md                 #   快速幂 / 矩阵快速幂
├─ .gitignore
├─ guide.md                            # 使用说明页（/guide）
├─ index.md                            # 首页（/）
├─ package-lock.json
├─ package.json
├─ README.md                           # 本文件
└─ vercel.json                         # Vercel 部署配置
```

---

## 3. `.vitepress/config.mts`（完整配置）

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  /* ---------------- 站点基础信息 ---------------- */
  lang: 'zh-CN',
  title: 'Algo Templates',
  description: '个人算法竞赛模板博客 —— C++ / Python 双语言模板库，支持全文搜索、代码标签切换与一键复制',

  /**
   * 部署到 GitHub Pages 的项目页（https://<user>.github.io/<repo>/）时，base 必须是 "/<repo>/"，
   * 否则静态资源会 404。这里默认从环境变量 DOCS_BASE 读取（CI 中由 workflow 注入），
   * 本地开发与 Vercel 部署时保持 "/"。
   *
   * 也可以直接写死：base: '/algo-templates-blog/',
   */
  base: process.env.DOCS_BASE || '/',

  /* ---------------- 构建行为 ---------------- */
  cleanUrls: true,        // 生成 /templates/data-structure/dsu 而不是 dsu.html
  lastUpdated: true,      // 基于 git 提交时间显示"最后更新于"
  ignoreDeadLinks: false, // 严格校验内链，避免出现死链

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
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
      { text: 'GitHub', link: 'https://github.com/your-name/algo-templates-blog' }
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
          items: [{ text: '站点功能与维护方式', link: '/guide' }]
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
      { icon: 'github', link: 'https://github.com/your-name/algo-templates-blog' }
    ]

    // 注意：纯静态站点，不配置 editLink 等后台入口，
    // 访客只能浏览、搜索、切换代码标签与复制，无法在线编辑或投稿。
  }
})
```


### 功能对应关系

| 需求                    | 实现位置                                                |
| --------------------- | --------------------------------------------------- |
| C++ / Python 代码高亮     | `markdown.theme` 指定 `github-light` / `github-dark`  |
| 全文搜索（内置 local search） | `themeConfig.search.provider = 'local'`             |
| 暗色模式                  | 默认主题内置，`style.css` 中通过 `--vp-c-*` 变量适配              |
| 代码复制按钮                | 默认主题内置（`button.copy`），无需额外代码                        |
| 代码标签切换                | Markdown 中的 `::: code-group` 容器                     |
| 导航栏                   | `themeConfig.nav`                                   |
| 按分类分组的侧边栏             | `themeConfig.sidebar['/templates/']`                |
| 首页标题 / 简介 / 分类入口      | `index.md` 的 hero + features + `<HomeCategories />` |
| 数学公式                  | `markdown.math: true`（MathJax3）                     |

---

## 4. 完整示例模板：并查集

文件路径：`templates/data-structure/dsu.md`

````markdown
---
title: 并查集（Disjoint Set Union）
description: 支持路径压缩与按大小合并的并查集模板，含连通块计数、集合大小查询，C++ 与 Python 双实现。
category: data-structure
tags:
  - 并查集
  - DSU
  - 路径压缩
  - 按秩合并
  - 连通块
languages:
  - cpp
  - python
---

# 并查集（Disjoint Set Union）

并查集用于维护若干**不相交集合**的合并与查询，支持两个操作：

- `find(x)`：查询元素 $x$ 所在集合的代表元；
- `unite(a, b)`：把 $a$ 与 $b$ 所在的两个集合合并。

## 核心思想

用一棵树表示一个集合，根节点即代表元。两个优化把单次操作复杂度压到近似常数：

1. **路径压缩**：`find` 时把路径上所有点直接挂到根上，把树拍扁；
2. **按大小（按秩）合并**：把小的树挂到大的树下面，避免树高退化。

两者同时使用时，单次操作的均摊复杂度为 $O(\alpha(n))$。

## 模板代码

::: code-group

```cpp [union_find.cpp]
#include <bits/stdc++.h>
using namespace std;

struct DSU {
    vector<int> fa;   // fa[i]: i 的父节点
    vector<int> sz;   // sz[i]: 以 i 为根的集合大小（仅根节点有效）
    int cnt = 0;      // 当前连通块数量

    DSU() = default;
    explicit DSU(int n) { init(n); }

    void init(int n) {
        fa.resize(n + 1);
        sz.assign(n + 1, 1);
        iota(fa.begin(), fa.end(), 0);   // fa[i] = i
        cnt = n;
    }

    // 迭代版路径压缩：不递归，避免深链爆栈
    int find(int x) {
        while (fa[x] != x) {
            fa[x] = fa[fa[x]];   // 路径压缩（隔代压缩，等价效果）
            x = fa[x];
        }
        return x;
    }

    // 合并 a、b 所在集合；返回是否真的发生了合并
    bool unite(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return false;
        if (sz[ra] < sz[rb]) swap(ra, rb);  // 按大小合并：小树挂大树
        fa[rb] = ra;
        sz[ra] += sz[rb];
        --cnt;
        return true;
    }

    bool same(int a, int b) { return find(a) == find(b); }
    int  size(int x) { return sz[find(x)]; }
    int  count() const { return cnt; }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m;
    cin >> n >> m;          // n 个元素，m 次操作
    DSU dsu(n);

    while (m--) {
        int op, x, y;
        cin >> op >> x >> y;
        if (op == 1) {
            dsu.unite(x, y);                      // 合并 x, y
        } else {
            cout << (dsu.same(x, y) ? 'Y' : 'N') << '\n';  // 查询是否同集合
        }
    }
    return 0;
}
```

```python [union_find.py]
import sys


class DSU:
    """并查集：路径压缩 + 按大小合并。"""

    __slots__ = ("fa", "sz", "cnt")

    def __init__(self, n: int = 0) -> None:
        self.fa = list(range(n + 1))   # fa[i]: i 的父节点
        self.sz = [1] * (n + 1)        # sz[i]: 以 i 为根的集合大小
        self.cnt = n                   # 当前连通块数量

    def find(self, x: int) -> int:
        """迭代版路径压缩，避免递归深度超限。"""
        fa = self.fa
        root = x
        while fa[root] != root:        # 先找根
            root = fa[root]
        while fa[x] != root:           # 再把路径上的点直接挂到根
            fa[x], x = root, fa[x]
        return root

    def union(self, a: int, b: int) -> bool:
        """合并 a、b 所在集合；返回是否真的发生了合并。"""
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False
        if self.sz[ra] < self.sz[rb]:  # 按大小合并：小树挂大树
            ra, rb = rb, ra
        self.fa[rb] = ra
        self.sz[ra] += self.sz[rb]
        self.cnt -= 1
        return True

    def same(self, a: int, b: int) -> bool:
        return self.find(a) == self.find(b)

    def size(self, x: int) -> int:
        return self.sz[self.find(x)]


def main() -> None:
    data = sys.stdin.buffer.read().split()
    if not data:
        return
    it = iter(data)
    n = int(next(it))
    m = int(next(it))

    dsu = DSU(n)
    out: list[str] = []
    for _ in range(m):
        op = int(next(it))
        x = int(next(it))
        y = int(next(it))
        if op == 1:
            dsu.union(x, y)
        else:
            out.append("Y" if dsu.same(x, y) else "N")

    sys.stdout.write("\n".join(out) + ("\n" if out else ""))


if __name__ == "__main__":
    main()
```

:::

## 使用说明

- 元素编号默认从 `1` 开始（`DSU(n)` 会分配 `n + 1` 个槽位）。
- `count()` / `cnt` 维护当前连通块数量，常用于"加边过程中统计连通块"类问题。

## 练习题

| 题目 | 难度 | 考点 |
| --- | --- | --- |
| [洛谷 P3367 【模板】并查集](https://www.luogu.com.cn/problem/P3367) | 普及− | 基础模板 |
| [洛谷 P1551 亲戚](https://www.luogu.com.cn/problem/P1551) | 普及− | 连通性判定 |
| [洛谷 P2024 [NOI2001] 食物链](https://www.luogu.com.cn/problem/P2024) | 提高+/省选− | 种类并查集 |
````

### frontmatter 字段规范

| 字段            | 类型       | 必填 | 说明                               |
| ------------- | -------- | -- | -------------------------------- |
| `title`       | string   | ✅  | 模板标题，显示在侧边栏、列表与搜索结果中             |
| `tags`        | string[] | ✅  | 标签数组                             |
| `languages`   | string[] | ✅  | 语言数组，取值 `cpp` / `python`         |
| `description` | string   | 否  | 页面摘要，进入搜索索引                      |
| `category`    | string   | 否  | 对应 `templates/` 下的目录名，首页分类卡片据此归组 |

### `::: code-group` 语法要点

````markdown
::: code-group

```cpp [union_find.cpp]
// C++ 实现
```

```python [union_find.py]
# Python 实现
```

:::
````

- 方括号 `[union_find.cpp]` 中的内容显示为**标签文字**；
- 代码块的语言标识 `cpp` / `python` 决定**高亮规则**；
- 访客点击标签即可切换，右上角复制按钮复制的是当前**可见**代码块的完整内容。

---

## 5. 部署到 Vercel

Vercel 对 VitePress 有原生支持，仓库根目录已提供 `vercel.json`：

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run docs:build",
  "outputDirectory": ".vitepress/dist",
  "installCommand": "npm install",
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### 步骤

```bash
# ① 把项目推送到 GitHub
git init
git add .
git commit -m "init: vitepress algo templates blog"
git branch -M main
git remote add origin https://github.com/<your-name>/algo-templates-blog.git
git push -u origin main
```

```bash
# ② 安装 Vercel CLI 并登录（也可以直接在网页端 Import 仓库）
npm i -g vercel
vercel login
```

```bash
# ③ 在项目根目录部署
vercel            # 部署到预览环境
vercel --prod     # 部署到生产环境
```

**网页端方式**（推荐）：

1. 打开 <https://vercel.com/new>，用 GitHub 账号登录；
2. 选择 `algo-templates-blog` 仓库 → **Import**；
3. 确认配置（Vercel 会自动识别，与 `vercel.json` 一致）：
   - Framework Preset：`VitePress`
   - Build Command：`npm run docs:build`
   - Output Directory：`.vitepress/dist`
   - Install Command：`npm install`
4. 点击 **Deploy**，约 1 分钟后得到 `https://<project>.vercel.app`。

> **不要设置 `DOCS_BASE`**：Vercel 部署在域名根路径，`base` 必须保持 `'/'`。

### 自定义域名

Vercel 项目 → **Settings → Domains** → 添加域名，按提示在 DNS 服务商处配置 `CNAME` 记录即可。

---

## 6. 部署到 GitHub Pages

### 6.1 前置设置

1. 把项目推送到 GitHub 仓库（默认分支为 `main`）；
2. 进入仓库 **Settings → Pages**；
3. **Source** 选择 **GitHub Actions**（不要选 "Deploy from a branch"）。

### 6.2 工作流文件

文件路径：`.github/workflows/deploy.yml`

```yaml
name: Deploy VitePress site to Pages

on:
  # 推送到 main 分支时自动构建并部署
  push:
    branches: [main]
  # 允许在 Actions 页面手动触发
  workflow_dispatch:

# 授予 GITHUB_TOKEN 部署到 GitHub Pages 所需的权限
permissions:
  contents: read
  pages: write
  id-token: write

# 只允许一个并发部署，取消进行中的旧任务
concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          # lastUpdated 依赖 git 提交时间，必须拉取完整历史
          fetch-depth: 0

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Install dependencies
        # 注意：这里用 npm install 而不是 npm ci。
        # 原因：package-lock.json 是在 Windows 上生成的，只记录了 win32 平台的可选原生依赖
        # （@rollup/rollup-win32-x64-msvc、@esbuild/win32-x64）。npm ci 会严格按锁文件安装，
        # 在 Ubuntu 运行器上就会缺少 @rollup/rollup-linux-x64-gnu 与 @esbuild/linux-x64，
        # 导致构建报 "Cannot find module @rollup/rollup-linux-x64-gnu"。
        # npm install 会按当前平台补全原生包，跨平台最稳。
        run: npm install --no-audit --no-fund

      - name: Build with VitePress
        # 项目页部署在 https://<user>.github.io/<repo>/ 下，必须注入 base
        # 若使用自定义域名或用户主页（<user>.github.io），删除下面两行 env
        env:
          DOCS_BASE: /${{ github.event.repository.name }}/
        run: npm run docs:build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: .vitepress/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 6.3 部署与验证

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Pages deploy workflow"
git push origin main
```

推送后进入仓库 **Actions** 标签页，可见 `Deploy VitePress site to Pages` 工作流运行；  
`build` 与 `deploy` 两个 job 均变绿后，访问：

```text
https://<your-name>.github.io/algo-templates-blog/
```

### 6.4 关于 `base` 的说明

| 部署目标                                          | `base` 取值                   |
| --------------------------------------------- | --------------------------- |
| GitHub 项目页 `https://<user>.github.io/<repo>/` | `/<repo>/`（workflow 已自动注入）  |
| GitHub 用户主页 `https://<user>.github.io/`       | `/`（删除 workflow 中的 `env` 段） |
| 自定义域名（如 `https://algo.example.com/`）          | `/`（删除 workflow 中的 `env` 段） |
| Vercel / Netlify                              | `/`                         |

`base` 写错的典型症状：页面能打开但**样式全丢、图片 404**。

### 6.5 常见失败原因

| 报错 | 原因 | 处理 |
| --- | --- | --- |
| `Cannot find module @rollup/rollup-linux-x64-gnu` | CI 用了 `npm ci`，而锁文件是 Windows 生成的，缺 Linux 原生包 | 工作流已改用 `npm install`；若你手动改回 `npm ci`，请删掉 `package-lock.json` 后重新在 Linux/macOS 上生成 |
| `Get Pages site failed` / `Not Found` | 仓库 Settings → Pages 的 Source 未选 `GitHub Actions` | 到 Settings → Pages 把 Source 改为 `GitHub Actions` |
| 页面 404 但 Actions 是绿的 | `base` 与部署路径不匹配 | 项目页必须是 `/<repo>/`；用户主页与自定义域名用 `/` |
| 样式丢失、图片 404 | 同上，`base` 写错 | 检查 `DOCS_BASE` 注入值 |

---

## 7. 日常维护

新增一个模板只需三步：

```bash
# ① 新建 Markdown（frontmatter 必填 title / tags / languages）
touch templates/string/manacher.md

# ② 正文用 ::: code-group 同时给出 C++ 与 Python 实现

# ③ 把页面加入 .vitepress/config.mts 的 sidebar['/templates/'] 对应分组
```

```bash
# ④ 本地确认后提交
npm run docs:dev
git add .
git commit -m "docs: add Manacher template"
git push
```

首页分类卡片、模板总览页、分类页列表都由 `.vitepress/theme/templates.data.ts`  
在**构建时**扫描 frontmatter 自动生成，无需手工维护。

---

## 8. 技术要点备忘

1. **`markdown.math: true` 而不是 `markdown.config: md => md.use(mathjax3)`**  
   VitePress 只在启用内置 `math` 选项时，才会把 `mjx-*` 注册为 Vue 自定义元素。  
   若手动挂载插件，公式在 SSR 阶段会退化成空占位符 \`\`，必须等浏览器执行 JS 才显示。
2. **中文全文搜索需要自定义 `tokenize`**  
   MiniSearch 默认按空格分词，对中文几乎不可用。配置中按 **2-gram** 切分中文，  
   兼顾召回率与精度；英文与代码标识符仍按标点切分。
3. **代码复制按钮是内置能力**  
   由 `vitepress/dist/client/app/composables/copyCode.js` 提供，  
   代码块右上角渲染 `<button class="copy">`，复制内容自动剔除行号与 `.vp-copy-ignore` 元素。
4. **`cleanUrls: true`**  
   构建出 `templates/data-structure/dsu.html`，访问路径为 `/templates/data-structure/dsu`。  
   Vercel 与 GitHub Pages 都原生支持；若部署到不支持的服务（如部分对象存储），  
   可改为 `false` 或自行配置重写规则。
5. **`ignoreDeadLinks: false`**  
   构建时严格校验内链，侧边栏指向不存在的文件会直接构建失败——这对长期维护的模板库是好事。

---

## 9. 验证结果

本项目已在本机完成构建验证：

```text
$ npm run docs:build

  vitepress v1.6.4

- building client + server bundles...
✓ building client + server bundles...
- rendering pages...
✓ rendering pages...
build complete in 35.56s.
```

构建产物统计：

- 页面：首页 1 + 使用说明 1 + 模板总览 1 + 分类页 5 + 模板页 17 = **25 个 HTML 页面**
- 全文搜索索引：`assets/chunks/@localSearchIndexroot.*.js` 已生成
- 公式：`templates/data-structure/dsu.html` 中已 SSR 出 30 处 `mjx-container`
- 代码组标签：`union_find.cpp` / `union_find.py` 正常渲染
- 代码复制按钮：`<button title="Copy Code" class="copy">` 正常注入
