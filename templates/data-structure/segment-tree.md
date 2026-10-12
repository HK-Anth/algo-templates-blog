---
title: 线段树（Segment Tree）
description: 带懒标记的区间修改、区间查询线段树模板，支持区间加、区间求和与区间最值。
category: data-structure
tags:
  - 线段树
  - 懒标记
  - lazy
  - 区间修改
  - 区间查询
languages:
  - cpp
  - python
---

# 线段树（Segment Tree）

线段树把区间递归二分成一棵二叉树，每个节点维护对应区间的信息，从而在 $O(\log n)$ 内完成区间修改与区间查询。

## 核心思想

对于节点区间 $[l, r]$，取 $mid = \lfloor (l+r)/2 \rfloor$，左右儿子分别维护 $[l, mid]$ 与 $[mid+1, r]$。

**懒标记（lazy tag）** 是区间修改的关键：当某个节点区间被完全覆盖时，直接打上标记而不继续下推，等真正需要访问子节点时再 `pushdown`。这样区间修改的复杂度也是 $O(\log n)$。

| 操作 | 复杂度 |
| --- | --- |
| 建树 | $O(n)$ |
| 单点 / 区间修改 | $O(\log n)$ |
| 区间查询 | $O(\log n)$ |
| 空间 | $O(4n)$ |

## 模板代码（区间加 + 区间求和）

::: code-group

```cpp [segment_tree.cpp]
#include <bits/stdc++.h>
using namespace std;
using ll = long long;

struct SegTree {
    int n;
    vector<ll> sum, add;   // sum: 区间和, add: 懒标记

    explicit SegTree(int n) : n(n), sum(4 * n + 4), add(4 * n + 4) {}

    void build(int p, int l, int r, const vector<ll>& a) {
        if (l == r) { sum[p] = a[l]; return; }
        int mid = (l + r) >> 1;
        build(p << 1, l, mid, a);
        build(p << 1 | 1, mid + 1, r, a);
        pull(p);
    }

    void pull(int p) { sum[p] = sum[p << 1] + sum[p << 1 | 1]; }

    void apply(int p, int l, int r, ll v) {   // 给节点 p 打上「区间加 v」标记
        sum[p] += v * (r - l + 1);
        add[p] += v;
    }

    void pushdown(int p, int l, int r) {
        if (add[p] == 0) return;
        int mid = (l + r) >> 1;
        apply(p << 1, l, mid, add[p]);
        apply(p << 1 | 1, mid + 1, r, add[p]);
        add[p] = 0;
    }

    void update(int p, int l, int r, int ql, int qr, ll v) {
        if (ql <= l && r <= qr) { apply(p, l, r, v); return; }
        pushdown(p, l, r);
        int mid = (l + r) >> 1;
        if (ql <= mid) update(p << 1, l, mid, ql, qr, v);
        if (qr > mid)  update(p << 1 | 1, mid + 1, r, ql, qr, v);
        pull(p);
    }

    ll query(int p, int l, int r, int ql, int qr) {
        if (ql <= l && r <= qr) return sum[p];
        pushdown(p, l, r);
        int mid = (l + r) >> 1;
        ll res = 0;
        if (ql <= mid) res += query(p << 1, l, mid, ql, qr);
        if (qr > mid)  res += query(p << 1 | 1, mid + 1, r, ql, qr);
        return res;
    }

    // 便捷接口（下标从 1 开始）
    void build(const vector<ll>& a) { build(1, 1, n, a); }
    void add_range(int l, int r, ll v) { update(1, 1, n, l, r, v); }
    ll query_range(int l, int r) { return query(1, 1, n, l, r); }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, q;
    cin >> n >> q;
    vector<ll> a(n + 1);
    for (int i = 1; i <= n; ++i) cin >> a[i];

    SegTree seg(n);
    seg.build(a);

    while (q--) {
        int op, l, r;
        cin >> op >> l >> r;
        if (op == 1) {
            ll v; cin >> v;
            seg.add_range(l, r, v);
        } else {
            cout << seg.query_range(l, r) << '\n';
        }
    }
    return 0;
}
```

