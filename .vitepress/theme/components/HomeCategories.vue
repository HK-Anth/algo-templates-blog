<script setup lang="ts">
// 首页「模板分类入口」组件：数据来自构建时扫描 templates/ 的 frontmatter。
import { computed } from 'vue'
import { data as templates } from '../templates.data'

interface CategoryMeta {
  key: string
  name: string
  badge: string
  desc: string
}

const CATEGORIES: CategoryMeta[] = [
  { key: 'data-structure', name: '数据结构', badge: 'DS', desc: '并查集、树状数组、线段树、ST 表' },
  { key: 'graph', name: '图论', badge: 'GR', desc: '最短路、拓扑排序、强连通分量、LCA' },
  { key: 'dp', name: '动态规划', badge: 'DP', desc: '背包问题、最长上升子序列、数位 DP' },
  { key: 'string', name: '字符串', badge: 'ST', desc: 'KMP、Z 函数、字符串哈希' },
  { key: 'math', name: '数学', badge: 'MA', desc: '线性筛素数、扩展欧几里得、快速幂' }
]

const groups = computed(() =>
  CATEGORIES.map((c) => {
    const items = templates.filter((t) => t.category === c.key)
    return { ...c, count: items.length, items }
  })
)

const total = computed(() => templates.length)
</script>

<template>
  <section class="home-cats">
    <div class="home-cats__head">
      <h2 class="home-cats__title">模板分类</h2>
      <p class="home-cats__sub">
        共收录 <strong>{{ total }}</strong> 个模板，按分类归档；每个模板同时提供
        <code>cpp</code> 与 <code>python</code> 实现，可在代码块标签间切换。
      </p>
    </div>

    <div class="home-cats__grid">
      <div v-for="g in groups" :key="g.key" class="cat-card">
        <a class="cat-card__head" :href="g.key ? `/templates/${g.key}/` : '/templates/'">
          <span class="cat-card__badge">{{ g.badge }}</span>
          <span class="cat-card__name">{{ g.name }}</span>
          <span class="cat-card__count">{{ g.count }}</span>
        </a>
        <p class="cat-card__desc">{{ g.desc }}</p>
        <ul class="cat-card__list">
          <li v-for="item in g.items" :key="item.url">
            <a :href="item.url">{{ item.title }}</a>
          </li>
          <li v-if="g.items.length === 0" class="cat-card__empty">暂无模板</li>
        </ul>
      </div>
    </div>

    <p class="home-cats__more">
      <a href="/templates/">浏览全部模板 &rarr;</a>
    </p>
  </section>
</template>

<style scoped>
.home-cats {
  max-width: 1152px;
  margin: 0 auto;
  padding: 0 24px;
}

.home-cats__head {
  text-align: center;
  margin-bottom: 32px;
}

.home-cats__title {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.3;
  border: none;
  padding: 0;
  margin: 0 0 12px;
  color: var(--vp-c-text-1);
}

.home-cats__sub {
  font-size: 15px;
  line-height: 1.7;
  color: var(--vp-c-text-2);
  margin: 0;
}

.home-cats__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.cat-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background-color: var(--vp-c-bg-soft);
  padding: 18px 18px 14px;
  transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
}

.cat-card:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.07);
  transform: translateY(-2px);
}

.cat-card__head {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none !important;
}

.cat-card__badge {
  flex: none;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background-color: var(--vp-c-brand-1);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cat-card__name {
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.cat-card__count {
  margin-left: auto;
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  background-color: var(--vp-c-brand-soft);
  border-radius: 999px;
  padding: 2px 10px;
}

.cat-card__desc {
  font-size: 13px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  margin: 12px 0 10px;
}

.cat-card__list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px dashed var(--vp-c-divider);
  padding-top: 10px;
}

.cat-card__list li {
  margin: 0;
  padding: 3px 0;
  font-size: 13px;
  line-height: 1.6;
}

.cat-card__list a {
  color: var(--vp-c-text-1);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: color 0.2s, border-color 0.2s;
}

.cat-card__list a:hover {
  color: var(--vp-c-brand-1);
  border-bottom-color: var(--vp-c-brand-1);
}

.cat-card__empty {
  color: var(--vp-c-text-3);
  font-style: italic;
}

.home-cats__more {
  text-align: center;
  margin-top: 28px;
  font-size: 15px;
}

.home-cats__more a {
  font-weight: 600;
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.home-cats__more a:hover {
  text-decoration: underline;
}
</style>
