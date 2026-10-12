---
title: Tarjan 强连通分量（SCC）
description: Tarjan 算法求有向图强连通分量，含 dfn/low 数组、栈维护与缩点建 DAG 的完整写法。
category: graph
tags:
  - Tarjan
  - 强连通分量
  - SCC
  - 缩点
  - 有向图
languages:
  - cpp
  - python
---

# Tarjan 强连通分量（SCC）

在有向图中，若两点 $u, v$ 互相可达，则它们属于同一个**强连通分量**（Strongly Connected Component）。Tarjan 算法用一次 DFS 在 $O(n + m)$ 内求出所有 SCC。

## 核心思想

DFS 过程中维护两个数组：

- `dfn[u]`：$u$ 被访问的时间戳（第几个被搜到）；
- `low[u]`：从 $u$ 出发，经过**至多一条非树边**能回溯到的最小 `dfn`。

当 `low[u] == dfn[u]` 时，说明 $u$ 是所在 SCC 的根，此时把栈中 $u$ 及其上方的点全部弹出，构成一个 SCC。

$$ low[u] = \min\Bigl(dfn[u],\ \min_{u \to v,\ v \text{ 在栈中}} dfn[v],\ \min_{u \to v} low[v]\Bigr) $$

**关键点**：只有 `v` 仍在栈中（`instk[v] == true`）时，才用 `dfn[v]` 更新 `low[u]`；若 `v` 已出栈，说明它属于另一个已完成的 SCC，不能跨越。

| 复杂度 | 值 |
| --- | --- |
| 时间 | $O(n + m)$ |
| 空间 | $O(n + m)$ |

## 模板代码

::: code-group

```cpp [tarjan_scc.cpp]
#include <bits/stdc++.h>
using namespace std;

struct Tarjan {
    int n, timer = 0, sccCnt = 0;
    vector<vector<int>> g;
    vector<int> dfn, low, stk, comp;   // comp[u]: u 所属 SCC 编号（从 0 开始）
    vector<char> instk;

    explicit Tarjan(int n) : n(n), g(n + 1), dfn(n + 1, 0), low(n + 1, 0), comp(n + 1, -1), instk(n + 1, 0) {
        stk.reserve(n);
    }

    void addEdge(int u, int v) { g[u].push_back(v); }

    void dfs(int u) {
        dfn[u] = low[u] = ++timer;
        stk.push_back(u);
        instk[u] = 1;

        for (int v : g[u]) {
            if (!dfn[v]) {
                dfs(v);
                low[u] = min(low[u], low[v]);
            } else if (instk[v]) {
                low[u] = min(low[u], dfn[v]);
            }
        }

        if (low[u] == dfn[u]) {          // u 是 SCC 的根
            while (true) {
                int x = stk.back();
                stk.pop_back();
                instk[x] = 0;
                comp[x] = sccCnt;
                if (x == u) break;
            }
            ++sccCnt;
        }
    }

    void run() {                          // 处理非连通图
        for (int i = 1; i <= n; ++i)
            if (!dfn[i]) dfs(i);
    }

    // 缩点后重建 DAG：返回邻接表与入度
    pair<vector<vector<int>>, vector<int>> buildDAG() const {
        vector<vector<int>> dag(sccCnt);
        vector<int> indeg(sccCnt, 0);
        for (int u = 1; u <= n; ++u) {
            for (int v : g[u]) {
                if (comp[u] != comp[v]) {
                    dag[comp[u]].push_back(comp[v]);
                    ++indeg[comp[v]];
                }
            }
        }
        return {dag, indeg};
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m;
    cin >> n >> m;
    Tarjan tj(n);
    for (int i = 0; i < m; ++i) {
        int u, v;
        cin >> u >> v;
        tj.addEdge(u, v);
    }

    tj.run();
    cout << tj.sccCnt << '\n';
    for (int i = 1; i <= n; ++i) cout << tj.comp[i] << " \n"[i == n];
    return 0;
}
```

