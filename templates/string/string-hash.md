---
title: 字符串哈希（String Hash）
description: 双模数多项式哈希模板，支持 O(1) 子串哈希与 LCP 二分，含防卡哈希的随机化技巧。
category: string
tags:
  - 字符串哈希
  - Hash
  - 多项式哈希
  - 双模数
  - LCP
languages:
  - cpp
  - python
---

# 字符串哈希（String Hash）

把字符串映射为整数，从而在 $O(1)$ 内比较两个子串是否相等。竞赛中最常用的是**多项式哈希**。

## 核心思想

选定基数 $B$ 与模数 $M$，定义前缀哈希：

$$ H_i = \left(\sum_{k=0}^{i-1} s_k \cdot B^{\,i-1-k}\right) \bmod M $$

则子串 $s[l..r]$ 的哈希为：

$$ \text{hash}(l, r) = H_{r+1} - H_l \cdot B^{\,r - l + 1} \bmod M $$

模数取大质数并用 `long long` 自然溢出，或使用**双模数**（两个不同质数）降低碰撞概率。

| 方案 | 碰撞概率 | 说明 |
| --- | --- | --- |
| 单模数（$10^9+7$） | 可被构造数据攻击 | 简单，但竞赛中容易被卡 |
| 自然溢出（`unsigned long long`） | 可被构造数据攻击 | 代码最短，同样易被卡 |
| 双模数 | 约 $10^{-18}$ | 推荐，开销可接受 |
| 随机基数 | 极低 | 配合双模数最稳，能防定向 hack |

## 模板代码

::: code-group

```cpp [string_hash.cpp]
#include <bits/stdc++.h>
using namespace std;
using ll = long long;
using ull = unsigned long long;

// 双模数多项式哈希：M1、M2 为大质数，B 为随机基数
struct DoubleHash {
    static constexpr ll M1 = 1000000007LL;
    static constexpr ll M2 = 1000000009LL;
    ll B1, B2;

    vector<ll> h1, h2, p1, p2;

    explicit DoubleHash(const string& s) {
        // 随机基数：防止被构造数据定向攻击（用固定种子便于复现）
        mt19937_64 rng(chrono::steady_clock::now().time_since_epoch().count());
        B1 = (ll)(rng() % (M1 - 300) + 150);
        B2 = (ll)(rng() % (M2 - 300) + 150);

        int n = (int)s.size();
        h1.assign(n + 1, 0); h2.assign(n + 1, 0);
        p1.assign(n + 1, 1); p2.assign(n + 1, 1);

        for (int i = 0; i < n; ++i) {
            p1[i + 1] = p1[i] * B1 % M1;
            p2[i + 1] = p2[i] * B2 % M2;
            h1[i + 1] = (h1[i] * B1 + (ull)s[i]) % M1;
            h2[i + 1] = (h2[i] * B2 + (ull)s[i]) % M2;
        }
    }

    // 子串 s[l..r] 的哈希（l, r 为 0-indexed，闭区间）
    pair<ll, ll> get(int l, int r) const {
        ll x1 = (h1[r + 1] - h1[l] * p1[r - l + 1] % M1 + M1) % M1;
        ll x2 = (h2[r + 1] - h2[l] * p2[r - l + 1] % M2 + M2) % M2;
        return {x1, x2};
    }

    bool equal(int l1, int r1, int l2, int r2) const {
        return get(l1, r1) == get(l2, r2);
    }

    // 最长公共前缀长度（从 a、b 两个位置开始），二分 + 哈希
    int lcp(int a, int b, int n) const {
        int lo = 0, hi = n - max(a, b);        // 上界：不越界的最长长度
        while (lo < hi) {
            int mid = (lo + hi + 1) >> 1;
            if (get(a, a + mid - 1) == get(b, b + mid - 1)) lo = mid;
            else hi = mid - 1;
        }
        return lo;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string s;
    cin >> s;
    int n = (int)s.size();

    DoubleHash h(s);

    int q;
    cin >> q;
    while (q--) {
        int l1, r1, l2, r2;
        cin >> l1 >> r1 >> l2 >> r2;          // 0-indexed
        cout << (h.equal(l1, r1, l2, r2) ? "Yes" : "No") << '\n';
    }
    return 0;
}
```

