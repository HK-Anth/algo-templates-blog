---
title: ST 表（Sparse Table）
description: 静态区间最值查询（RMQ）的 ST 表模板，O(n log n) 预处理、O(1) 查询。
category: data-structure
tags:
  - ST表
  - Sparse Table
  - RMQ
  - 区间最值
  - 倍增
languages:
  - cpp
  - python
---

# ST 表（Sparse Table）

ST 表用于解决**静态**区间最值查询（RMQ）：数组不变，多次询问区间 $[l, r]$ 的最大 / 最小值。

## 核心思想

定义 $st[k][i]$ 表示从 $i$ 开始、长度为 $2^k$ 的区间的最值：

$$ st[0][i] = a_i, \qquad st[k][i] = \max\bigl(st[k-1][i],\ st[k-1][i + 2^{k-1}]\bigr) $$

查询 $[l, r]$ 时，令 $k = \lfloor \log_2(r - l + 1) \rfloor$，则两个长度 $2^k$ 的区间 $[l, l+2^k-1]$ 与 $[r-2^k+1, r]$ 一定覆盖 $[l, r]$，因此：

$$ \text{query}(l, r) = \max\bigl(st[k][l],\ st[k][r - 2^k + 1]\bigr) $$

这正是 ST 表只适用于**可重复贡献**运算（max、min、gcd、按位与/或）的原因——区间重叠不影响答案。区间和不能用 ST 表。

| 阶段 | 复杂度 |
| --- | --- |
| 预处理 | $O(n \log n)$ |
| 单次查询 | $O(1)$ |
| 空间 | $O(n \log n)$ |

## 模板代码

::: code-group

```cpp [sparse_table.cpp]
#include <bits/stdc++.h>
using namespace std;

// 以区间最大值为例，改成 min / gcd 只需换 merge 函数
template <class T, class Merge = function<T(const T&, const T&)>>
struct SparseTable {
    int n, LOG;
    vector<vector<T>> st;
    vector<int> lg;
    Merge merge;

    SparseTable(const vector<T>& a, Merge m = [](const T& x, const T& y) { return max(x, y); })
        : n((int)a.size() - 1), merge(m) {
        LOG = 1;
        while ((1 << LOG) <= n) ++LOG;
        st.assign(LOG, vector<T>(n + 1));
        lg.assign(n + 1, 0);
        for (int i = 1; i <= n; ++i) st[0][i] = a[i];
        for (int k = 1; k < LOG; ++k) {
            for (int i = 1; i + (1 << k) - 1 <= n; ++i) {
                st[k][i] = merge(st[k - 1][i], st[k - 1][i + (1 << (k - 1))]);
            }
        }
        for (int i = 2; i <= n; ++i) lg[i] = lg[i >> 1] + 1;
    }

    T query(int l, int r) const {   // 闭区间 [l, r]
        int k = lg[r - l + 1];
        return merge(st[k][l], st[k][r - (1 << k) + 1]);
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m;
    cin >> n >> m;
    vector<int> a(n + 1);
    for (int i = 1; i <= n; ++i) cin >> a[i];

    SparseTable<int> st(a);
    while (m--) {
        int l, r;
        cin >> l >> r;
        cout << st.query(l, r) << '\n';
    }
    return 0;
}
```

```python [sparse_table.py]
import sys
from math import log2


class SparseTable:
    """静态区间最值查询：O(n log n) 预处理，O(1) 查询。"""

    __slots__ = ("n", "log", "st", "lg", "op")

    def __init__(self, a: list[int], op=max) -> None:
        self.n = len(a) - 1                 # a 下标从 1 开始
        self.op = op
        n = self.n
        self.log = max(1, n.bit_length())
        # st[k][i]：从 i 起长度为 2^k 的区间最值
        self.st = [a[:]] + [[0] * (n + 1) for _ in range(self.log - 1)]
        for k in range(1, self.log):
            prev, cur = self.st[k - 1], self.st[k]
            half = 1 << (k - 1)
            for i in range(1, n - (1 << k) + 2):
                cur[i] = op(prev[i], prev[i + half])
        self.lg = [0] * (n + 1)
        for i in range(2, n + 1):
            self.lg[i] = self.lg[i >> 1] + 1

    def query(self, l: int, r: int) -> int:
        """闭区间 [l, r] 的最值。"""
        k = self.lg[r - l + 1]
        return self.op(self.st[k][l], self.st[k][r - (1 << k) + 1])


def main() -> None:
    data = sys.stdin.buffer.read().split()
    it = iter(data)
    n = int(next(it))
    m = int(next(it))
    a = [0] * (n + 1)
    for i in range(1, n + 1):
        a[i] = int(next(it))

    st = SparseTable(a, max)
    out: list[str] = []
    for _ in range(m):
        l = int(next(it))
        r = int(next(it))
        out.append(str(st.query(l, r)))
    sys.stdout.write("\n".join(out))


if __name__ == "__main__":
    main()
```

:::

## 使用说明

- **下标从 1 开始**。若原数组从 0 开始，在最前面补一个哨兵元素即可。
- 求最小值把 `max` 换成 `min`；求 $\gcd$ 传入 `math.gcd` / `std::gcd`。
- 求「区间最值的下标」时，`st` 存下标而非值，比较时再取值。
- 数组会修改时不能用 ST 表，请改用线段树或树状数组。

## 变体：二维 ST 表

处理二维静态矩形最值：$st[k_1][k_2][i][j]$ 表示以 $(i, j)$ 为左上角、高 $2^{k_1}$、宽 $2^{k_2}$ 的矩形最值，查询时用 4 个块覆盖：

```cpp
int query(int x1, int y1, int x2, int y2) {
    int kx = lg[x2 - x1 + 1], ky = lg[y2 - y1 + 1];
    return max({st[kx][ky][x1][y1],
                st[kx][ky][x2 - (1 << kx) + 1][y1],
                st[kx][ky][x1][y2 - (1 << ky) + 1],
                st[kx][ky][x2 - (1 << kx) + 1][y2 - (1 << ky) + 1]});
}
```

## 常见应用

- 静态区间最值 / $\gcd$ / 按位与 / 按位或；
- 倍增求 LCA 时的辅助结构（欧拉序 + ST 表，$O(1)$ 查询）；
- 「求每个位置左右第一个比自己大/小的元素」类单调栈问题的 RMQ 替代方案。

## 练习题

| 题目 | 难度 | 考点 |
| --- | --- | --- |
| [洛谷 P3865 【模板】ST 表 & RMQ](https://www.luogu.com.cn/problem/P3865) | 普及/提高− | 基础模板 |
| [洛谷 P2880 [USACO07JAN] Balanced Lineup G](https://www.luogu.com.cn/problem/P2880) | 普及/提高− | 区间极差 |
| [洛谷 P2251 质量检测](https://www.luogu.com.cn/problem/P2251) | 普及− | 滑动窗口最值 |
| [洛谷 P2412 查单词](https://www.luogu.com.cn/problem/P2412) | 普及/提高− | 字符串最值 |
