---
title: 最长上升子序列（LIS）
description: O(n log n) 贪心 + 二分的 LIS 模板，含最长不下降子序列、输出具体方案与 Dilworth 定理应用。
category: dp
tags:
  - LIS
  - 最长上升子序列
  - 二分
  - 贪心
  - Dilworth
languages:
  - cpp
  - python
---

# 最长上升子序列（LIS）

给定序列 $a_1, a_2, \dots, a_n$，求最长的**严格递增**子序列长度。

## 核心思想

朴素 DP 是 $O(n^2)$：$f_i = 1 + \max_{j < i,\ a_j < a_i} f_j$。

更优的做法是**贪心 + 二分**：维护数组 `tails`，其中 `tails[k]` 表示「长度为 $k + 1$ 的上升子序列的**最小结尾元素**」。

- 遍历每个 $a_i$，在 `tails` 中二分找到第一个 $\ge a_i$ 的位置，用 $a_i$ 替换它；
- 若 $a_i$ 比所有元素都大，则追加到末尾，答案长度加一。

`tails` 天然单调递增，所以可以二分。复杂度 $O(n \log n)$。

| 求什么 | 二分用 | 替换规则 |
| --- | --- | --- |
| 严格上升（LIS） | `lower_bound`（第一个 $\ge a_i$） | 替换第一个 $\ge a_i$ 的元素 |
| 不下降（LNDS） | `upper_bound`（第一个 $> a_i$） | 替换第一个 $> a_i$ 的元素 |
| 严格下降 | 取负号后求 LIS | 同上 |
| 不上升 | 取负号后求 LNDS | 同上 |

## 模板代码

::: code-group

```cpp [lis.cpp]
#include <bits/stdc++.h>
using namespace std;

// 严格上升子序列长度，O(n log n)
int lisLength(const vector<int>& a) {
    vector<int> tails;                       // tails 始终单调递增
    for (int x : a) {
        auto it = lower_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) tails.push_back(x);
        else *it = x;
    }
    return (int)tails.size();
}

// 最长不下降子序列长度，O(n log n)
int lndsLength(const vector<int>& a) {
    vector<int> tails;
    for (int x : a) {
        auto it = upper_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) tails.push_back(x);
        else *it = x;
    }
    return (int)tails.size();
}

// 输出一组具体方案（O(n log n)）
vector<int> lisSequence(const vector<int>& a) {
    int n = (int)a.size();
    vector<int> tails, tailIdx;              // tailIdx[k]: 长度为 k+1 的 LIS 的结尾下标
    vector<int> pre(n, -1);

    for (int i = 0; i < n; ++i) {
        auto it = lower_bound(tails.begin(), tails.end(), a[i]);
        int pos = (int)(it - tails.begin());
        pre[i] = (pos > 0) ? tailIdx[pos - 1] : -1;
        if (it == tails.end()) {
            tails.push_back(a[i]);
            tailIdx.push_back(i);
        } else {
            *it = a[i];
            tailIdx[pos] = i;
        }
    }

    vector<int> res;
    for (int i = tailIdx.empty() ? -1 : tailIdx.back(); i != -1; i = pre[i])
        res.push_back(a[i]);
    reverse(res.begin(), res.end());
    return res;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    cin >> n;
    vector<int> a(n);
    for (int& x : a) cin >> x;

    cout << "LIS  : " << lisLength(a) << '\n';
    cout << "LNDS : " << lndsLength(a) << '\n';

    vector<int> seq = lisSequence(a);
    for (size_t i = 0; i < seq.size(); ++i) cout << seq[i] << " \n"[i + 1 == seq.size()];
    return 0;
}
```

