---
title: 使用说明
description: 站点功能说明、模板文件规范、以及本地开发与新增模板的方法。
---

# 使用说明

这是一个**纯静态**的个人算法竞赛模板博客。所有内容由 Markdown 维护，构建后输出静态文件，可直接托管在任意静态平台。

## 站点功能

| 功能 | 说明 | 使用方式 |
| --- | --- | --- |
| 全文搜索 | VitePress 内置 local search，构建时生成索引 | 点击顶部导航栏的「搜索模板」，或按 <kbd>Ctrl</kbd> / <kbd>⌘</kbd> + <kbd>K</kbd> |
| 代码标签切换 | `::: code-group` 容器把多语言实现折叠成一组标签 | 点击代码块上方的 `union_find.cpp` / `union_find.py` 标签 |
| 代码复制 | 代码块右上角内置复制按钮 | 悬停代码块，点击右上角复制图标，复制内容不含行号 |
| 暗色模式 | 内置主题切换 | 点击右上角外观切换按钮，或跟随系统设置 |
| 数学公式 | MathJax3 渲染 | 行内写 `$O(n \log n)$`，块级用 `$$ ... $$` |
| 目录大纲 | 右侧本页目录 | 由二级、三级标题自动生成 |

::: info 关于访客权限
本站没有后台、没有在线编辑器、也不接受投稿。访客只能**浏览、搜索、切换代码标签、复制代码**。内容的更新完全依赖 Markdown 文件的修改与重新构建。
:::

## 新增一个模板

### 1. 在对应分类目录下新建 Markdown 文件

```bash
# 以新增「Manacher 算法」到字符串分类为例
touch templates/string/manacher.md
```

### 2. 写入 frontmatter

三个字段为**必填**：

```yaml
---
title: Manacher 算法
description: 线性求最长回文子串的 Manacher 模板。
category: string
tags:
  - Manacher
  - 回文串
  - 字符串
languages:
  - cpp
  - python
---
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `title` | string | 模板标题，显示在侧边栏与搜索结果中 |
| `tags` | string[] | 标签数组，用于检索与归档 |
| `languages` | string[] | 语言数组，取值 `cpp` / `python` |
| `description` | string | 可选，页面摘要，会进入搜索索引 |
| `category` | string | 可选，对应 `templates/` 下的目录名，首页分类卡片据此归组 |

### 3. 用 `::: code-group` 同时给出两种语言实现

````md
::: code-group

```cpp [manacher.cpp]
// C++ 实现
```

```python [manacher.py]
# Python 实现
```

:::
````

方括号里的内容会显示为标签文字，`cpp` / `python` 是语言标识，决定代码高亮规则。

### 4. 把新页面加入侧边栏

编辑 `.vitepress/config.mts` 中 `themeConfig.sidebar['/templates/']` 对应的分类分组，追加一行：

```ts
{ text: 'Manacher 算法', link: '/templates/string/manacher' }
```

### 5. 本地预览确认

```bash
npm run docs:dev
```

## 本地开发命令

```bash
npm install          # 安装依赖
npm run docs:dev     # 启动开发服务器，默认 http://localhost:5173
npm run docs:build   # 构建静态站点，输出到 .vitepress/dist
npm run docs:preview # 本地预览构建产物，默认 http://localhost:4173
```

## 目录结构

```text
algo-templates-blog/
├─ .github/workflows/deploy.yml   # GitHub Pages 自动部署
├─ .vitepress/
│  ├─ config.mts                  # 站点配置（导航 / 侧边栏 / 搜索 / Markdown）
│  └─ theme/
│     ├─ index.ts                 # 自定义主题入口
│     ├─ style.css                # 自定义样式
│     ├─ templates.data.ts        # 构建时扫描 frontmatter 的数据加载器
│     └─ components/
│        └─ HomeCategories.vue    # 首页模板分类入口
├─ public/                        # 原样拷贝的静态资源
│  ├─ favicon.svg
│  └─ logo.svg
├─ templates/                     # 所有算法模板（按分类建子目录）
│  ├─ index.md
│  ├─ data-structure/
│  ├─ graph/
│  ├─ dp/
│  ├─ string/
│  └─ math/
├─ guide.md
├─ index.md                       # 首页
├─ package.json
└─ vercel.json
```

## 写作约定

1. **下标从 1 开始**：模板代码统一使用 1-indexed 数组，便于与竞赛题目对齐。
2. **复杂度写在正文**：用表格或行内公式标注时间 / 空间复杂度。
3. **附练习题**：每篇模板末尾附 3–5 道练习题表格，标注难度与考点。
4. **代码可编译**：C++ 代码保证 `#include <bits/stdc++.h>` 可直接编译运行；Python 代码保证标准库可运行。
5. **不要提交大文件**：`big_input.txt` 之类的测试数据不要放进 `templates/`，避免拖慢构建。