```python [tarjan_scc.py]
import sys

sys.setrecursionlimit(1 << 22)


class Tarjan:
    """Tarjan 求有向图强连通分量。"""

    def __init__(self, n: int) -> None:
        self.n = n
        self.g: list[list[int]] = [[] for _ in range(n + 1)]
        self.dfn = [0] * (n + 1)
        self.low = [0] * (n + 1)
        self.comp = [-1] * (n + 1)      # 所属 SCC 编号
        self.instk = [False] * (n + 1)
        self.stk: list[int] = []
        self.timer = 0
        self.scc_cnt = 0

    def add_edge(self, u: int, v: int) -> None:
        self.g[u].append(v)

    def _dfs(self, u: int) -> None:
        self.timer += 1
        self.dfn[u] = self.low[u] = self.timer
        self.stk.append(u)
        self.instk[u] = True

        for v in self.g[u]:
            if not self.dfn[v]:
                self._dfs(v)
                if self.low[v] < self.low[u]:
                    self.low[u] = self.low[v]
            elif self.instk[v] and self.dfn[v] < self.low[u]:
                self.low[u] = self.dfn[v]

        if self.low[u] == self.dfn[u]:        # u 是 SCC 的根
            while True:
                x = self.stk.pop()
                self.instk[x] = False
                self.comp[x] = self.scc_cnt
                if x == u:
                    break
            self.scc_cnt += 1

    def run(self) -> None:
        for i in range(1, self.n + 1):
            if not self.dfn[i]:
                self._dfs(i)

    def build_dag(self) -> tuple[list[list[int]], list[int]]:
        """缩点后重建 DAG，返回 (邻接表, 入度数组)。"""
        dag: list[list[int]] = [[] for _ in range(self.scc_cnt)]
        indeg = [0] * self.scc_cnt
        for u in range(1, self.n + 1):
            cu = self.comp[u]
            for v in self.g[u]:
                cv = self.comp[v]
                if cu != cv:
                    dag[cu].append(cv)
                    indeg[cv] += 1
        return dag, indeg


def main() -> None:
    data = sys.stdin.buffer.read().split()
    it = iter(data)
    n = int(next(it))
    m = int(next(it))

    tj = Tarjan(n)
    for _ in range(m):
        u = int(next(it))
        v = int(next(it))
        tj.add_edge(u, v)

    tj.run()
    print(tj.scc_cnt)
    print(" ".join(str(tj.comp[i]) for i in range(1, n + 1)))


if __name__ == "__main__":
    main()
```

:::

## 缩点后的典型套路

SCC 缩点后得到一张 **DAG**，之后可以在上面做拓扑排序 + DP：

```cpp
auto [dag, indeg] = tj.buildDAG();

// 先按 SCC 编号统计点权和
vector<long long> w(tj.sccCnt, 0);
for (int u = 1; u <= n; ++u) w[tj.comp[u]] += a[u];

// 在 DAG 上跑最长路
vector<long long> dp = w;
queue<int> q;
for (int c = 0; c < tj.sccCnt; ++c)
    if (indeg[c] == 0) q.push(c);

while (!q.empty()) {
    int u = q.front(); q.pop();
    for (int v : dag[u]) {
        dp[v] = max(dp[v], dp[u] + w[v]);
        if (--indeg[v] == 0) q.push(v);
    }
}
```

## 注意事项

1. **递归深度**：链状图会导致 DFS 深度达到 $O(n)$。C++ 需注意栈大小（`ulimit -s` 或改迭代写法），Python 需 `sys.setrecursionlimit`。
2. **`instk` 判断不能省**：用 `dfn[v]` 更新 `low[u]` 前必须确认 `v` 在栈中，否则会跨越已完成的分量。
3. **重边与自环**：本模板可正常处理，缩点时自环会被 `comp[u] != comp[v]` 过滤掉。
4. **Kosaraju 替代方案**：两次 DFS（正图 + 反图）也能求 SCC，常数略大但不需要 `low` 数组，思路更直观。

## 常见应用

- **缩点 + DAG DP**：最长路、最大权路径、方案计数；
- **2-SAT 判定**：用 SCC 判断变量取值是否矛盾（`x` 与 `¬x` 在同一 SCC 则无解）；
- **有向图必经点 / 割点**：结合支配树或 SCC 缩点；
- **强连通判定**：整张图只有一个 SCC。

## 练习题

| 题目 | 难度 | 考点 |
| --- | --- | --- |
| [洛谷 P2863 [USACO06JAN] The Cow Prom S](https://www.luogu.com.cn/problem/P2863) | 普及/提高− | SCC 大小统计 |
| [洛谷 P2341 [USACO03FALL] 受欢迎的牛 G](https://www.luogu.com.cn/problem/P2341) | 普及/提高− | 缩点 + 出度分析 |
| [洛谷 P3387 【模板】缩点](https://www.luogu.com.cn/problem/P3387) | 提高+/省选− | 缩点 + DAG 最长路 |
| [洛谷 P4782 【模板】2-SAT 问题](https://www.luogu.com.cn/problem/P4782) | 提高+/省选− | SCC + 2-SAT |
