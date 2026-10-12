---
title: 数学
description: 线性筛素数、扩展欧几里得、快速幂等数论模板。
---

# 数学

数论模板的正确性高度依赖**取模与溢出处理**。C++ 中做乘法时若模数超过 $2^{31}$，必须使用 `__int128` 或快速乘；Python 无此问题。

<TemplateList category="math" />
