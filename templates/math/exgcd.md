---
title: 扩展欧几里得（exgcd）与线性同余方程
description: 扩展欧几里得算法求 ax+by=gcd(a,b) 的一组解，含逆元、线性同余方程与不定方程通解。
category: math
tags:
  - 扩展欧几里得
  - exgcd
  - 逆元
  - 线性同余方程
  - 数论
languages:
  - cpp
  - python
---

# 扩展欧几里得（exgcd）与线性同余方程

扩展欧几里得在求 $\gcd(a, b)$ 的同时，给出**贝祖等式**的一组整数解：

$$ ax + by = \gcd(a, b) $$

这是求解线性同余方程 $ax \equiv c \pmod m$、求模逆元、求解二元不定方程的基础工具。

## 核心思想

由欧几里得算法 $\gcd(a, b) = \gcd(b,\ a \bmod b)$，递归求解 $b x' + (a \bmod b) y' = g$，再回代：

$$ a \bmod b = a - \left\lfloor \frac{a}{b} \right\rfloor b $$

$$ g = b x' + \left(a - \left\lfloor \tfrac{a}{b} \right\rfloor b\right) y' = a y' + b\left(x' - \left\lfloor \tfrac{a}{b} \right\rfloor y'\right) $$

对比 $ax + by = g$ 得递推式：

$$ x = y', \qquad y = x' - \left\lfloor \frac{a}{b} \right\rfloor y' $$

递归边界：$b = 0$ 时 $x = 1,\ y = 0$。

| 用途 | 条件 | 结论 |
| --- | --- | --- |
| 求 $ax + by = g$ | 恒有解 | 一组特解 $(x_0, y_0)$ |
| 求 $ax \equiv 1 \pmod m$ 的逆元 | $\gcd(a, m) = 1$ | $x \bmod m$ |
| 求 $ax \equiv c \pmod m$ | $\gcd(a, m) \mid c$ | 有 $\gcd(a, m)$ 个模 $m$ 不同的解 |
| 求 $ax + by = c$ | $\gcd(a, b) \mid c$ | 通解由特解加 $t \cdot (b/g, -a/g)$ |

## 模板代码

::: code-group

```cpp [exgcd.cpp]
#include <bits/stdc++.h>
using namespace std;
using ll = long long;

// 求 ax + by = gcd(a, b) 的一组解，返回 gcd(a, b)
// 注意：x、y 是传出参数
ll exgcd(ll a, ll b, ll& x, ll& y) {
    if (b == 0) {
        x = 1;
        y = 0;
        return a;
    }
    ll x1, y1;
    ll g = exgcd(b, a % b, x1, y1);
    x = y1;
    y = x1 - (a / b) * y1;
    return g;
}

// 求 a 在模 m 下的逆元，要求 gcd(a, m) == 1；无解返回 -1
ll modInverse(ll a, ll m) {
    ll x, y;
    ll g = exgcd(a, m, x, y);
    if (g != 1) return -1;
    return (x % m + m) % m;
}

// 求解 ax ≡ c (mod m)，返回 [0, m) 内的最小非负解；无解返回 -1
ll linearCongruence(ll a, ll c, ll m) {
    ll x, y;
    ll g = exgcd(a, m, x, y);
    if (c % g != 0) return -1;
    ll mod = m / g;
    ll res = (__int128)x * (c / g) % mod;      // 防溢出
    return (res % mod + mod) % mod;
}

// 求解 ax + by = c 的一组解；无解返回 false
bool solveDiophantine(ll a, ll b, ll c, ll& x, ll& y) {
    ll g = exgcd(a, b, x, y);
    if (c % g != 0) return false;
    x *= c / g;
    y *= c / g;
    return true;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    ll a, b;
    cin >> a >> b;

    ll x, y;
    ll g = exgcd(a, b, x, y);
    cout << "gcd = " << g << '\n';
    cout << x << ' ' << y << '\n';             // ax + by = g

    // 把特解调整到最小非负
    ll k = x / (b / g);                        // 利用通解 x = x0 + t * (b/g)
    x -= k * (b / g);
    y += k * (a / g);
    while (x < 0) { x += b / g; y -= a / g; }
    cout << x << ' ' << y << '\n';

    return 0;
}
```

