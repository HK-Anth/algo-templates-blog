---
title: Z 函数（扩展 KMP）
description: Z 函数的 O(n) 求法与模式匹配应用，含区间合并优化、前缀出现次数统计。
category: string
tags:
  - Z函数
  - 扩展KMP
  - 字符串匹配
  - 前缀函数
  - 线性算法
languages:
  - cpp
  - python
---

# Z 函数（扩展 KMP）

对字符串 $s$，定义 Z 函数：

$$ z_i = \text{LCP}(s,\ s[i..]) \quad (\text{即 } s \text{ 与 } s \text{ 从第 } i \text{ 位开始的后缀的最长公共前缀长度}) $$

约定 $z_0 = 0$（或 $n$，视题目而定）。Z 函数与 KMP 的 `next` 数组信息量等价，但写法更直观，且能直接回答「某个后缀与整串的最长公共前缀」类问题。

## 核心思想

维护当前**已匹配的最右区间** $[l, r)$（即 $z_l = r - l$ 且 $r$ 最大）。对于 $i \in [l, r)$：

- 令 $k = i - l$，由对称性可知 $z_i \ge \min(z_k,\ r - i)$；
- 先取这个下界，再暴力向后扩展，同时更新 $[l, r)$。

由于 $r$ 单调不减，暴力扩展的总代价是 $O(n)$。

| 复杂度 | 值 |
| --- | --- |
| 求 Z 函数 | $O(n)$ |
| 模式匹配（拼接串） | $O(n + m)$ |

## 模板代码

::: code-group

```cpp [z_function.cpp]
#include <bits/stdc++.h>
using namespace std;

// z[0] = n（表示整个串自身），z[i] = LCP(s, s[i..])
vector<int> zFunction(const string& s) {
    int n = (int)s.size();
    vector<int> z(n, 0);
    if (n == 0) return z;
    z[0] = n;

    int l = 0, r = 0;                        // 维护 [l, r) 为当前最右匹配区间
    for (int i = 1; i < n; ++i) {
        if (i < r) z[i] = min(r - i, z[i - l]);   // 利用对称性取初值
        while (i + z[i] < n && s[z[i]] == s[i + z[i]]) ++z[i];  // 暴力扩展
        if (i + z[i] > r) {                       // 更新最右区间
            l = i;
            r = i + z[i];
        }
    }
    return z;
}

// 模式匹配：返回 p 在 t 中所有出现位置（0-indexed）
vector<int> zSearch(const string& t, const string& p) {
    vector<int> res;
    if (p.empty()) return res;
    int m = (int)p.size();
    string s = p + '\1' + t;                 // 用不可能出现的字符分隔，避免越界匹配
    vector<int> z = zFunction(s);

    for (int i = m + 1; i < (int)s.size(); ++i)
        if (z[i] >= m) res.push_back(i - m - 1);
    return res;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string t, p;
    cin >> t >> p;

    vector<int> z = zFunction(t);
    for (int i = 0; i < (int)z.size(); ++i)
        cout << z[i] << " \n"[i + 1 == (int)z.size()];

    vector<int> pos = zSearch(t, p);
    cout << pos.size() << '\n';
    for (size_t i = 0; i < pos.size(); ++i)
        cout << pos[i] << " \n"[i + 1 == pos.size()];

    return 0;
}
```

