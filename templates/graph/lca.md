---
title: 倍增求 LCA（最近公共祖先）
description: 树上倍增法求最近公共祖先，含深度预处理、二进制跳跃与树上距离计算。
category: graph
tags:
  - LCA
  - 最近公共祖先
  - 倍增
  - 树
  - 树上距离
languages:
  - cpp
  - python
---

# 倍增求 LCA（最近公共祖先）

最近公共祖先（Lowest Common Ancestor）指树上两个节点 $u, v$ 的共同祖先中深度最大的那个。倍增法预处理 $O(n \log n)$，单次查询 $O(\log n)$，是竞赛中最通用的 LCA 写法。

## 核心思想

设 `up[k][u]` 表示 $u$ 的 $2^k$ 级祖先：

$$ up[0][u] = parent(u), \qquad up[k][u] = up[k-1]\bigl[\,up[k-1][u]\,\bigr] $$

求 $\text{LCA}(u, v)$ 分两步：

1. **对齐深度**：把较深的节点向上跳，使其与另一节点同深度。把深度差按二进制拆开，逐位跳。
2. **同时上跳**：从高位到低位尝试，若 `up[k][u] != up[k][v]` 则两者一起跳 $2^k$；循环结束后 $u, v$ 恰好是 LCA 的两个子节点，返回 `up[0][u]`。

树上两点距离：$\text{dist}(u, v) = \text{dep}_u + \text{dep}_v - 2\,\text{dep}_{\text{LCA}(u,v)}$。

| 阶段 | 复杂度 |
| --- | --- |
| 预处理 | $O(n \log n)$ |
| 单次查询 | $O(\log n)$ |
| 空间 | $O(n \log n)$ |

## 模板代码

::: code-group

```cpp [lca.cpp]
#include <bits/stdc++.h>
using namespace std;

struct LCA {
    int n, LOG;
    vector<vector<int>> g, up;
    vector<int> dep;

    explicit LCA(int n) : n(n), g(n + 1), dep(n + 1, 0) {
        LOG = 1;
        while ((1 << LOG) <= n) ++LOG;
        up.assign(LOG, vector<int>(n + 1, 0));
    }

    void addEdge(int u, int v) {
        g[u].push_back(v);
        g[v].push_back(u);
    }

    // 迭代 BFS 预处理深度与 up[0]，避免深树递归爆栈
    void build(int root = 1) {
        vector<char> vis(n + 1, 0);
        queue<int> q;
        q.push(root);
        vis[root] = 1;
        up[0][root] = 0;
        dep[root] = 0;

        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int v : g[u]) {
                if (vis[v]) continue;
                vis[v] = 1;
                up[0][v] = u;
                dep[v] = dep[u] + 1;
                q.push(v);
            }
        }
        for (int k = 1; k < LOG; ++k)
            for (int v = 1; v <= n; ++v)
                up[k][v] = up[k - 1][up[k - 1][v]];
    }

    int lca(int u, int v) {
        if (dep[u] < dep[v]) swap(u, v);
        int diff = dep[u] - dep[v];
        for (int k = 0; k < LOG; ++k)
            if (diff >> k & 1) u = up[k][u];          // 对齐深度
        if (u == v) return u;

        for (int k = LOG - 1; k >= 0; --k) {          // 从高位开始同时上跳
            if (up[k][u] != up[k][v]) {
                u = up[k][u];
                v = up[k][v];
            }
        }
        return up[0][u];
    }

    int dist(int u, int v) {
        return dep[u] + dep[v] - 2 * dep[lca(u, v)];
    }

    // u 到 v 路径上的第 k 个点（0-indexed，k = 0 时返回 u）
    int kthOnPath(int u, int v, int k) {
        int w = lca(u, v);
        int upLen = dep[u] - dep[w];
        if (k <= upLen) return jump(u, k);
        int downLen = dep[v] - dep[w];
        return jump(v, upLen + downLen - k);
    }

    // u 向上跳 k 步
    int jump(int u, int k) {
        for (int i = 0; k; ++i, k >>= 1)
            if (k & 1) u = up[i][u];
        return u;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m, s;
    cin >> n >> m >> s;                     // n 点 m 询问，根为 s
    LCA lc(n);
    for (int i = 1; i < n; ++i) {
        int u, v;
        cin >> u >> v;
        lc.addEdge(u, v);
    }
    lc.build(s);

    while (m--) {
        int u, v;
        cin >> u >> v;
        cout << lc.lca(u, v) << '\n';
    }
    return 0;
}
```

