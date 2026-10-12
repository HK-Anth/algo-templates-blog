---
title: 堆优化 Dijkstra 最短路
description: 优先队列优化的单源最短路模板，处理非负边权，复杂度 O(m log m)，含路径还原与邻接表建图。
category: graph
tags:
  - 最短路
  - Dijkstra
  - 优先队列
  - 邻接表
  - 图论
languages:
  - cpp
  - python
---

# 堆优化 Dijkstra 最短路

Dijkstra 算法求解**非负边权**图的单源最短路。朴素实现每次 $O(n)$ 找最小值，用优先队列（小根堆）优化后复杂度降到 $O(m \log m)$。

## 核心思想

维护已确定最短路的点集 $S$，每次从堆中取出当前距离最小的未访问点 $u$，把 $u$ 加入 $S$，并用 $u$ 松弛所有出边：

$$ dist_v = \min(dist_v,\ dist_u + w(u, v)) $$

**正确性前提**：所有边权非负。因为一旦某个点被取出，它的距离就不会再被更新。

| 实现 | 复杂度 | 适用 |
| --- | --- | --- |
| 朴素 Dijkstra | $O(n^2)$ | 稠密图 $m \approx n^2$ |
| 堆优化 Dijkstra | $O(m \log m)$ | 稀疏图 |
| Floyd | $O(n^3)$ | 多源、$n \le 500$ |
| SPFA | $O(km)$ 最坏 $O(nm)$ | 有负权且无负环 |

## 模板代码

::: code-group

```cpp [dijkstra.cpp]
#include <bits/stdc++.h>
using namespace std;
using ll = long long;
const ll INF = numeric_limits<ll>::max() / 4;

struct Edge {
    int to;
    ll w;
};

// 返回 dist 数组（1-indexed），不可达为 INF
vector<ll> dijkstra(int n, const vector<vector<Edge>>& g, int src) {
    vector<ll> dist(n + 1, INF);
    vector<int> pre(n + 1, 0);                 // 记录前驱，用于还原路径
    priority_queue<pair<ll, int>, vector<pair<ll, int>>, greater<>> pq;

    dist[src] = 0;
    pq.emplace(0, src);

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();
        if (d > dist[u]) continue;             // 过期堆元素，跳过

        for (const auto& e : g[u]) {
            if (dist[u] + e.w < dist[e.to]) {
                dist[e.to] = dist[u] + e.w;
                pre[e.to] = u;
                pq.emplace(dist[e.to], e.to);
            }
        }
    }
    return dist;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m, s;
    cin >> n >> m >> s;                        // n 点 m 边，源点 s

    vector<vector<Edge>> g(n + 1);
    for (int i = 0; i < m; ++i) {
        int u, v; ll w;
        cin >> u >> v >> w;
        g[u].push_back({v, w});                // 有向图
        // g[v].push_back({u, w});             // 无向图时取消注释
    }

    vector<ll> dist = dijkstra(n, g, s);
    for (int i = 1; i <= n; ++i) {
        cout << (dist[i] >= INF ? -1 : dist[i]) << " \n"[i == n];
    }
    return 0;
}
```

```python [dijkstra.py]
import sys
from heapq import heappush, heappop

INF = float("inf")


def dijkstra(n: int, g: list[list[tuple[int, int]]], src: int) -> list[int]:
    """返回 dist（下标从 1 开始），不可达为 INF。g[u] = [(v, w), ...]"""
    dist = [INF] * (n + 1)
    dist[src] = 0
    pq = [(0, src)]

    while pq:
        d, u = heappop(pq)
        if d > dist[u]:          # 过期堆元素，跳过
            continue
        for v, w in g[u]:
            nd = d + w
            if nd < dist[v]:
                dist[v] = nd
                heappush(pq, (nd, v))
    return dist


def main() -> None:
    data = sys.stdin.buffer.read().split()
    it = iter(data)
    n = int(next(it))
    m = int(next(it))
    s = int(next(it))

    g: list[list[tuple[int, int]]] = [[] for _ in range(n + 1)]
    for _ in range(m):
        u = int(next(it))
        v = int(next(it))
        w = int(next(it))
        g[u].append((v, w))          # 有向图
        # g[v].append((u, w))        # 无向图时取消注释

    dist = dijkstra(n, g, s)
    print(" ".join(str(-1 if d == INF else d) for d in dist[1:]))


if __name__ == "__main__":
    main()
```

:::

## 路径还原

在松弛成功时记录 `pre[v] = u`，最后从终点倒推：

::: code-group

```cpp [restore_path.cpp]
// pre 数组需从 dijkstra 中带出
vector<int> restorePath(const vector<int>& pre, int src, int dst) {
    vector<int> path;
    for (int v = dst; v != 0; v = pre[v]) path.push_back(v);
    reverse(path.begin(), path.end());
    if (path.front() != src) return {};   // 不可达
    return path;
}
```

```python [restore_path.py]
def restore_path(pre: list[int], src: int, dst: int) -> list[int]:
    path = []
    v = dst
    while v:
        path.append(v)
        v = pre[v]
    path.reverse()
    return path if path and path[0] == src else []
```

:::

## 注意事项

1. **边权必须非负**。存在负权时请改用 SPFA 或 Johnson 算法；有负环则最短路无意义。
2. 使用 `long long` / Python 的大整数，避免 `dist[u] + w` 溢出（C++ 中 `INF` 取 `LLONG_MAX / 4` 这类安全值）。
3. 堆中会存在**过期元素**（同一点被多次入堆），弹出时用 `if (d > dist[u]) continue` 过滤。
4. 若需要**字典序最小**的最短路路径，可以按「距离相同则比较路径」的规则改造，或先跑 Dijkstra 再在 DAG 上做贪心。

## 常见应用

- 单源最短路、单源最长路（DAG 上可做）；
- **分层图**最短路（如「最多免费 $k$ 条边」）；
- **反图 + 正图**求「从 $s$ 到 $t$ 的必经点 / 最短路上计数」；
- 作为 A*、Johnson 全源最短路等算法的子过程。

## 练习题

| 题目 | 难度 | 考点 |
| --- | --- | --- |
| [洛谷 P4779 【模板】单源最短路径（标准版）](https://www.luogu.com.cn/problem/P4779) | 普及/提高− | 堆优化模板 |
| [洛谷 P1629 邮递员送信](https://www.luogu.com.cn/problem/P1629) | 普及/提高− | 正反图 |
| [洛谷 P4568 [JLOI2011] 飞行路线](https://www.luogu.com.cn/problem/P4568) | 提高+/省选− | 分层图 |
| [洛谷 P1608 路径统计](https://www.luogu.com.cn/problem/P1608) | 普及/提高− | 最短路计数 |
