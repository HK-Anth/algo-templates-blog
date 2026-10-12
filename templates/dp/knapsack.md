---
title: 背包问题（0/1、完全、多重、分组）
description: 四类背包问题的统一模板：0/1 背包、完全背包、多重背包（二进制拆分 + 单调队列）与分组背包。
category: dp
tags:
  - 背包
  - 动态规划
  - 0/1背包
  - 完全背包
  - 多重背包
languages:
  - cpp
  - python
---

# 背包问题（0/1、完全、多重、分组）

背包是线性 DP 的入门模型。核心是**状态定义**与**遍历顺序**——同一个转移方程，内层循环正序还是倒序，决定了物品能否被重复选取。

## 状态定义

设 $f_j$ 表示「容量不超过 $j$ 时的最大价值」：

$$ f_j = \max\bigl(f_j,\ f_{j - w_i} + v_i\bigr) $$

## 四类背包对比

| 类型 | 每个物品可选次数 | 内层循环方向 | 复杂度 |
| --- | --- | --- | --- |
| 0/1 背包 | 0 或 1 次 | 容量**倒序** | $O(nV)$ |
| 完全背包 | 无限次 | 容量**正序** | $O(nV)$ |
| 多重背包 | 至多 $c_i$ 次 | 二进制拆分后按 0/1 处理 | $O(V \sum \log c_i)$ |
| 分组背包 | 每组至多选 1 个 | 组外正序、组内倒序 | $O(V \sum |G_i|)$ |

::: tip 为什么 0/1 背包要倒序
正序遍历时，`f[j - w]` 可能已经包含了第 $i$ 件物品，相当于该物品被重复选取；倒序遍历时 `f[j - w]` 尚未被本轮更新，保证每件物品只用一次。
:::

## 模板代码

::: code-group

```cpp [knapsack.cpp]
#include <bits/stdc++.h>
using namespace std;
using ll = long long;
const ll NEG = numeric_limits<ll>::min() / 4;   // 求「恰好装满」时用 -inf 表示不可达

// ---------------- 0/1 背包：容量 V，物品 (w, v) ----------------
ll knapsack01(int V, const vector<int>& w, const vector<ll>& v) {
    vector<ll> f(V + 1, 0);
    for (size_t i = 0; i < w.size(); ++i)
        for (int j = V; j >= w[i]; --j)              // 倒序
            f[j] = max(f[j], f[j - w[i]] + v[i]);
    return f[V];
}

// ---------------- 完全背包：每个物品无限件 ----------------
ll knapsackComplete(int V, const vector<int>& w, const vector<ll>& v) {
    vector<ll> f(V + 1, 0);
    for (size_t i = 0; i < w.size(); ++i)
        for (int j = w[i]; j <= V; ++j)              // 正序
            f[j] = max(f[j], f[j - w[i]] + v[i]);
    return f[V];
}

// ---------------- 多重背包：二进制拆分优化 ----------------
ll knapsackMultiple(int V, const vector<int>& w, const vector<ll>& v, const vector<int>& cnt) {
    vector<ll> f(V + 1, 0);
    for (size_t i = 0; i < w.size(); ++i) {
        int c = cnt[i];
        for (int k = 1; c > 0; k <<= 1) {            // 1, 2, 4, ... 拆分
            int take = min(k, c);
            c -= take;
            int nw = w[i] * take;
            ll  nv = v[i] * take;
            for (int j = V; j >= nw; --j)
                f[j] = max(f[j], f[j - nw] + nv);
        }
    }
    return f[V];
}

// ---------------- 分组背包：每组至多选一个 ----------------
ll knapsackGroup(int V, const vector<vector<pair<int, ll>>>& groups) {
    vector<ll> f(V + 1, 0);
    for (const auto& group : groups) {
        for (int j = V; j >= 0; --j) {               // 组内倒序，保证每组只选一个
            for (const auto& [wi, vi] : group) {
                if (j >= wi) f[j] = max(f[j], f[j - wi] + vi);
            }
        }
    }
    return f[V];
}

// ---------------- 多重背包：单调队列优化 O(nV) ----------------
ll knapsackMultipleMonotone(int V, const vector<int>& w, const vector<ll>& v, const vector<int>& cnt) {
    vector<ll> f(V + 1, 0), g(V + 1, 0);
    for (size_t i = 0; i < w.size(); ++i) {
        int wi = w[i];
        ll  vi = v[i];
        int c = cnt[i];
        for (int r = 0; r < wi; ++r) {
            deque<int> dq;                            // 存下标，维护 f 的单调递减队列
            for (int j = r, k = 0; j <= V; j += wi, ++k) {
                // 窗口内最多 c 个物品：把超出范围的队首弹出
                while (!dq.empty() && k - dq.front() > c) dq.pop_front();
                while (!dq.empty() && f[dq.back()] <= f[j]) dq.pop_back();
                dq.push_back(j);
                g[j] = f[dq.front()] + (ll)k * vi;
            }
            for (int j = r; j <= V; j += wi) f[j] = max(f[j], g[j]);
        }
    }
    return f[V];
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, V;
    cin >> n >> V;                                   // n 件物品，容量 V
    vector<int> w(n), cnt(n);
    vector<ll> v(n);
    for (int i = 0; i < n; ++i) cin >> w[i] >> v[i] >> cnt[i];

    cout << "0/1      : " << knapsack01(V, w, v) << '\n';
    cout << "complete : " << knapsackComplete(V, w, v) << '\n';
    cout << "multiple : " << knapsackMultiple(V, w, v, cnt) << '\n';
    cout << "monotone : " << knapsackMultipleMonotone(V, w, v, cnt) << '\n';
    return 0;
}
```