```python [lca.py]
import sys
from collections import deque


class LCA:
    """倍增求最近公共祖先。"""

    def __init__(self, n: int) -> None:
        self.n = n
        self.g: list[list[int]] = [[] for _ in range(n + 1)]
        self.dep = [0] * (n + 1)
        self.log = max(1, n.bit_length())
        self.up = [[0] * (n + 1) for _ in range(self.log)]

    def add_edge(self, u: int, v: int) -> None:
        self.g[u].append(v)
        self.g[v].append(u)

    def build(self, root: int = 1) -> None:
        """迭代 BFS 预处理深度与倍增表。"""
        vis = [False] * (self.n + 1)
        q = deque([root])
        vis[root] = True
        self.up[0][root] = 0
        self.dep[root] = 0

        while q:
            u = q.popleft()
            for v in self.g[u]:
                if vis[v]:
                    continue
                vis[v] = True
                self.up[0][v] = u
                self.dep[v] = self.dep[u] + 1
                q.append(v)

        for k in range(1, self.log):
            prev, cur = self.up[k - 1], self.up[k]
            for v in range(1, self.n + 1):
                cur[v] = prev[prev[v]]

    def jump(self, u: int, k: int) -> int:
        """u 向上跳 k 步。"""
        i = 0
        while k:
            if k & 1:
                u = self.up[i][u]
            k >>= 1
            i += 1
        return u

    def lca(self, u: int, v: int) -> int:
        if self.dep[u] < self.dep[v]:
            u, v = v, u
        u = self.jump(u, self.dep[u] - self.dep[v])   # 对齐深度
        if u == v:
            return u
        for k in range(self.log - 1, -1, -1):         # 从高位开始同时上跳
            if self.up[k][u] != self.up[k][v]:
                u = self.up[k][u]
                v = self.up[k][v]
        return self.up[0][u]

    def dist(self, u: int, v: int) -> int:
        return self.dep[u] + self.dep[v] - 2 * self.dep[self.lca(u, v)]

    def kth_on_path(self, u: int, v: int, k: int) -> int:
        """u 到 v 路径上的第 k 个点（k 从 0 开始）。"""
        w = self.lca(u, v)
        up_len = self.dep[u] - self.dep[w]
        if k <= up_len:
            return self.jump(u, k)
        down_len = self.dep[v] - self.dep[w]
        return self.jump(v, up_len + down_len - k)


def main() -> None:
    data = sys.stdin.buffer.read().split()
    it = iter(data)
    n = int(next(it))
    m = int(next(it))
    s = int(next(it))

    lc = LCA(n)
    for _ in range(n - 1):
        u = int(next(it))
        v = int(next(it))
        lc.add_edge(u, v)
    lc.build(s)

    out: list[str] = []
    for _ in range(m):
        u = int(next(it))
        v = int(next(it))
        out.append(str(lc.lca(u, v)))
    sys.stdout.write("\n".join(out))


if __name__ == "__main__":
    main()
```

:::

## 其他求 LCA 的方法对比

| 方法 | 预处理 | 单次查询 | 特点 |
| --- | --- | --- | --- |
| 倍增 | $O(n \log n)$ | $O(\log n)$ | 最通用，支持「第 k 个祖先」 |
| 树链剖分 | $O(n)$ | $O(\log n)$ | 常数小，同时可维护路径信息 |
| 欧拉序 + ST 表 | $O(n \log n)$ | $O(1)$ | 查询最快，空间较大 |
| Tarjan 离线 | $O(n + m)$ | $O(1)$ 均摊 | 只能离线，需要并查集 |

## 注意事项

1. **根节点处理**：本模板把根的 `up[0]` 设为 `0`，并让数组开 `n + 1` 个位置以容纳这个哨兵。若节点编号从 0 开始，请改为 $-1$ 并相应调整。
2. **预处理用 BFS 而非 DFS**：链状树用 DFS 递归会爆栈，BFS 天然规避该问题。
3. **多次建树**：多组数据时记得重置 `up`、`dep`、`g`。
4. **树上差分**：求「$u$ 到 $v$ 路径上所有点被覆盖次数」可用 `diff[u]++, diff[v]++, diff[lca]--, diff[parent(lca)]--`，最后子树求和。

## 常见应用

- 树上两点距离、路径上最值（配合倍增维护边权最值）；
- 树上差分（点差分 / 边差分）；
- 求「第 $k$ 个祖先」、「$u$ 是否为 $v$ 的祖先」（用 `dfn` 序判断更简单）；
- 虚树构建、树上莫队的辅助结构。

## 练习题

| 题目 | 难度 | 考点 |
| --- | --- | --- |
| [洛谷 P3379 【模板】最近公共祖先（LCA）](https://www.luogu.com.cn/problem/P3379) | 普及/提高− | 基础模板 |
| [洛谷 P3258 [JLOI2014] 松鼠的新家](https://www.luogu.com.cn/problem/P3258) | 提高+/省选− | 树上点差分 |
| [洛谷 P2680 [NOIP2015] 运输计划](https://www.luogu.com.cn/problem/P2680) | 提高+/省选− | LCA + 二分答案 |
| [洛谷 P1600 [NOIP2016] 天天爱跑步](https://www.luogu.com.cn/problem/P1600) | 省选/NOI− | LCA + 树上差分 |
