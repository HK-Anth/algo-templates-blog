---
title: 树状数组（Fenwick Tree / BIT）
description: 单点修改 + 区间查询、区间修改 + 单点查询、以及 O(n) 建树与二分查找的树状数组模板。
category: data-structure
tags:
  - 树状数组
  - BIT
  - 前缀和
  - 差分
  - 区间查询
languages:
  - cpp
  - python
---

# 树状数组（Fenwick Tree / BIT）

树状数组用 $O(n)$ 的空间维护前缀信息，单点修改与前缀查询均为 $O(\log n)$，常数远小于线段树，是竞赛中最常用的数据结构之一。

## 核心思想

节点 $i$ 维护区间 $(i - \text{lowbit}(i),\ i]$ 的信息，其中 $\text{lowbit}(i) = i \mathbin{\&} (-i)$：

- 修改 `x` 时，向上跳到 `x += lowbit(x)`；
- 查询前缀 `[1, x]` 时，向下跳到 `x -= lowbit(x)`。

$$ \text{query}(x) = \sum_{i \le x} a_i, \qquad \text{update}(i, v):\ a_i \mathrel{+}= v $$

## 模板代码（单点修改 + 区间查询）

::: code-group

```cpp [fenwick.cpp]
#include <bits/stdc++.h>
using namespace std;

template <class T>
struct Fenwick {
    int n;
    vector<T> c;

    Fenwick() = default;
    explicit Fenwick(int n) : n(n), c(n + 1, T{}) {}

    // O(n) 建树：先原样填 c，再从下往上把值累加到父节点
    void build(const vector<T>& a) {   // a 下标从 1 开始，长度 n + 1
        n = (int)a.size() - 1;
        c.assign(a.begin(), a.end());
        for (int i = 1; i <= n; ++i) {
            int p = i + (i & -i);
            if (p <= n) c[p] += c[i];
        }
    }

    void add(int i, T v) {              // a[i] += v
        for (; i <= n; i += i & -i) c[i] += v;
    }

    T sum(int i) const {                // 前缀和 [1, i]
        T s{};
        for (; i > 0; i -= i & -i) s += c[i];
        return s;
    }

    T rangeSum(int l, int r) const {    // 区间和 [l, r]
        return sum(r) - sum(l - 1);
    }

    // 找到最小的 i 使前缀和 >= k（要求所有值非负），不存在返回 n + 1
    int lowerBound(T k) const {
        int pos = 0;
        T cur{};
        for (int pw = 1 << (31 - __builtin_clz(n | 1)); pw; pw >>= 1) {
            if (pos + pw <= n && cur + c[pos + pw] < k) {
                pos += pw;
                cur += c[pos];
            }
        }
        return pos + 1;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, q;
    cin >> n >> q;
    vector<long long> a(n + 1);
    for (int i = 1; i <= n; ++i) cin >> a[i];

    Fenwick<long long> bit(n);
    bit.build(a);

    while (q--) {
        int op, x, y;
        cin >> op >> x >> y;
        if (op == 1) bit.add(x, y);                       // 单点加
        else cout << bit.rangeSum(x, y) << '\n';          // 区间和
    }
    return 0;
}
```

