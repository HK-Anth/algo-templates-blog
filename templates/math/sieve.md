---
title: 线性筛素数（欧拉筛）
description: 线性筛法 O(n) 求素数表，含最小质因子、欧拉函数、莫比乌斯函数的线性筛写法。
category: math
tags:
  - 线性筛
  - 欧拉筛
  - 素数
  - 数论
  - 积性函数
languages:
  - cpp
  - python
---

# 线性筛素数（欧拉筛）

埃氏筛的复杂度是 $O(n \log \log n)$，线性筛通过「每个合数只被它的**最小质因子**筛掉一次」，把复杂度降到 $O(n)$，同时能顺带求出最小质因子、欧拉函数、莫比乌斯函数等积性函数值。

## 核心思想

维护素数表 `primes`，对每个数 $i$ 从小到大枚举已找到的素数 $p$：

- 若 $p \mid i$，则 $\text{lpf}(i \cdot p) = p$，标记后**立即 break**（保证每个合数只被最小质因子筛一次）；
- 若 $p \nmid i$，则继续标记 $i \cdot p$。

**关键**：`if (i % p == 0) break;` 这一句是 $O(n)$ 复杂度的保证，去掉就退化成埃氏筛。

| 筛法 | 复杂度 | 可求函数 |
| --- | --- | --- |
| 埃氏筛 | $O(n \log \log n)$ | 素数表 |
| 线性筛 | $O(n)$ | 素数表、最小质因子、积性函数 |

## 模板代码

::: code-group

```cpp [linear_sieve.cpp]
#include <bits/stdc++.h>
using namespace std;

struct LinearSieve {
    vector<int> primes;      // 素数表
    vector<int> lpf;         // lpf[i]: i 的最小质因子（lpf[1] = 1）
    vector<int> phi;         // phi[i]: 欧拉函数
    vector<int> mu;          // mu[i]: 莫比乌斯函数

    explicit LinearSieve(int n) {
        lpf.assign(n + 1, 0);
        phi.assign(n + 1, 0);
        mu.assign(n + 1, 0);

        phi[1] = 1;
        mu[1] = 1;

        for (int i = 2; i <= n; ++i) {
            if (lpf[i] == 0) {                 // i 是素数
                lpf[i] = i;
                primes.push_back(i);
                phi[i] = i - 1;
                mu[i] = -1;
            }
            for (int p : primes) {
                long long v = 1LL * i * p;
                if (v > n) break;
                lpf[v] = p;
                if (i % p == 0) {              // p 是 i 的最小质因子
                    phi[v] = phi[i] * p;
                    mu[v] = 0;
                    break;                     // 保证每个合数只被筛一次
                }
                phi[v] = phi[i] * (p - 1);
                mu[v] = -mu[i];
            }
        }
    }

    bool isPrime(int x) const { return x >= 2 && lpf[x] == x; }

    // 试除分解质因数：O(sqrt(x))，适合单次询问
    vector<pair<int, int>> factorize(int x) const {
        vector<pair<int, int>> res;
        for (int p : primes) {
            if (1LL * p * p > x) break;
            if (x % p) continue;
            int c = 0;
            while (x % p == 0) { x /= p; ++c; }
            res.emplace_back(p, c);
        }
        if (x > 1) res.emplace_back(x, 1);
        return res;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, q;
    cin >> n >> q;
    LinearSieve sieve(n);

    while (q--) {
        int x;
        cin >> x;
        cout << (sieve.isPrime(x) ? "Yes" : "No") << '\n';
    }
    return 0;
}
```

