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

两者同时使用时，单次操作的均摊复杂度为 $O(\alpha(n))$，其中 $\alpha$ 是反阿克曼函数，在 $n < 2^{65536}$ 时 $\alpha(n) \le 4$，可视为常数。

| 操作 | 未优化 | 仅路径压缩 | 路径压缩 + 按秩合并 |
| --- | --- | --- | --- |
| `find` | $O(n)$ | $O(\log n)$ | $O(\alpha(n))$ |
| `unite` | $O(n)$ | $O(\log n)$ | $O(\alpha(n))$ |

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

- 元素编号默认从 `1` 开始（`DSU(n)` 会分配 `n + 1` 个槽位）。若下标从 `0` 开始，请使用 `DSU(n - 1)` 或自行调整 `init`。
- `count()` / `cnt` 维护当前连通块数量，常用于「加边过程中统计连通块」类问题。
- 如果只需要判断连通性而不关心集合大小，可以去掉 `sz` 数组，改用 `fa` 的负值表示集合大小（`fa[root] = -size`）。

## 变体：带权并查集

当需要维护「两元素之间的相对关系」时（如食物链、奇偶性、前缀和差值），把 `find` 改为返回带权信息：

::: code-group

```cpp [weighted_dsu.cpp]
struct WeightedDSU {
    vector<int> fa, w;   // w[x]: x 到 fa[x] 的权值
    explicit WeightedDSU(int n) : fa(n + 1), w(n + 1, 0) {
        iota(fa.begin(), fa.end(), 0);
    }
    // 返回根节点，并顺带把 x 的权值累加到根
    int find(int x) {
        if (fa[x] == x) return x;
        int root = find(fa[x]);
        w[x] += w[fa[x]];   // 先递归再累加，顺序不能反
        return fa[x] = root;
    }
    // 断言 val[x] - val[y] == d，返回是否与已有信息矛盾
    bool unite(int x, int y, int d) {
        int rx = find(x), ry = find(y);
        if (rx == ry) return w[x] - w[y] == d;
        fa[rx] = ry;
        w[rx] = w[y] + d - w[x];
        return true;
    }
};
```

```python [weighted_dsu.py]
import sys
sys.setrecursionlimit(1 << 20)


class WeightedDSU:
    """带权并查集：w[x] 表示 x 到 fa[x] 的权值。"""

    def __init__(self, n: int) -> None:
        self.fa = list(range(n + 1))
        self.w = [0] * (n + 1)

    def find(self, x: int) -> int:
        if self.fa[x] == x:
            return x
        root = self.find(self.fa[x])
        self.w[x] += self.w[self.fa[x]]   # 先递归再累加
        self.fa[x] = root
        return root

    def union(self, x: int, y: int, d: int) -> bool:
        """断言 val[x] - val[y] == d，返回是否与已有信息矛盾。"""
        rx, ry = self.find(x), self.find(y)
        if rx == ry:
            return self.w[x] - self.w[y] == d
        self.fa[rx] = ry
        self.w[rx] = self.w[y] + d - self.w[x]
        return True
```

:::

## 常见应用

- **连通性判定**：Kruskal 最小生成树中判断加边是否成环；
- **连通块计数**：并查集维护 `cnt`，离线回答动态加边问题；
- **集合合并类问题**：把「相同关系」的元素合并，最后按集合统计答案；
- **种类并查集**：开 $k$ 倍空间（`x`、`x + n`、`x + 2n`）表示 $k$ 种互斥状态。

## 练习题

| 题目 | 难度 | 考点 |
| --- | --- | --- |
| [洛谷 P3367 【模板】并查集](https://www.luogu.com.cn/problem/P3367) | 普及− | 基础模板 |
| [洛谷 P1551 亲戚](https://www.luogu.com.cn/problem/P1551) | 普及− | 连通性判定 |
| [洛谷 P2024 [NOI2001] 食物链](https://www.luogu.com.cn/problem/P2024) | 提高+/省选− | 种类并查集 |
| [洛谷 P1197 [JSOI2008] 星球大战](https://www.luogu.com.cn/problem/P1197) | 提高+/省选− | 离线倒序加边 |
| [Codeforces 1242B 0-1 MST](https://codeforces.com/problemset/problem/1242/B) | 1900 | 补图连通块 |