```python [fenwick.py]
import sys


class Fenwick:
    """树状数组：单点修改 + 前缀/区间查询。"""

    __slots__ = ("n", "c")

    def __init__(self, n: int) -> None:
        self.n = n
        self.c = [0] * (n + 1)

    @classmethod
    def from_array(cls, a: list[int]) -> "Fenwick":
        """O(n) 建树，a 下标从 1 开始。"""
        bit = cls(len(a) - 1)
        bit.c = list(a)
        for i in range(1, bit.n + 1):
            p = i + (i & -i)
            if p <= bit.n:
                bit.c[p] += bit.c[i]
        return bit

    def add(self, i: int, v: int) -> None:
        """a[i] += v"""
        n, c = self.n, self.c
        while i <= n:
            c[i] += v
            i += i & -i

    def sum(self, i: int) -> int:
        """前缀和 [1, i]"""
        s, c = 0, self.c
        while i > 0:
            s += c[i]
            i -= i & -i
        return s

    def range_sum(self, l: int, r: int) -> int:
        """区间和 [l, r]"""
        return self.sum(r) - self.sum(l - 1)

    def lower_bound(self, k: int) -> int:
        """最小的 i 使前缀和 >= k（所有值非负），不存在返回 n + 1。"""
        pos, cur = 0, 0
        pw = 1 << (self.n.bit_length() - 1) if self.n else 0
        while pw:
            nxt = pos + pw
            if nxt <= self.n and cur + self.c[nxt] < k:
                pos = nxt
                cur += self.c[nxt]
            pw >>= 1
        return pos + 1


def main() -> None:
    data = sys.stdin.buffer.read().split()
    it = iter(data)
    n = int(next(it))
    q = int(next(it))
    a = [0] * (n + 1)
    for i in range(1, n + 1):
        a[i] = int(next(it))

    bit = Fenwick.from_array(a)
    out: list[str] = []
    for _ in range(q):
        op = int(next(it))
        x = int(next(it))
        y = int(next(it))
        if op == 1:
            bit.add(x, y)
        else:
            out.append(str(bit.range_sum(x, y)))
    sys.stdout.write("\n".join(out))


if __name__ == "__main__":
    main()
```

:::

## 变体一：区间修改 + 单点查询

对原数组 $a$ 做差分 $d_i = a_i - a_{i-1}$，用树状数组维护 $d$：

- 区间加 $[l, r]$ 加上 $v$ → `add(l, v); add(r + 1, -v)`；
- 单点查询 $a_x$ → `sum(x)`。

::: code-group

```cpp [fenwick_range_add.cpp]
template <class T>
struct RangeAddPointQuery {
    int n; vector<T> c;
    explicit RangeAddPointQuery(int n) : n(n), c(n + 2, T{}) {}
    void add(int i, T v) { for (; i <= n; i += i & -i) c[i] += v; }
    T query(int i) const { T s{}; for (; i > 0; i -= i & -i) s += c[i]; return s; }
    void rangeAdd(int l, int r, T v) { add(l, v); add(r + 1, -v); }
};
```

```python [fenwick_range_add.py]
class RangeAddPointQuery:
    """区间加、单点查（基于差分）。"""

    def __init__(self, n: int) -> None:
        self.n = n
        self.c = [0] * (n + 2)

    def _add(self, i: int, v: int) -> None:
        while i <= self.n:
            self.c[i] += v
            i += i & -i

    def query(self, i: int) -> int:
        s = 0
        while i > 0:
            s += self.c[i]
            i -= i & -i
        return s

    def range_add(self, l: int, r: int, v: int) -> None:
        self._add(l, v)
        self._add(r + 1, -v)
```

:::

## 变体二：区间修改 + 区间查询

维护两个树状数组 $B_1, B_2$，区间和公式：

$$ \sum_{i=1}^{x} a_i = (x+1)\sum_{i=1}^{x} d_i - \sum_{i=1}^{x} i \cdot d_i $$

## 常见应用

- 动态前缀和 / 区间和，且修改与查询交替出现；
- 逆序对计数（配合离散化，从右往左扫）；
- 树状数组上二分（`lowerBound`），求第 $k$ 小、找第一个满足前缀条件的下标；
- 二维树状数组处理二维前缀和。

## 练习题

| 题目 | 难度 | 考点 |
| --- | --- | --- |
| [洛谷 P3374 【模板】树状数组 1](https://www.luogu.com.cn/problem/P3374) | 普及/提高− | 单点改 + 区间查 |
| [洛谷 P3368 【模板】树状数组 2](https://www.luogu.com.cn/problem/P3368) | 普及/提高− | 区间改 + 单点查 |
| [洛谷 P1908 逆序对](https://www.luogu.com.cn/problem/P1908) | 普及/提高− | 离散化 + BIT |
| [洛谷 P1972 [SDOI2009] HH 的项链](https://www.luogu.com.cn/problem/P1972) | 提高+/省选− | 离线 + BIT |