```python [linear_sieve.py]
def linear_sieve(n: int) -> tuple[list[int], list[int], list[int], list[int]]:
    """线性筛：返回 (primes, lpf, phi, mu)，均以 1 为最小有效下标。"""
    lpf = [0] * (n + 1)      # 最小质因子
    phi = [0] * (n + 1)      # 欧拉函数
    mu = [0] * (n + 1)       # 莫比乌斯函数
    primes: list[int] = []

    if n >= 1:
        phi[1] = 1
        mu[1] = 1

    for i in range(2, n + 1):
        if lpf[i] == 0:                       # i 是素数
            lpf[i] = i
            primes.append(i)
            phi[i] = i - 1
            mu[i] = -1
        for p in primes:
            v = i * p
            if v > n:
                break
            lpf[v] = p
            if i % p == 0:                    # p 是 i 的最小质因子
                phi[v] = phi[i] * p
                mu[v] = 0
                break                         # 保证每个合数只被筛一次
            phi[v] = phi[i] * (p - 1)
            mu[v] = -mu[i]

    return primes, lpf, phi, mu


def main() -> None:
    import sys

    data = sys.stdin.buffer.read().split()
    n = int(data[0])
    q = int(data[1])

    primes, lpf, phi, mu = linear_sieve(n)
    is_prime = [False] * (n + 1)
    for p in primes:
        is_prime[p] = True

    out = []
    for k in range(2, 2 + q):
        x = int(data[k])
        out.append("Yes" if x <= n and is_prime[x] else "No")
    sys.stdout.write("\n".join(out))


if __name__ == "__main__":
    main()
```

:::

## 常见变体

### 只求素数表（内存更省）

不需要 `phi` / `mu` 时，只保留 `lpf` 与 `primes` 即可，空间减半。

### 区间筛（求 $[L, R]$ 内的素数）

当 $R$ 很大（如 $10^{12}$）但区间长度 $R - L + 1$ 较小时：

1. 先用线性筛求出 $\sqrt{R}$ 以内的所有素数；
2. 对每个素数 $p$，把 $[L, R]$ 中 $p$ 的倍数标记为合数。

```cpp
vector<char> isComp(R - L + 1, 0);
for (int p : primes) {                       // primes 为 sqrt(R) 以内的素数
    long long start = max(1LL * p * p, (L + p - 1) / p * p);
    for (long long j = start; j <= R; j += p)
        isComp[j - L] = 1;
}
```

### 线性求逆元

配合线性筛可以在 $O(n)$ 内求出 $1 \sim n$ 所有数在模 $p$ 下的逆元：

$$ inv_i = -\left\lfloor \frac{p}{i} \right\rfloor \cdot inv_{p \bmod i} \bmod p $$

```cpp
vector<long long> inv(n + 1);
inv[1] = 1;
for (int i = 2; i <= n; ++i)
    inv[i] = (p - p / i) * inv[p % i] % p;
```

## 注意事项

1. **`1` 不是素数**：`isPrime(1)` 必须返回 `false`，本模板用 `x >= 2` 保证。
2. **`i * p` 溢出**：C++ 中若 $n$ 接近 $2^{31}$，`i * p` 会溢出，必须用 `long long` 中转后再比较。
3. **`break` 的位置**：先标记 `lpf[v] = p`，再判断 `i % p == 0` 并 `break`。顺序写反会导致漏筛。
4. **Python 性能**：纯 Python 线性筛在 $n = 10^7$ 时较慢（约数秒）。竞赛中可用 `bytearray` 实现埃氏筛提速，或直接使用 C++ 版本。

## 常见应用

- 素数判定与素数表预处理；
- 分解质因数（配合最小质因子可在 $O(\log x)$ 内分解）；
- 欧拉函数求和、莫比乌斯反演（杜教筛的前置）；
- 线性求逆元、阶乘逆元（组合数预处理）。

## 练习题

| 题目 | 难度 | 考点 |
| --- | --- | --- |
| [洛谷 P3383 【模板】线性筛素数](https://www.luogu.com.cn/problem/P3383) | 普及/提高− | 基础模板 |
| [洛谷 P1835 素数密度](https://www.luogu.com.cn/problem/P1835) | 普及/提高− | 区间筛 |
| [洛谷 P2158 [SDOI2008] 仪仗队](https://www.luogu.com.cn/problem/P2158) | 普及/提高− | 欧拉函数前缀和 |
| [洛谷 P2522 [HAOI2011] Problem b](https://www.luogu.com.cn/problem/P2522) | 提高+/省选− | 莫比乌斯反演 |