```python [z_function.py]
def z_function(s: str) -> list[int]:
    """z[0] = len(s)，z[i] = LCP(s, s[i:])。"""
    n = len(s)
    z = [0] * n
    if n == 0:
        return z
    z[0] = n

    l = r = 0                          # 维护 [l, r) 为当前最右匹配区间
    for i in range(1, n):
        if i < r:
            z[i] = min(r - i, z[i - l])     # 利用对称性取初值
        while i + z[i] < n and s[z[i]] == s[i + z[i]]:
            z[i] += 1                       # 暴力扩展
        if i + z[i] > r:                    # 更新最右区间
            l, r = i, i + z[i]
    return z


def z_search(t: str, p: str) -> list[int]:
    """返回 p 在 t 中所有出现位置（0-indexed）。"""
    if not p:
        return []
    m = len(p)
    s = p + "\x01" + t                 # 用不可能出现的字符分隔
    z = z_function(s)
    return [i - m - 1 for i in range(m + 1, len(s)) if z[i] >= m]


def main() -> None:
    import sys

    data = sys.stdin.buffer.read().split()
    t = data[0].decode()
    p = data[1].decode()

    print(" ".join(map(str, z_function(t))))

    pos = z_search(t, p)
    print(len(pos))
    print(" ".join(map(str, pos)))


if __name__ == "__main__":
    main()
```

:::

## 与 KMP 的对比

| 维度 | Z 函数 | KMP 的 π 数组 |
| --- | --- | --- |
| 定义 | $z_i = \text{LCP}(s, s[i..])$ | $\pi_i$ = 前缀 $s[0..i]$ 的最长 border |
| 匹配方式 | 拼串 `p + sep + t`，检查 $z_i \ge m$ | 主串单指针扫描 + 失配回退 |
| 信息量 | 每个后缀与整串的 LCP | 每个前缀的最长 border |
| 适用场景 | 后缀与前缀匹配、字符串周期 | 前缀出现次数、最小循环节、AC 自动机 |
| 常数 | 略小（无失配回退链） | 略大 |

两者信息可互相转换，但代码写法差异较大，建议都掌握。

## 典型应用

### 字符串周期

若 $n \bmod (n - z_i) = 0$ 且 $z_i = n - i$，则长度为 $n - i$ 的前缀是该串的循环节。

### 统计每个前缀作为子串的出现次数

`z[i]` 表示以 $i$ 开头的后缀与整串前缀的最长公共长度，因此长度 $k$ 的前缀在位置 $i$ 出现一次当且仅当 $z[i] \ge k$。用差分数组统计：

```cpp
vector<long long> diff(n + 2, 0);
for (int i = 1; i < n; ++i) {          // 注意从 1 开始，排除 z[0] = n 自身
    diff[1] += 1;
    diff[z[i] + 1] -= 1;
}
// 前缀和即得每个长度的出现次数
```

### 比较两个字符串的字典序 / 求 LCP

给定两串的拼接结果，$z$ 值直接给出任意后缀与整串的 LCP，可用于后缀数组的倍增构造或字符串比较加速。

## 注意事项

1. **分隔字符必须不在字符集中**：本模板用 `'\1'` / `"\x01"`。若字符串可能包含任意字节，改用整数数组或随机化分隔符。
2. **`z[0]` 的约定**：本模板取 `z[0] = n`。部分题目要求 `z[0] = 0`，注意按题意调整。
3. **区间更新条件**：`if (i + z[i] > r)` 而不是 `>=`，用 `>` 可以避免不必要的更新（`=` 时区间没有变长）。
4. **Python 切片比较**：不要用 `s[z[i]:] == s[:...]` 这类写法，会导致复杂度退化为 $O(n^2)$，必须逐字符比较。

## 练习题

| 题目 | 难度 | 考点 |
| --- | --- | --- |
| [洛谷 P5410 【模板】扩展 KMP（Z 函数）](https://www.luogu.com.cn/problem/P5410) | 提高+/省选− | 基础模板 |
| [洛谷 P3435 [POI2006] OKR-Periods of Words](https://www.luogu.com.cn/problem/P3435) | 提高+/省选− | 周期与 border |
| [Codeforces 126B Password](https://codeforces.com/problemset/problem/126/B) | 1700 | 前后缀 + 中间出现 |
| [洛谷 P7114 [NOIP2020] 字符串匹配](https://www.luogu.com.cn/problem/P7114) | 省选/NOI− | Z 函数 + 树状数组 |