```python [knapsack.py]
from collections import deque


def knapsack_01(V: int, w: list[int], v: list[int]) -> int:
    """0/1 背包：容量 V，每件物品最多取一次。"""
    f = [0] * (V + 1)
    for wi, vi in zip(w, v):
        for j in range(V, wi - 1, -1):        # 倒序
            if f[j - wi] + vi > f[j]:
                f[j] = f[j - wi] + vi
    return f[V]


def knapsack_complete(V: int, w: list[int], v: list[int]) -> int:
    """完全背包：每件物品可取无限次。"""
    f = [0] * (V + 1)
    for wi, vi in zip(w, v):
        for j in range(wi, V + 1):            # 正序
            if f[j - wi] + vi > f[j]:
                f[j] = f[j - wi] + vi
    return f[V]


def knapsack_multiple(V: int, w: list[int], v: list[int], cnt: list[int]) -> int:
    """多重背包：二进制拆分优化。"""
    f = [0] * (V + 1)
    for wi, vi, c in zip(w, v, cnt):
        k = 1
        while c > 0:
            take = min(k, c)
            c -= take
            nw, nv = wi * take, vi * take
            for j in range(V, nw - 1, -1):
                if f[j - nw] + nv > f[j]:
                    f[j] = f[j - nw] + nv
            k <<= 1
    return f[V]


def knapsack_group(V: int, groups: list[list[tuple[int, int]]]) -> int:
    """分组背包：每组至多选一个物品。"""
    f = [0] * (V + 1)
    for group in groups:
        for j in range(V, -1, -1):            # 组内倒序，保证每组只选一个
            for wi, vi in group:
                if j >= wi and f[j - wi] + vi > f[j]:
                    f[j] = f[j - wi] + vi
    return f[V]


def knapsack_multiple_monotone(V: int, w: list[int], v: list[int], cnt: list[int]) -> int:
    """多重背包：单调队列优化，O(nV)。"""
    f = [0] * (V + 1)
    for wi, vi, c in zip(w, v, cnt):
        g = f[:]
        for r in range(wi):
            dq: deque[int] = deque()          # 存下标，维护 f 单调递减
            k = 0
            for j in range(r, V + 1, wi):
                while dq and k - dq[0] > c:
                    dq.popleft()
                while dq and f[dq[-1]] <= f[j]:
                    dq.pop()
                dq.append(j)
                g[j] = f[dq[0]] + k * vi
                k += 1
        f = [max(a, b) for a, b in zip(f, g)]
    return f[V]


def main() -> None:
    import sys

    data = sys.stdin.buffer.read().split()
    it = iter(data)
    n = int(next(it))
    V = int(next(it))
    w, v, cnt = [], [], []
    for _ in range(n):
        w.append(int(next(it)))
        v.append(int(next(it)))
        cnt.append(int(next(it)))

    print("0/1      :", knapsack_01(V, w, v))
    print("complete :", knapsack_complete(V, w, v))
    print("multiple :", knapsack_multiple(V, w, v, cnt))
    print("monotone :", knapsack_multiple_monotone(V, w, v, cnt))


if __name__ == "__main__":
    main()
```

:::

## 常见变体

### 恰好装满

把 `f` 初始化为 $-\infty$（不可达），仅 `f[0] = 0`，最后判断 `f[V] < 0` 表示无解。

```cpp
vector<ll> f(V + 1, NEG);
f[0] = 0;
// ... 转移不变 ...
if (f[V] < 0) cout << "无解\n";
```

### 求方案数

把 `max` 换成加法：

```cpp
vector<ll> f(V + 1, 0);
f[0] = 1;
for (int j = w[i]; j <= V; ++j)
    f[j] = (f[j] + f[j - w[i]]) % MOD;
```

### 输出具体方案

额外记录 `g[j]` 表示「容量 $j$ 时选的最后一件物品」，最后倒推：

```cpp
vector<int> g(V + 1, -1);
// 转移时：if (f[j - w[i]] + v[i] > f[j]) { f[j] = f[j - w[i]] + v[i]; g[j] = i; }
for (int j = V; j > 0 && g[j] != -1; ) {
    cout << g[j] << ' ';
    j -= w[g[j]];
}
```

### 二维费用背包

增加一维容量维度，`f[j][k]` 同时受两种费用约束，循环各加一层。

## 注意事项

1. **下标与容量边界**：内层循环的起止条件必须与物品重量严格对应，否则会越界或漏解。
2. **C++ 溢出**：价值较大时用 `long long`；求方案数时每次加法后取模。
3. **滚动数组方向**：0/1 倒序、完全正序，是背包最容易写错的地方。
4. **单调队列优化的前提**：需要 `f` 在同一余数类上满足「区间最大值」结构，只适用于「价值与重量成线性关系」的多重背包。

## 练习题

| 题目 | 难度 | 考点 |
| --- | --- | --- |
| [洛谷 P1048 [NOIP2005] 采药](https://www.luogu.com.cn/problem/P1048) | 普及− | 0/1 背包 |
| [洛谷 P1616 疯狂的采药](https://www.luogu.com.cn/problem/P1616) | 普及− | 完全背包 |
| [洛谷 P1776 宝物筛选](https://www.luogu.com.cn/problem/P1776) | 提高+/省选− | 多重背包单调队列 |
| [洛谷 P1064 [NOIP2006] 金明的预算方案](https://www.luogu.com.cn/problem/P1064) | 普及/提高− | 分组背包 |
| [洛谷 P1757 通天之分组背包](https://www.luogu.com.cn/problem/P1757) | 普及/提高− | 分组背包 |
