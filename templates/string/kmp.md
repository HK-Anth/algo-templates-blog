---
title: KMP 字符串匹配
description: KMP 算法求 next 数组与模式串匹配位置，含 next 数组的周期性质与最小循环节应用。
category: string
tags:
  - KMP
  - 字符串匹配
  - next数组
  - 前缀函数
  - 循环节
languages:
  - cpp
  - python
---

# KMP 字符串匹配

KMP 在 $O(n + m)$ 时间内完成模式串匹配，核心是**前缀函数**（常称 `next` 数组）——它记录了「失配时应该跳到哪个位置继续匹配」，从而避免主串指针回退。

## 核心思想

对模式串 $p$，定义前缀函数：

$$ \pi_i = \max\{\, k < i+1 \;:\; p[0..k-1] = p[i-k+1..i] \,\} $$

即 $p$ 的前缀 $p[0..i]$ 中，**最长的、既是真前缀又是真后缀**的串的长度。

匹配过程中，主串指针 $i$ 只前进不回退；失配时把模式串指针 $j$ 回退到 $\pi_{j-1}$。

| 复杂度 | 值 |
| --- | --- |
| 预处理（求 π） | $O(m)$ |
| 匹配 | $O(n)$ |
| 总计 | $O(n + m)$ |

## 模板代码

::: code-group

```cpp [kmp.cpp]
#include <bits/stdc++.h>
using namespace std;

// 求前缀函数（next 数组），pi[i] 表示 s[0..i] 的最长 border 长度
vector<int> prefixFunction(const string& s) {
    int n = (int)s.size();
    vector<int> pi(n, 0);
    for (int i = 1; i < n; ++i) {
        int j = pi[i - 1];
        while (j > 0 && s[i] != s[j]) j = pi[j - 1];   // 沿 border 链回退
        if (s[i] == s[j]) ++j;
        pi[i] = j;
    }
    return pi;
}

// 返回模式串 p 在文本串 t 中所有出现位置（0-indexed 起始下标）
vector<int> kmpSearch(const string& t, const string& p) {
    vector<int> res;
    if (p.empty()) return res;
    int m = (int)p.size();
    vector<int> pi = prefixFunction(p);

    int j = 0;                                          // 已匹配的模式串长度
    for (int i = 0; i < (int)t.size(); ++i) {
        while (j > 0 && t[i] != p[j]) j = pi[j - 1];
        if (t[i] == p[j]) ++j;
        if (j == m) {
            res.push_back(i - m + 1);                   // 找到一个匹配
            j = pi[j - 1];                              // 继续找重叠匹配
        }
    }
    return res;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string t, p;
    cin >> t >> p;

    vector<int> pi = prefixFunction(p);
    for (int i = 0; i < (int)pi.size(); ++i)
        cout << pi[i] << " \n"[i + 1 == (int)pi.size()];

    vector<int> pos = kmpSearch(t, p);
    cout << pos.size() << '\n';
    for (size_t i = 0; i < pos.size(); ++i)
        cout << pos[i] << " \n"[i + 1 == pos.size()];

    return 0;
}
```

```python [kmp.py]
def prefix_function(s: str) -> list[int]:
    """前缀函数：pi[i] 表示 s[:i+1] 的最长 border（真前缀=真后缀）长度。"""
    n = len(s)
    pi = [0] * n
    for i in range(1, n):
        j = pi[i - 1]
        while j > 0 and s[i] != s[j]:
            j = pi[j - 1]           # 沿 border 链回退
        if s[i] == s[j]:
            j += 1
        pi[i] = j
    return pi


def kmp_search(t: str, p: str) -> list[int]:
    """返回 p 在 t 中所有出现位置（0-indexed 起始下标）。"""
    res: list[int] = []
    if not p:
        return res
    m = len(p)
    pi = prefix_function(p)

    j = 0                            # 已匹配的模式串长度
    for i, ch in enumerate(t):
        while j > 0 and ch != p[j]:
            j = pi[j - 1]
        if ch == p[j]:
            j += 1
        if j == m:
            res.append(i - m + 1)    # 找到一个匹配
            j = pi[j - 1]            # 继续找重叠匹配
    return res


def main() -> None:
    import sys

    data = sys.stdin.buffer.read().split()
    t = data[0].decode()
    p = data[1].decode()

    pi = prefix_function(p)
    print(" ".join(map(str, pi)))

    pos = kmp_search(t, p)
    print(len(pos))
    print(" ".join(map(str, pos)))


if __name__ == "__main__":
    main()
```

:::

## 前缀函数的三大经典应用

### 1. 最小循环节

若长度为 $n$ 的串 $s$ 满足 $n \bmod (n - \pi_{n-1}) = 0$，则 $s$ 由长度为 $n - \pi_{n-1}$ 的循环节重复 $n / (n - \pi_{n-1})$ 次构成。

```cpp
int n = (int)s.size();
int len = n - pi[n - 1];          // 最小循环节长度
bool isRepeated = (n % len == 0);
int times = isRepeated ? n / len : 1;
```

### 2. 求所有 border（前后缀相等）

沿 $\pi$ 链不断回退即可枚举全部 border：

```cpp
vector<int> borders;
for (int k = pi[n - 1]; k > 0; k = pi[k - 1]) borders.push_back(k);
reverse(borders.begin(), borders.end());   // 从小到大
```

### 3. 统计每个前缀出现次数

先用 KMP 统计每个长度作为「完整匹配」的次数，再按 $\pi$ 链从长到短累加：

```cpp
vector<long long> cnt(n + 1, 0);
for (int i = 0; i < n; ++i) cnt[pi[i]]++;       // 每个位置贡献一次
for (int i = n; i >= 1; --i) cnt[pi[i - 1]] += cnt[i];
for (int i = 1; i <= n; ++i) cnt[i]++;          // 加上自身出现的一次
```

## 注意事项

1. **下标约定**：本模板 `pi[i]` 定义在「长度」语义上（`pi[i]` 是 $s[0..i]$ 的最长 border 长度）。另一种常见写法把 `next[i]` 定义为「$s[0..i-1]$ 的最长 border 长度」，两者相差一位，混用会出错。
2. **`j` 的回退目标**：失配时 `j = pi[j - 1]`，注意是 `j - 1` 而不是 `j`。
3. **匹配成功后继续**：找到一次匹配后 `j = pi[j - 1]`，这样才能找出重叠的匹配（如 `aa` 在 `aaa` 中出现两次）。
4. **字符串下标访问**：Python 中 `s[i]` 是字符串，比较效率略低于 C++；超长串可改用 `bytes` 或 `array`。

## 常见应用

- 单模式串匹配、统计出现次数与位置；
- 最小循环节、周期串判定；
- 求字符串所有 border，以及「最长公共前后缀」类问题；
- KMP 自动机（把 `pi` 扩展为完整的转移函数），用于多模式串的 AC 自动机基础。

## 练习题

| 题目 | 难度 | 考点 |
| --- | --- | --- |
| [洛谷 P3375 【模板】KMP](https://www.luogu.com.cn/problem/P3375) | 普及/提高− | 基础模板 |
| [洛谷 P4391 [BOI2009] Radio Transmission 无线传输](https://www.luogu.com.cn/problem/P4391) | 普及/提高− | 最小循环节 |
| [洛谷 P2375 [NOI2014] 动物园](https://www.luogu.com.cn/problem/P2375) | 提高+/省选− | 前缀函数 + 倍增/双指针 |
| [Codeforces 432D Prefixes and Suffixes](https://codeforces.com/problemset/problem/432/D) | 2000 | border + 出现次数统计 |
