<script setup lang="ts">
// 模板总览 / 分类页列表组件：同样消费 templates.data.ts 的构建时数据。
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { data as templates } from '../templates.data'

const props = defineProps<{ category?: string }>()

const CATEGORY_NAMES: Record<string, string> = {
  'data-structure': '数据结构',
  graph: '图论',
  dp: '动态规划',
  string: '字符串',
  math: '数学',
  other: '其他'
}

const LANG_NAMES: Record<string, string> = {
  cpp: 'C++',
  python: 'Python',
  java: 'Java',
  go: 'Go'
}

const grouped = computed(() => {
  const list = props.category
    ? templates.filter((t) => t.category === props.category)
    : templates
  const map = new Map<string, typeof list>()
  for (const t of list) {
    if (!map.has(t.category)) map.set(t.category, [])
    map.get(t.category)!.push(t)
  }
  return [...map.entries()].map(([key, items]) => ({
    key,
    name: CATEGORY_NAMES[key] ?? key,
    items
  }))
})

const total = computed(() =>
  props.category ? templates.filter((t) => t.category === props.category).length : templates.length
)
</script>

<template>
  <div class="tpl-list">
    <p class="tpl-list__summary">
      共 <strong>{{ total }}</strong> 个模板<template v-if="props.category">（{{ CATEGORY_NAMES[props.category] ?? props.category }}）</template>
    </p>

    <section v-for="g in grouped" :key="g.key" class="tpl-group">
      <h2 :id="g.key" class="tpl-group__title">
        <a class="header-anchor" :href="`#${g.key}`" aria-hidden="true">#</a>
        {{ g.name }}
        <span class="tpl-group__count">{{ g.items.length }}</span>
      </h2>

      <div class="tpl-grid">
        <article v-for="item in g.items" :key="item.url" class="tpl-card">
          <h3 class="tpl-card__title">
            <a :href="withBase(item.url)">{{ item.title }}</a>
          </h3>
          <p v-if="item.description" class="tpl-card__desc">{{ item.description }}</p>
          <div class="tpl-card__meta">
            <span v-for="lang in item.languages" :key="lang" class="chip chip--lang">
              {{ LANG_NAMES[lang] ?? lang }}
            </span>
            <span v-for="tag in item.tags" :key="tag" class="chip">{{ tag }}</span>
          </div>
        </article>
      </div>
    </section>

    <p v-if="grouped.length === 0" class="tpl-list__empty">该分类下暂无模板。</p>
  </div>
</template>

<style scoped>
.tpl-list__summary {
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.tpl-group {
  margin-top: 32px;
}

.tpl-group__title {
  position: relative;
  font-size: 22px;
  font-weight: 700;
  border-top: none;
  padding-top: 0;
  margin: 0 0 16px;
  color: var(--vp-c-text-1);
}

.tpl-group__count {
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  background-color: var(--vp-c-brand-soft);
  border-radius: 999px;
  padding: 2px 9px;
  margin-left: 6px;
  vertical-align: middle;
}

.tpl-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}

.tpl-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background-color: var(--vp-c-bg-soft);
  padding: 16px;
  transition: border-color 0.25s, box-shadow 0.25s;
}

.tpl-card:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
}

.tpl-card__title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px;
  border: none;
  padding: 0;
  line-height: 1.4;
}

.tpl-card__title a {
  color: var(--vp-c-text-1);
  text-decoration: none;
}

.tpl-card__title a:hover {
  color: var(--vp-c-brand-1);
}

.tpl-card__desc {
  font-size: 13px;
  line-height: 1.65;
  color: var(--vp-c-text-2);
  margin: 0 0 12px;
}

.tpl-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  font-size: 11.5px;
  line-height: 1.6;
  padding: 1px 8px;
  border-radius: 999px;
  color: var(--vp-c-text-2);
  background-color: var(--vp-c-default-soft);
  border: 1px solid transparent;
}

.chip--lang {
  font-weight: 600;
  color: var(--vp-c-brand-1);
  background-color: var(--vp-c-brand-soft);
}

.tpl-list__empty {
  color: var(--vp-c-text-3);
  font-size: 14px;
}
</style>
