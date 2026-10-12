---
title: 数位 DP（Digit DP）
description: 记忆化搜索式数位 DP 模板，处理区间内满足数位限制的数字计数，含前导零、上下界与状态设计。
category: dp
tags:
  - 数位DP
  - 动态规划
  - 记忆化搜索
  - 计数
  - 前导零
languages:
  - cpp
  - python
---

# 数位 DP（Digit DP）

数位 DP 用于统计**区间 $[L, R]$ 内满足某种数位条件**的数字个数，例如「不含连续的 4 和 9」「数位之和能被 7 整除」「二进制表示中 1 的个数不超过 $k$」。

## 核心思想

把数字按位拆开，从高位到低位逐位确定，用**记忆化搜索**实现：

- `pos`：当前处理到第几位；
- `tight`：前缀是否已经与上界完全相等。若 `tight == true`，当前位只能枚举到 `limit`；否则可以枚举到 9；
- `lead`：是否为前导零（影响「是否已开始计数」）；
- 其余参数：题目自定义的状态（如数位和、上一位数字、是否出现过某模式）。

区间答案用前缀和差分：$\text{count}(L, R) = \text{solve}(R) - \text{solve}(L - 1)$。

**记忆化的关键**：只有在 `!tight && !lead` 时才能记忆化，因为 `tight` / `lead` 为真时状态依赖于具体前缀，不通用。

| 复杂度 | 值 |
| --- | --- |
| 时间 | $O(\text{位数} \times \text{状态数} \times 10)$ |
| 空间 | $O(\text{位数} \times \text{状态数})$ |

## 模板代码

以「统计 $[L, R]$ 中数位不含连续 `49`，且数位和能被 $m$ 整除的数字个数」为例：

::: code-group

```cpp [digit_dp.cpp]
#include <bits/stdc++.h>
using namespace std;
using ll = long long;

struct DigitDP {
    int m = 1;                                     // 模数
    vector<int> dig;                               // 上界 x 的各数位（高位在前）
    // dp[pos][rem][last][started]
    //   pos    : 当前处理到第几位
    //   rem    : 已确定数位之和 % m
    //   last   : 上一位数字，10 表示「还没有非零数位」
    //   started: 是否已经出现过非零数位（用于排除前导零）
    // 初值 -1 表示尚未计算；仅当 !tight 时才写入与读取。
    vector<vector<vector<vector<ll>>>> dp;

    ll solve(ll x) {                               // 统计 [0, x] 内满足条件的数字个数
        if (x < 0) return 0;
        dig.clear();
        if (x == 0) dig.push_back(0);
        while (x > 0) {
            dig.push_back((int)(x % 10));
            x /= 10;
        }
        reverse(dig.begin(), dig.end());

        int n = (int)dig.size();
        dp.assign(n + 1,
                  vector<vector<vector<ll>>>(m,
                      vector<vector<ll>>(11, vector<ll>(2, -1))));
        return dfs(0, 0, 10, 0, true);
    }

    ll dfs(int pos, int rem, int last, int started, bool tight) {
        if (pos == (int)dig.size())
            return (started && rem == 0) ? 1 : 0;  // 数字 0 不计入（started 为假）

        if (!tight && dp[pos][rem][last][started] >= 0)
            return dp[pos][rem][last][started];

        int up = tight ? dig[pos] : 9;
        ll res = 0;
        for (int d = 0; d <= up; ++d) {
            if (started && last == 4 && d == 9) continue;   // 禁止出现连续 49
            int nStarted = started || (d != 0);
            int nLast = nStarted ? d : 10;                  // 未开始时不记录 last
            res += dfs(pos + 1, (rem + d) % m, nLast, nStarted, tight && (d == up));
        }

        if (!tight) dp[pos][rem][last][started] = res;
        return res;
    }

    ll countInRange(ll L, ll R) {                  // 区间答案 = 前缀和差分
        return solve(R) - solve(L - 1);
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    ll L, R;
    int m;
    cin >> L >> R >> m;

    DigitDP solver;
    solver.m = m;
    cout << solver.countInRange(L, R) << '\n';
    return 0;
}
```