```python [segment_tree.py]
import sys


class SegTree:
    """线段树：区间加 + 区间求和。下标从 1 开始。"""

    __slots__ = ("n", "sum", "add")

    def __init__(self, n: int) -> None:
        self.n = n
        self.sum = [0] * (4 * n + 4)
        self.add = [0] * (4 * n + 4)

    def build(self, a: list[int]) -> None:
        self._build(1, 1, self.n, a)

    def _build(self, p: int, l: int, r: int, a: list[int]) -> None:
        if l == r:
            self.sum[p] = a[l]
            return
        mid = (l + r) >> 1
        self._build(p << 1, l, mid, a)
        self._build(p << 1 | 1, mid + 1, r, a)
        self.sum[p] = self.sum[p << 1] + self.sum[p << 1 | 1]

    def _apply(self, p: int, l: int, r: int, v: int) -> None:
        self.sum[p] += v * (r - l + 1)
        self.add[p] += v

    def _pushdown(self, p: int, l: int, r: int) -> None:
        if self.add[p] == 0:
            return
        mid = (l + r) >> 1
        v = self.add[p]
        self._apply(p << 1, l, mid, v)
        self._apply(p << 1 | 1, mid + 1, r, v)
        self.add[p] = 0

    def update(self, ql: int, qr: int, v: int) -> None:
        self._update(1, 1, self.n, ql, qr, v)

    def _update(self, p: int, l: int, r: int, ql: int, qr: int, v: int) -> None:
        if ql <= l and r <= qr:
            self._apply(p, l, r, v)
            return
        self._pushdown(p, l, r)
        mid = (l + r) >> 1
        if ql <= mid:
            self._update(p << 1, l, mid, ql, qr, v)
        if qr > mid:
            self._update(p << 1 | 1, mid + 1, r, ql, qr, v)
        self.sum[p] = self.sum[p << 1] + self.sum[p << 1 | 1]

    def query(self, ql: int, qr: int) -> int:
        return self._query(1, 1, self.n, ql, qr)

    def _query(self, p: int, l: int, r: int, ql: int, qr: int) -> int:
        if ql <= l and r <= qr:
            return self.sum[p]
        self._pushdown(p, l, r)
        mid = (l + r) >> 1
        res = 0
        if ql <= mid:
            res += self._query(p << 1, l, mid, ql, qr)
        if qr > mid:
            res += self._query(p << 1 | 1, mid + 1, r, ql, qr)
        return res


def main() -> None:
    data = sys.stdin.buffer.read().split()
    it = iter(data)
    n = int(next(it))
    q = int(next(it))
    a = [0] * (n + 1)
    for i in range(1, n + 1):
        a[i] = int(next(it))

    seg = SegTree(n)
    seg.build(a)

    out: list[str] = []
    for _ in range(q):
        op = int(next(it))
        l = int(next(it))
        r = int(next(it))
        if op == 1:
            seg.update(l, r, int(next(it)))
        else:
            out.append(str(seg.query(l, r)))
    sys.stdout.write("\n".join(out))


if __name__ == "__main__":
    main()
```

:::

::: warning Python 性能提示
纯 Python 线段树在 $n, q \ge 2 \times 10^5$ 时通常无法通过。竞赛中请优先使用 C++ 版本，或用 PyPy 提交、或改用树状数组 / 差分数组等更轻量的结构。
:::

## 可扩展方向

1. **区间最值**：把 `sum` 换成 `mx`，`pull` 改为 `mx[p] = max(mx[2p], mx[2p+1])`，注意区间加的懒标记对最值同样生效（整体加 $v$ 则最值也加 $v$）。
2. **多标记叠加**：如「区间加 + 区间乘」，需要定义标记的复合顺序，`pushdown` 时先乘后加。
3. **权值线段树**：以下标为值域，维护每个值出现次数，用于求全局第 $k$ 小。
4. **动态开点 / 线段树合并**：处理值域巨大或需要合并多棵树的情形。

## 练习题

| 题目 | 难度 | 考点 |
| --- | --- | --- |
| [洛谷 P3372 【模板】线段树 1](https://www.luogu.com.cn/problem/P3372) | 普及/提高− | 区间加 + 区间和 |
| [洛谷 P3373 【模板】线段树 2](https://www.luogu.com.cn/problem/P3373) | 提高+/省选− | 加法与乘法双标记 |
| [洛谷 P6242 【模板】线段树 3](https://www.luogu.com.cn/problem/P6242) | 省选/NOI− | 区间历史最值 |
| [洛谷 P1908 逆序对](https://www.luogu.com.cn/problem/P1908) | 普及/提高− | 权值线段树 |