```python [string_hash.py]
import random

M1 = 1_000_000_007
M2 = 1_000_000_009


class DoubleHash:
    """双模数多项式哈希，支持 O(1) 子串比较与 O(log n) 求 LCP。"""

    __slots__ = ("n", "b1", "b2", "h1", "h2", "p1", "p2")

    def __init__(self, s: str, seed: int | None = None) -> None:
        rng = random.Random(seed)             # 传入 seed 可复现，不传则随机
        self.b1 = rng.randrange(150, M1 - 150)
        self.b2 = rng.randrange(150, M2 - 150)

        self.n = n = len(s)
        h1 = [0] * (n + 1)
        h2 = [0] * (n + 1)
        p1 = [1] * (n + 1)
        p2 = [1] * (n + 1)

        for i, ch in enumerate(s):
            c = ord(ch)
            p1[i + 1] = p1[i] * self.b1 % M1
            p2[i + 1] = p2[i] * self.b2 % M2
            h1[i + 1] = (h1[i] * self.b1 + c) % M1
            h2[i + 1] = (h2[i] * self.b2 + c) % M2

        self.h1, self.h2, self.p1, self.p2 = h1, h2, p1, p2

    def get(self, l: int, r: int) -> tuple[int, int]:
        """子串 s[l..r] 的哈希（闭区间，0-indexed）。"""
        x1 = (self.h1[r + 1] - self.h1[l] * self.p1[r - l + 1]) % M1
        x2 = (self.h2[r + 1] - self.h2[l] * self.p2[r - l + 1]) % M2
        return x1, x2

    def equal(self, l1: int, r1: int, l2: int, r2: int) -> bool:
        return r1 - l1 == r2 - l2 and self.get(l1, r1) == self.get(l2, r2)

    def lcp(self, a: int, b: int) -> int:
        """从 a、b 两个位置开始的最长公共前缀长度。"""
        lo, hi = 0, self.n - max(a, b)
        while lo < hi:
            mid = (lo + hi + 1) >> 1
            if self.get(a, a + mid - 1) == self.get(b, b + mid - 1):
                lo = mid
            else:
                hi = mid - 1
        return lo


def main() -> None:
    import sys

    data = sys.stdin.buffer.read().split()
    s = data[0].decode()
    h = DoubleHash(s, seed=20261012)

    q = int(data[1])
    idx = 2
    out: list[str] = []
    for _ in range(q):
        l1, r1, l2, r2 = (int(data[idx + k]) for k in range(4))
        idx += 4
        out.append("Yes" if h.equal(l1, r1, l2, r2) else "No")
    sys.stdout.write("\n".join(out))


if __name__ == "__main__":
    main()
```

:::

## 典型应用

### 判断回文串

对原串和反串各建一份哈希，判断 $s[l..r]$ 与反串对应区间是否相等。

### 最长回文子串（哈希 + 二分）

枚举中心，对回文半径二分，用哈希判断——$O(n \log n)$，比 Manacher 慢但代码短。

### 字符串去重

把所有子串（或所有后缀）的哈希放入 `set`，去重计数。注意需要 `n(n+1)/2` 个哈希，适用于 $n \le 5000$ 的情形。

### 替代 KMP 做匹配

直接比较子串哈希，$O(1)$ 判断模式串是否出现，总复杂度 $O(n)$。

## 防卡哈希要点

1. **必须用随机基数**：固定基数（如 `131`、`233`）会被出题人构造数据定向 hack。使用 `chrono` / `random` 生成随机基数。
2. **双模数优于自然溢出**：`unsigned long long` 自然溢出等价于模 $2^{64}$，存在已知的构造方法可以卡掉。
3. **不要用 `unordered_map` 存哈希键**：C++ 中 `unordered_map` 对整数有反哈希攻击，改用 `map` 或自定义哈希函数。
4. **Python 中注意 `%` 的结果**：Python 的 `%` 对负数返回非负值，比 C++ 更省心；但 `ord()` 转换仍要注意编码（统一用 `bytes` 更稳）。

## 注意事项

1. **子串长度必须相等**再比较哈希，否则要先判长度。
2. **哈希冲突是小概率事件**，但竞赛中一旦被 hack 就是 WA。关键题目请优先考虑后缀数组 / 后缀自动机等确定性算法。
3. **`lcp` 二分的上界**：`n - max(a, b)` 保证不越界，写错会导致访问越界。
4. **C++ 乘法溢出**：模数在 $10^9$ 量级时，两个小于模数的数相乘会超过 `int`，必须用 `long long`。

## 练习题

| 题目 | 难度 | 考点 |
| --- | --- | --- |
| [洛谷 P3370 【模板】字符串哈希](https://www.luogu.com.cn/problem/P3370) | 普及− | 基础去重 |
| [洛谷 P4824 [USACO15FEB] Censoring S](https://www.luogu.com.cn/problem/P4824) | 提高+/省选− | 哈希 + 栈 |
| [洛谷 P3805 【模板】Manacher 算法](https://www.luogu.com.cn/problem/P3805) | 普及/提高− | 哈希二分解法对照 |
| [洛谷 P3763 [TJOI2017] DNA](https://www.luogu.com.cn/problem/P3763) | 提高+/省选− | 哈希 + LCP 跳跃 |
