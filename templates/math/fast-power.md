---
title: 快速幂与矩阵快速幂
description: 快速幂、快速乘、矩阵快速幂模板，用于 O(log n) 求幂与线性递推的加速。
category: math
tags:
  - 快速幂
  - 矩阵快速幂
  - 快速乘
  - 数论
  - 线性递推
languages:
  - cpp
  - python
---

# 快速幂与矩阵快速幂

快速幂用**二进制拆分**把 $a^n$ 的计算从 $O(n)$ 降到 $O(\log n)$；矩阵快速幂把同样的思想用到矩阵乘法上，可以在 $O(k^3 \log n)$ 内求出 $k$ 阶线性递推的第 $n$ 项。

## 核心思想

把指数 $n$ 写成二进制，$a^n = \prod_{i} a^{2^i}$（$n$ 的第 $i$ 位为 1）。迭代中不断把底数平方、指数右移：

$$ a^n = \begin{cases} (a^{n/2})^2, & n \text{ 为偶数} \\ a \cdot a^{n-1}, & n \text{ 为奇数} \end{cases} $$

矩阵快速幂完全同理，只是把「乘法」换成「矩阵乘法」，并利用矩阵乘法的结合律：

$$ M^n = \begin{cases} (M^{n/2})^2, & n \text{ 为偶数} \\ M \cdot M^{n-1}, & n \text{ 为奇数} \end{cases} $$

| 算法 | 复杂度 | 用途 |
| --- | --- | --- |
| 快速幂 | $O(\log n)$ | $a^n \bmod p$、费马小定理求逆元 |
| 快速乘 | $O(\log n)$ | 模数超 `long long` 时的乘法 |
| 矩阵快速幂 | $O(k^3 \log n)$ | $k$ 阶线性递推第 $n$ 项 |

## 模板代码

::: code-group

```cpp [fast_power.cpp]
#include <bits/stdc++.h>
using namespace std;
using ll = long long;
using i128 = __int128_t;

// 快速幂：a^n mod p
ll qpow(ll a, ll n, ll p) {
    a %= p;
    if (a < 0) a += p;
    ll res = 1 % p;
    while (n > 0) {
        if (n & 1) res = (i128)res * a % p;
        a = (i128)a * a % p;
        n >>= 1;
    }
    return res;
}

// 快速乘：a * b mod p，适用于 p 接近 1e18、直接相乘会溢出的场景
ll qmul(ll a, ll b, ll p) {
    ll res = 0;
    a %= p;
    if (a < 0) a += p;
    b %= p;
    if (b < 0) b += p;
    while (b > 0) {
        if (b & 1) res = (res + a) % p;
        a = (a + a) % p;
        b >>= 1;
    }
    return res;
}

// 费马小定理求逆元（p 为质数且 a 不被 p 整除）
ll invFermat(ll a, ll p) { return qpow(a, p - 2, p); }

// ---------------- 矩阵快速幂 ----------------
struct Matrix {
    int n;
    vector<vector<ll>> a;
    ll mod;

    Matrix(int n, ll mod, bool identity = false) : n(n), mod(mod), a(n, vector<ll>(n, 0)) {
        if (identity)
            for (int i = 0; i < n; ++i) a[i][i] = 1 % mod;
    }

    Matrix operator*(const Matrix& o) const {
        Matrix res(n, mod);
        for (int i = 0; i < n; ++i) {
            for (int k = 0; k < n; ++k) {
                if (a[i][k] == 0) continue;            // 稀疏矩阵剪枝
                ll aik = a[i][k];
                for (int j = 0; j < n; ++j) {
                    res.a[i][j] = (res.a[i][j] + (i128)aik * o.a[k][j]) % mod;
                }
            }
        }
        return res;
    }

    Matrix pow(ll e) const {
        Matrix base = *this;
        Matrix res(n, mod, true);                      // 单位矩阵
        while (e > 0) {
            if (e & 1) res = res * base;
            base = base * base;
            e >>= 1;
        }
        return res;
    }
};

// 求斐波那契第 n 项（F1 = F2 = 1）mod p
ll fib(ll n, ll p) {
    if (n <= 2) return 1 % p;
    Matrix m(2, p);
    m.a = {{1, 1}, {1, 0}};
    Matrix r = m.pow(n - 2);
    // [F_{n}, F_{n-1}]^T = M^{n-2} * [F_2, F_1]^T = M^{n-2} * [1, 1]^T
    return (r.a[0][0] + r.a[0][1]) % p;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    ll a, n, p;
    cin >> a >> n >> p;
    cout << qpow(a, n, p) << '\n';

    ll k;
    cin >> k;
    cout << fib(k, p) << '\n';
    return 0;
}
```

