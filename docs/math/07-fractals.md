---
title: 7.分形
slug: '7'
mapShort: 分形
description: Mandelbrot、Julia、Koch 雪花、Sierpinski 地毯、Barnsley 羊齿——五条被反复放大的曲线，把"无限的复杂度"关进了一小块平面。
keywords: [分形, Mandelbrot, Julia, Koch, Sierpinski, Barnsley, 自相似]
tags: [数学]
concepts: [infinity, order, recursion]
wrapperClassName: math-page
---
import useBaseUrl from '@docusaurus/useBaseUrl';


import MathLab from '@site/src/components/MathLab';

# 7. 分形 · 一片云里藏着一千片云

*曼德勃罗（Benoit Mandelbrot，1982）："云不是球体，山不是锥体，海岸线不是圆形。" 分形几何给粗糙、破碎、无限卷曲的自然形态提供了第一套数学语言。*

---

### 主舞台 · Mandelbrot 集

<img src={useBaseUrl("/img/docs/mandelbrot_set_image_49-w900-ed36db69.png")} alt="Mandelbrot set" loading="lazy" decoding="async" />

*迭代公式 $z_{n+1} = z_n^2 + c$。黑色区域是"从 0 出发始终不飞向无穷"的 $c$ 值集合。边界处**无限放大永远有新结构**——每一颗小卫星都是整个集合的复刻。*

---

### 兄弟 · Julia 集

<img src={useBaseUrl("/img/docs/julia_set_fractal-w900-bb7fe175.png")} alt="Julia set fractal" loading="lazy" decoding="async" />

*固定 $c$、变动初值 $z_0$。Mandelbrot 集是**所有 Julia 集的地图**：c 落在黑色里 → Julia 连通；c 落在外面 → Julia 碎成康托集式尘埃。*

---

### 三条线长成雪花 · Koch Snowflake（1904）

<img src={useBaseUrl("/img/docs/kochflake-w600-808852ae.svg")} alt="Koch snowflake" loading="lazy" decoding="async" />

*每次把线段的中间三分之一"顶起"成两个尖角。**周长 ×4/3 → 无穷；面积 ×8/5 → 有限**。一条无限长的曲线围出一块有限大小的雪花。*

---

### 挖洞的艺术 · Sierpinski 地毯

<img src={useBaseUrl("/img/docs/sierpinski_carpet_6-w600-3a9c8a07.svg")} alt="Sierpinski carpet" loading="lazy" decoding="async" />

*把正方形九宫格，挖掉中间那块；对剩下 8 块递归。分形维数 ≈ 1.893（介于线与面之间）。Wacław Sierpiński 1916 年的构造。*

---

### 四条仿射变换生成一株蕨 · Barnsley Fern（1988）

<img src={useBaseUrl("/img/docs/fractal_fern_explained-w700-e4d80c26.png")} alt="Barnsley fern explained" loading="lazy" decoding="async" />

*只有四个概率化的仿射映射，从一片空白点开始迭代 → 长出一株**逼真的蕨类**。Michael Barnsley 用它证明"自然的形状可以被几行公式压缩"。*

---

## 分形的三个共同点

- **自相似**：局部与整体形态相似（严格或统计意义）
- **迭代**：由一条简单规则反复应用产生——同一条规则在编程线里叫**递归**：[Python · 函数与递归](/docs/python/5) 用 `branch(depth-1)` 两次就长出下面那棵树
- **非整数维**：Hausdorff 维数不是 1、2、3—— Koch 曲线维数 ≈ 1.26，Sierpinski 地毯 ≈ 1.89

---

## 今天在哪

- **CG 渲染**：山脉、云层、火焰、皮肤纹理（L-System + fBm）
- **天线**：分形天线（Koch 天线、Minkowski 天线）在很小体积里做出多频段
- **金融**：股价波动具**长尾 + 自相似**，Mandelbrot 1997《（分形）资本市场》挑战有效市场假说
- **医学**：肺、血管树、支气管均分形结构（用最小表面积做最大交换）
- **城市**：伦敦、东京的城市扩张分形维数 ≈ 1.7

---

## 动手 · 把维数拖出来

分形那条「缩一半、复制几份」的规则，完全可以当成滑杆。下面四个生成器与
[实验室](/lab) 的纹样组用的是同一套外壳（母题 → 参数 → 图形），只是这里每行小字报的是维数与周长。
集中试四个分形，直接去 [实验室 · 数学组](/lab#koch)。

<MathLab kind="koch">

「迭代次数」每加 1，段数一定 ×4，但周长乘上多少要看**尖峰高度**：
只有 0.866（= √3/2，顶出一个等边三角）时，四条子边才全等，周长才按 4/3 增长，
维数才是教科书里的 log4/log3 ≈ 1.2619。把尖峰压扁到 0.05，段数照样 ×4，
周长却几乎不涨（因子 1.002），维数掉回 1.001——它已经不是一条分形海岸，而是一段近似直线。
所以「维数由规则定死」这句话里，规则指的是**四条子边的长度比**，不是「顶起来」这个动作；
而底边数从 3 拉到 6 完全不改维数，它只决定雪花还是针叶团。

</MathLab>

<MathLab kind="sierpinski">

三角留 3 份、缩一半，地毯留 8 份、缩三分之一，于是维数分别是 log3/log2 ≈ 1.585 与
log8/log3 ≈ 1.893：都卡在 1 和 2 之间。地毯切到 4 层就已经是 4096 个方框——
「层数」在这里不是审美参数，是算力参数。

</MathLab>

<MathLab kind="tree">

长度比 r 才是真正的开关：r < 0.5 时总枝长收敛，用有限材料搭出无限层次；
r > 0.5 时越分越密，最后糊成一团。支气管、血管树、河流支流全部选在收敛那一侧，这不是巧合。

</MathLab>

<MathLab kind="julia">

固定一个复数 c，把所有不逃逸的初值 z₀ 画出来。直接在画面上点一下或拖一下就能换 c：
c 落在 Mandelbrot 集里 → 这枚 Julia 集连成一片；在外面 → 碎成一堆康托式尘埃。
Mandelbrot 集本身就是「把所有 c 的连通性排成一张图」，所以它是 Julia 集的目录。

</MathLab>

---

## 💡 练习题

1. **算一算**：Koch 曲线每迭代一层，段数与单段长度怎么变？$n$ 层后周长是原来的几倍？
2. **同法**：Sierpinski 地毯每层保留 8 个边长 $1/3$ 的副本，它的维数是多少？
3. **判连通**：给定参数 $c$，什么时候对应的 Julia 集是连成一片的？

<details>
<summary>参考答案</summary>

1. 段数 $\times4$、单段长 $\div3$，周长 $\times\frac{4}{3}$；$n$ 层后为 $\left(\frac{4}{3}\right)^n$ 倍，维数 $\log4/\log3\approx1.262$。
2. $\log8/\log3\approx1.893$。
3. 当 $c$ 属于 Mandelbrot 集（迭代不逃逸）时连通；在集合外则碎成康托式尘埃。

</details>

:::info[一句话带走]

**"用有限的规则生成无限的结构"**——分形是数学送给所有复杂系统科学家的一份礼物。

---

**上一**：[贝叶斯定理](./06-bayes-theorem.md)　·　**下一**：[傅里叶分析 →](./08-fourier-analysis.md)

---

*图片来自 Wikimedia Commons，公有领域 / CC 自由许可。*
:::