```python [exgcd.py]
def exgcd(a: int, b: int) -> tuple[int, int, int]:
    """返回 (g, x, y)，满足 a*x + b*y = g = gcd(a, b)。

    使用迭代写法，避免深递归；Python 整数无溢出问题。
    """
    old_r, r = a, b
    old_s, s = 1, 0
    old_t, t = 0, 1

    while r != 0:
        q = old_r // r
        old_r, r = r, old_r - q * r
        old_s, s = s, old_s - q * s
        old_t, t = t, old_t - q * t

    return old_r, old_s, old_t


def mod_inverse(a: int, m: int) -> int:
    """求 a 在模 m 下的逆元；gcd(a, m) != 1 时返回 -1。"""
    g, x, _ = exgcd(a, m)
    if g != 1:
        return -1
    return x % m


def linear_congruence(a: int, c: int, m: int) -> int:
    """求解 a*x ≡ c (mod m)，返回 [0, m) 内最小非负解；无解返回 -1。"""
    g, x, _ = exgcd(a, m)
    if c % g != 0:
        return -1
    mod = m // g
    return (x * (c // g)) % mod


def solve_diophantine(a: int, b: int, c: int) -> tuple[int, int] | None:
    """求解 a*x + b*y = c，返回一组解；无解返回 None。"""
    g, x, y = exgcd(a, b)
    if c % g != 0:
        return None
    return x * (c // g), y * (c // g)


def main() -> None:
    import sys

    data = sys.stdin.buffer.read().split()
    a, b = int(data[0]), int(data[1])

    g, x, y = exgcd(a, b)
    print("gcd =", g)
    print(x, y)

    # 调整到最小非负解（通解 x = x0 + t * (b/g)）
    step_x, step_y = b // g, a // g
    k = x // step_x if step_x else 0
    x -= k * step_x
    y += k * step_y
    while x < 0:
        x += step_x
        y -= step_y
    print(x, y)


if __name__ == "__main__":
    main()
```

:::

## 中国剩余定理（CRT）

求解同余方程组 $x \equiv a_i \pmod{m_i}$（模数两两互质）：

$$ M = \prod m_i, \qquad M_i = \frac{M}{m_i}, \qquad x = \sum a_i M_i \cdot \text{inv}(M_i, m_i) \bmod M $$

::: code-group

```cpp [crt.cpp]
// 模数两两互质的情形
ll crt(const vector<ll>& a, const vector<ll>& m) {
    ll M = 1;
    for (ll x : m) M *= x;
    ll res = 0;
    for (size_t i = 0; i < a.size(); ++i) {
        ll Mi = M / m[i];
        ll inv = modInverse(Mi % m[i], m[i]);
        res = (res + (__int128)a[i] * Mi % M * inv) % M;
    }
    return (res % M + M) % M;
}
```

```python [crt.py]
def crt(a: list[int], m: list[int]) -> int:
    """模数两两互质的中国剩余定理。"""
    M = 1
    for x in m:
        M *= x
    res = 0
    for ai, mi in zip(a, m):
        Mi = M // mi
        res += ai * Mi * mod_inverse(Mi % mi, mi)
    return res % M
```

:::

::: tip 模数不互质怎么办
使用**扩展中国剩余定理（excrt）**：逐个合并方程，每次用 exgcd 判断 $a_1 - a_2$ 能否被 $\gcd(m_1, m_2)$ 整除，能则合并成一个新的同余方程。核心代码不超过 15 行，可自行搜索补充。
:::

## 注意事项

1. **`a % b` 的符号**：C++ 中负数取模结果为负，`(x % m + m) % m` 是必须的归一化写法；Python 的 `%` 天然返回非负，无需额外处理。
2. **`x * (c / g)` 溢出**：模数接近 `long long` 上限时必须用 `__int128` 中转（本模板已处理）。
3. **逆元存在的条件**：$\gcd(a, m) = 1$。若 $m$ 是质数，可用费马小定理 $a^{m-2}$ 快速求逆；否则只能用 exgcd。
4. **通解公式**：$ax + by = c$ 的通解为 $x = x_0 + t \cdot \frac{b}{g}$，$y = y_0 - t \cdot \frac{a}{g}$，$t \in \mathbb{Z}$。求最小正整数解时注意除法在 C++ 中是向零取整，需要额外修正。

## 常见应用

- 求模逆元（非质数模数场景）；
- 求解线性同余方程 $ax \equiv c \pmod m$；
- 求解二元一次不定方程 $ax + by = c$；
- 中国剩余定理 / 扩展中国剩余定理的合并过程；
- 求解同余式组、计算模意义下的分数。

## 练习题

| 题目 | 难度 | 考点 |
| --- | --- | --- |
| [洛谷 P1082 [NOIP2012] 同余方程](https://www.luogu.com.cn/problem/P1082) | 普及/提高− | exgcd 求逆元 |
| [洛谷 P5656 【模板】二元一次不定方程](https://www.luogu.com.cn/problem/P5656) | 提高+/省选− | 不定方程通解 |
| [洛谷 P1495 【模板】中国剩余定理（CRT）](https://www.luogu.com.cn/problem/P1495) | 提高+/省选− | CRT |
| [洛谷 P4777 【模板】扩展中国剩余定理（EXCRT）](https://www.luogu.com.cn/problem/P4777) | 提高+/省选− | 模数不互质 |