```python [fast_power.py]
def qpow(a: int, n: int, p: int) -> int:
    """快速幂：a^n mod p。Python 大整数无溢出，实现最简洁。"""
    res = 1 % p
    a %= p
    while n > 0:
        if n & 1:
            res = res * a % p
        a = a * a % p
        n >>= 1
    return res


def qmul(a: int, b: int, p: int) -> int:
    """快速乘：a*b mod p。Python 下等价于 a*b%p，保留以对齐 C++ 写法。"""
    return a * b % p


def inv_fermat(a: int, p: int) -> int:
    """费马小定理求逆元（p 为质数）。"""
    return qpow(a, p - 2, p)


def mat_mul(A: list[list[int]], B: list[list[int]], mod: int) -> list[list[int]]:
    """矩阵乘法，O(k^3)。"""
    n = len(A)
    m = len(B[0])
    t = len(B)
    C = [[0] * m for _ in range(n)]
    for i in range(n):
        Ai = A[i]
        Ci = C[i]
        for k in range(t):
            aik = Ai[k]
            if aik == 0:
                continue                    # 稀疏剪枝
            Bk = B[k]
            for j in range(m):
                Ci[j] = (Ci[j] + aik * Bk[j]) % mod
    return C


def mat_pow(M: list[list[int]], e: int, mod: int) -> list[list[int]]:
    """矩阵快速幂，O(k^3 log e)。"""
    n = len(M)
    res = [[1 % mod if i == j else 0 for j in range(n)] for i in range(n)]
    base = [row[:] for row in M]
    while e > 0:
        if e & 1:
            res = mat_mul(res, base, mod)
        base = mat_mul(base, base, mod)
        e >>= 1
    return res


def fib(n: int, p: int) -> int:
    """斐波那契第 n 项（F1 = F2 = 1）mod p。"""
    if n <= 2:
        return 1 % p
    M = [[1, 1], [1, 0]]
    R = mat_pow(M, n - 2, p)
    return (R[0][0] + R[0][1]) % p


def main() -> None:
    import sys

    data = sys.stdin.buffer.read().split()
    a, n, p = int(data[0]), int(data[1]), int(data[2])
    print(qpow(a, n, p))

    k = int(data[3])
    print(fib(k, p))


if __name__ == "__main__":
    main()
```

:::

## 用矩阵快速幂加速线性递推

任何形如 $f_n = c_1 f_{n-1} + c_2 f_{n-2} + \dots + c_k f_{n-k}$ 的 $k$ 阶线性递推，都能写成矩阵形式：

$$
\begin{pmatrix}
f_n \\ f_{n-1} \\ \vdots \\ f_{n-k+1}
\end{pmatrix}
=
\begin{pmatrix}
c_1 & c_2 & \cdots & c_{k-1} & c_k \\
1 & 0 & \cdots & 0 & 0 \\
0 & 1 & \cdots & 0 & 0 \\
\vdots & & \ddots & & \vdots \\
0 & 0 & \cdots & 1 & 0
\end{pmatrix}
\begin{pmatrix}
f_{n-1} \\ f_{n-2} \\ \vdots \\ f_{n-k}
\end{pmatrix}
$$

于是 $f_n$ 可以在 $O(k^3 \log n)$ 内求出。

**构造转移矩阵的口诀**：第一行填递推系数 $c_1 \dots c_k$，下面 $k-1$ 行是「次对角线为 1」的移位结构。

## 常见变体

### 带常数项的递推

$f_n = c_1 f_{n-1} + c_2 f_{n-2} + d$ 时，把状态向量扩展一维常数 1：

$$ \begin{pmatrix} f_n \\ f_{n-1} \\ 1 \end{pmatrix} = \begin{pmatrix} c_1 & c_2 & d \\ 1 & 0 & 0 \\ 0 & 0 & 1 \end{pmatrix} \begin{pmatrix} f_{n-1} \\ f_{n-2} \\ 1 \end{pmatrix} $$

### 带 $n$ 的系数

$f_n = n \cdot f_{n-1}$ 这类递推，把 $n$ 也作为状态的一部分（通常配合 $(n, 1)$ 的转移）。

### 求前缀和

在状态向量末尾追加「前缀和」这一维即可。

## 注意事项

1. **单位矩阵的初值**：`1 % mod`，当 $mod = 1$ 时所有结果都应为 0，写死 `1` 会出错。
2. **`a %= p` 后可能为负**：C++ 中负数取模需 `a += p` 修正，Python 无此问题。
3. **乘法溢出**：模数超过 $10^9$ 时必须用 `__int128` 或快速乘；Python 无溢出问题。
4. **矩阵乘法顺序**：矩阵乘法不满足交换律，`res * base` 的顺序不能颠倒。快速幂中「先乘再平方」与「先平方再乘」都可以，但要保证结果正确。
5. **$k$ 较大时**：$k > 100$ 的矩阵快速幂通常不可行，考虑 Berlekamp–Massey + 线性递推优化（$O(k^2 \log n)$）。

## 常见应用

- $a^n \bmod p$、费马小定理求逆元、扩展欧拉定理降幂；
- 斐波那契 / 卢卡斯数列等线性递推的第 $n$ 项；
- 图上路径计数（邻接矩阵的 $n$ 次幂给出长度为 $n$ 的路径数）；
- 概率 DP 的矩阵加速、生成函数的线性递推求解。

## 练习题

| 题目 | 难度 | 考点 |
| --- | --- | --- |
| [洛谷 P1226 【模板】快速幂](https://www.luogu.com.cn/problem/P1226) | 普及− | 基础模板 |
| [洛谷 P3390 【模板】矩阵快速幂](https://www.luogu.com.cn/problem/P3390) | 普及/提高− | 矩阵快速幂 |
| [洛谷 P1962 斐波那契数列](https://www.luogu.com.cn/problem/P1962) | 普及/提高− | 2 阶递推 |
| [洛谷 P1939 【模板】矩阵加速（数列）](https://www.luogu.com.cn/problem/P1939) | 普及/提高− | 3 阶递推 |
| [洛谷 P2886 [USACO07NOV] Cow Relays G](https://www.luogu.com.cn/problem/P2886) | 提高+/省选− | 图上路径计数 |