```python [lis.py]
from bisect import bisect_left, bisect_right


def lis_length(a: list[int]) -> int:
    """严格上升子序列长度，O(n log n)。"""
    tails: list[int] = []
    for x in a:
        pos = bisect_left(tails, x)      # 第一个 >= x 的位置
        if pos == len(tails):
            tails.append(x)
        else:
            tails[pos] = x
    return len(tails)


def lnds_length(a: list[int]) -> int:
    """最长不下降子序列长度，O(n log n)。"""
    tails: list[int] = []
    for x in a:
        pos = bisect_right(tails, x)     # 第一个 > x 的位置
        if pos == len(tails):
            tails.append(x)
        else:
            tails[pos] = x
    return len(tails)


def lis_sequence(a: list[int]) -> list[int]:
    """输出一组具体的 LIS 方案，O(n log n)。"""
    tails: list[int] = []
    tail_idx: list[int] = []             # 长度为 k+1 的 LIS 的结尾下标
    pre = [-1] * len(a)

    for i, x in enumerate(a):
        pos = bisect_left(tails, x)
        pre[i] = tail_idx[pos - 1] if pos > 0 else -1
        if pos == len(tails):
            tails.append(x)
            tail_idx.append(i)
        else:
            tails[pos] = x
            tail_idx[pos] = i

    res: list[int] = []
    i = tail_idx[-1] if tail_idx else -1
    while i != -1:
        res.append(a[i])
        i = pre[i]
    res.reverse()
    return res


def main() -> None:
    import sys

    data = sys.stdin.buffer.read().split()
    if not data:
        return
    n = int(data[0])
    a = list(map(int, data[1:1 + n]))

    print("LIS  :", lis_length(a))
    print("LNDS :", lnds_length(a))
    print(" ".join(map(str, lis_sequence(a))))


if __name__ == "__main__":
    main()
```

:::

## 二维偏序：排序 + LIS

LIS 的本质是**一维偏序**问题。遇到「同时满足 $x$ 递增且 $y$ 递增」的二维偏序最长链问题时：

1. 按第一维**升序**排序；
2. 第一维相同时，第二维**降序**排序（这样同一组内不会互相贡献，保证严格性）；
3. 对第二维数组求 LIS。

::: code-group

```cpp [two_dim_lis.cpp]
struct Point { int x, y; };

int longestChain(vector<Point> p) {
    sort(p.begin(), p.end(), [](const Point& a, const Point& b) {
        return a.x != b.x ? a.x < b.x : a.y > b.y;   // x 升序，x 相同则 y 降序
    });
    vector<int> tails;
    for (const auto& q : p) {
        auto it = lower_bound(tails.begin(), tails.end(), q.y);
        if (it == tails.end()) tails.push_back(q.y);
        else *it = q.y;
    }
    return (int)tails.size();
}
```

```python [two_dim_lis.py]
def longest_chain(points: list[tuple[int, int]]) -> int:
    """二维偏序最长严格上升链。"""
    points.sort(key=lambda t: (t[0], -t[1]))   # x 升序，x 相同则 y 降序
    tails: list[int] = []
    for _, y in points:
        pos = bisect_left(tails, y)
        if pos == len(tails):
            tails.append(y)
        else:
            tails[pos] = y
    return len(tails)
```

:::

## Dilworth 定理

**最小链覆盖数 = 最长反链长度**。在偏序集上：

- 「最长上升子序列长度」= 「最少能用多少个不上升子序列覆盖整个序列」；
- 因此「把序列划分成最少的下降子序列个数」就等于 LIS 长度。

这个结论常用于「最少需要几套系统 / 几台机器」类问题（如导弹拦截问题第二问）。

## 注意事项

1. **严格 vs 非严格**：`lower_bound` 对应严格上升，`upper_bound` 对应不下降。选错会导致答案偏大或偏小。
2. **`tails` 不是答案序列**：`tails` 只是辅助数组，其内容不构成合法的 LIS，要输出方案必须额外记录前驱。
3. **离散化**：值域很大时可以先离散化再用 LIS，复杂度不变。
4. **带修改的 LIS**：动态 LIS 需要更复杂的数据结构（线段树 / CDQ 分治），不在本模板范围内。

## 练习题

| 题目 | 难度 | 考点 |
| --- | --- | --- |
| [洛谷 P1020 [NOIP1999] 导弹拦截](https://www.luogu.com.cn/problem/P1020) | 普及/提高− | LIS + Dilworth |
| [洛谷 B3637 最长上升子序列](https://www.luogu.com.cn/problem/B3637) | 普及− | 基础模板 |
| [洛谷 P1091 [NOIP2004] 合唱队形](https://www.luogu.com.cn/problem/P1091) | 普及/提高− | 正反两遍 LIS |
| [洛谷 P2782 友好城市](https://www.luogu.com.cn/problem/P2782) | 普及/提高− | 二维偏序 |
| [洛谷 P1439 【模板】最长公共子序列](https://www.luogu.com.cn/problem/P1439) | 普及/提高− | LCS 转 LIS |