```python [digit_dp.py]
import sys
from functools import lru_cache


def count_valid(L: int, R: int, m: int) -> int:
    """统计 [L, R] 中「数位不含连续 49」且「数位和能被 m 整除」的数字个数。"""

    def solve(x: int) -> int:
        if x < 0:
            return 0
        digits = list(map(int, str(x)))
        n = len(digits)

        @lru_cache(maxsize=None)
        def dfs(pos: int, rem: int, last: int, started: bool, tight: bool) -> int:
            if pos == n:
                return 1 if (started and rem == 0) else 0

            up = digits[pos] if tight else 9
            total = 0
            for d in range(up + 1):
                if started and last == 4 and d == 9:
                    continue                      # 禁止出现连续 49
                n_started = started or d != 0
                # 尚未开始计数时，把 last 记为 -1，避免把前导零当作数字 0
                n_last = d if n_started else -1
                total += dfs(
                    pos + 1,
                    (rem + d) % m,
                    n_last,
                    n_started,
                    tight and d == up,
                )
            return total

        # 注意：tight=True 的路径每个前缀只会走一次，缓存它不会引入错误；
        # 但每次 solve 结束后清空缓存，避免不同上界之间互相污染。
        res = dfs(0, 0, -1, False, True)
        dfs.cache_clear()
        return res

    return solve(R) - solve(L - 1)


def main() -> None:
    data = sys.stdin.buffer.read().split()
    L, R, m = int(data[0]), int(data[1]), int(data[2])
    print(count_valid(L, R, m))


if __name__ == "__main__":
    main()
```

:::

## 状态设计速查

| 题目要求 | 需要增加的状态 |
| --- | --- |
| 数位和 / 数位积 | `sum`（必要时对模数取余） |
| 相邻位限制（不含 49、不出现相同数字） | `last`（上一位数字） |
| 是否出现某数字 / 某模式 | `mask`（10 位二进制掩码）或布尔标记 |
| 回文数 | 记录已确定的前半部分 |
| 数位之积为 $k$ | 对 $k$ 的因子离散化后作为状态 |
| 数字本身模 $p$ | `rem`（当前前缀值 $\bmod p$） |

## 注意事项

1. **前导零必须单独处理**：否则 `0` 会被当成一个「上一位是 0」的数字，导致相邻位限制被误判。
2. **只在 `!tight` 时记忆化**：`tight` 为真的路径只走一次，缓存它没有意义，还可能引入错误。
3. **上界减一**：求 $[L, R]$ 时用 `solve(R) - solve(L - 1)`，注意 $L = 0$ 时 `solve(-1)` 要返回 0。
4. **模数状态过大时**：可以把状态改为「数位和的具体值」而非取余，或者对模数的因子做离散化压缩状态。
5. **Python 递归深度**：位数一般不超过 20，无需调整；但 `lru_cache` 的键会包含 `tight`，注意每轮 `solve` 后清空缓存（本模板已 `cache_clear`）。

## 练习题

| 题目 | 难度 | 考点 |
| --- | --- | --- |
| [洛谷 P2602 [ZJOI2010] 数字计数](https://www.luogu.com.cn/problem/P2602) | 普及/提高− | 每个数字出现次数 |
| [洛谷 P2657 [SCOI2009] windy 数](https://www.luogu.com.cn/problem/P2657) | 普及/提高− | 相邻位差值限制 |
| [洛谷 P4124 [CQOI2016] 手机号码](https://www.luogu.com.cn/problem/P4124) | 提高+/省选− | 多条件组合 + 前导零 |
| [洛谷 P4127 [AHOI2009] 同类分布](https://www.luogu.com.cn/problem/P4127) | 提高+/省选− | 枚举模数 + 数位和 |
| [洛谷 P3413 SAC#1 - 萌数](https://www.luogu.com.cn/problem/P3413) | 提高+/省选− | 回文串判定 |
