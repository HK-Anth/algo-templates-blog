---
title: 拓扑排序（Topological Sort）
description: 基于 BFS（Kahn 算法）与 DFS 的拓扑排序模板，支持判环、字典序最小拓扑序与 DAG 上 DP。
category: graph
tags:
  - 拓扑排序
  - DAG
  - Kahn
  - 入度
  - 有向无环图
languages:
  - cpp
  - python
---

# 拓扑排序（Topological Sort）

拓扑排序把一个有向无环图（DAG）的所有顶点排成线性序列，使得对每条边 $u \to v$，$u$ 都排在 $v$ 之前。

## 核心思想

**Kahn 算法（BFS）**：

1. 统计每个点的入度，把入度为 $0$ 的点入队；
2. 反复取出队首 $u$ 加入答案，遍历 $u$ 的出边，把 `indeg[v]` 减 1；
3. 若 `indeg[v]` 变为 $0$ 则入队。

如果最终输出点数 $< n$，说明图中存在**环**（剩余的点入度始终为正）。

**字典序最小**的拓扑序只需把队列换成**小根堆**。

| 方法 | 复杂度 | 特点 |
| --- | --- | --- |
| Kahn（BFS） | $O(n + m)$ | 易判环，易求字典序最小 |
| DFS 后序反转 | $O(n + m)$ | 代码短，适合顺带做 DAG 上 DP |

## 模板代码（Kahn 算法）

::: code-group

```cpp [topo_sort.cpp]
#include <bits/stdc++.h>
using namespace std;

// 返回拓扑序；若存在环返回空 vector
vector<int> topoSort(int n, const vector<vector<int>>& g) {
    vector<int> indeg(n + 1, 0);
    for (int u = 1; u <= n; ++u)
        for (int v : g[u]) ++indeg[v];

    // 换成 priority_queue<int, vector<int>, greater<>> 即得字典序最小拓扑序
    queue<int> q;
    for (int i = 1; i <= n; ++i)
        if (indeg[i] == 0) q.push(i);

    vector<int> order;
    order.reserve(n);
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        order.push_back(u);
        for (int v : g[u]) {
            if (--indeg[v] == 0) q.push(v);
        }
    }
    if ((int)order.size() != n) return {};   // 有环
    return order;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m;
    cin >> n >> m;
    vector<vector<int>> g(n + 1);
    for (int i = 0; i < m; ++i) {
        int u, v;
        cin >> u >> v;                       // u -> v
        g[u].push_back(v);
    }

    vector<int> order = topoSort(n, g);
    if (order.empty()) {
        cout << "Cycle detected\n";
    } else {
        for (int i = 0; i < n; ++i) cout << order[i] << " \n"[i + 1 == n];
    }
    return 0;
}
```

```python [topo_sort.py]
import sys
from collections import deque


def topo_sort(n: int, g: list[list[int]]) -> list[int]:
    """Kahn 算法。返回拓扑序；存在环时返回空列表。"""
    indeg = [0] * (n + 1)
    for u in range(1, n + 1):
        for v in g[u]:
            indeg[v] += 1

    # 换成 heapq 即得字典序最小拓扑序
    q = deque(i for i in range(1, n + 1) if indeg[i] == 0)

    order: list[int] = []
    while q:
        u = q.popleft()
        order.append(u)
        for v in g[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)

    return order if len(order) == n else []


def main() -> None:
    data = sys.stdin.buffer.read().split()
    it = iter(data)
    n = int(next(it))
    m = int(next(it))

    g: list[list[int]] = [[] for _ in range(n + 1)]
    for _ in range(m):
        u = int(next(it))
        v = int(next(it))
        g[u].append(v)

    order = topo_sort(n, g)
    if not order:
        print("Cycle detected")
    else:
        print(" ".join(map(str, order)))


if __name__ == "__main__":
    main()
```

:::

## 模板代码（DFS 版）

::: code-group

```cpp [topo_sort_dfs.cpp]
vector<int> order;
vector<int> color;   // 0 未访问, 1 在栈中, 2 已完成

bool dfs(int u, const vector<vector<int>>& g) {
    color[u] = 1;
    for (int v : g[u]) {
        if (color[v] == 1) return false;        // 回到栈中的点 → 有环
        if (color[v] == 0 && !dfs(v, g)) return false;
    }
    color[u] = 2;
    order.push_back(u);                          // 后序
    return true;
}

// 调用：color.assign(n + 1, 0); order.clear();
// for (int i = 1; i <= n; ++i) if (!color[i] && !dfs(i, g)) -> 有环
// 最后 reverse(order.begin(), order.end());
```

```python [topo_sort_dfs.py]
import sys

sys.setrecursionlimit(1 << 20)


def topo_sort_dfs(n: int, g: list[list[int]]) -> list[int]:
    """DFS 版拓扑排序：后序反转。有环时返回空列表。"""
    color = [0] * (n + 1)     # 0 未访问, 1 在栈中, 2 已完成
    order: list[int] = []
    ok = True

    def dfs(u: int) -> None:
        nonlocal ok
        color[u] = 1
        for v in g[u]:
            if color[v] == 1:
                ok = False
                return
            if color[v] == 0:
                dfs(v)
                if not ok:
                    return
        color[u] = 2
        order.append(u)       # 后序

    for i in range(1, n + 1):
        if color[i] == 0:
            dfs(i)
            if not ok:
                return []

    order.reverse()
    return order
```

:::

## DAG 上的 DP 套路

拓扑序是 DAG 上 DP 的天然计算顺序。典型写法（以最长路为例）：

```cpp
vector<long long> dp(n + 1, 0);
for (int u : topoOrder) {
    for (const auto& e : g[u]) {
        dp[e.to] = max(dp[e.to], dp[u] + e.w);
    }
}
```

常见问题：DAG 上最长路、路径计数、可行性判定、依赖关系调度。

## 常见应用

- **任务调度 / 课程表**：判断依赖关系是否可行，给出合法执行顺序；
- **DAG 上 DP**：最长路、方案数、博弈论（有向图游戏）；
- **缩点后建图**：Tarjan 求出 SCC 后缩点，得到 DAG 再做拓扑 DP；
- **表达式求值 / 编译依赖**：拓扑序保证依赖先于被依赖者。

## 练习题

| 题目 | 难度 | 考点 |
| --- | --- | --- |
| [洛谷 P1113 杂务](https://www.luogu.com.cn/problem/P1113) | 普及/提高− | 拓扑 + DP |
| [洛谷 P1347 排序](https://www.luogu.com.cn/problem/P1347) | 普及/提高− | 判环 + 唯一性判定 |
| [洛谷 P4017 最大食物链计数](https://www.luogu.com.cn/problem/P4017) | 普及/提高− | DAG 路径计数 |
| [洛谷 P1807 最长路](https://www.luogu.com.cn/problem/P1807) | 普及/提高− | DAG 最长路 |
