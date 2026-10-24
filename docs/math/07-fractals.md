---
title: 7.分形
slug: '7'
mapShort: 分形
description: Mandelbrot、Julia、Koch 雪花、Sierpinski 地毯、Barnsley 羊齿——五条被反复放大的曲线，把"无限的复杂度"关进了一小块平面。
keywords: [分形, Mandelbrot, Julia, Koch, Sierpinski, Barnsley, 自相似]
tags: [数学]
wrapperClassName: math-page
---

# 7. 分形 · 一片云里藏着一千片云

*曼德勃罗（Benoit Mandelbrot，1982）："云不是球体，山不是锥体，海岸线不是圆形。" 分形几何给粗糙、破碎、无限卷曲的自然形态提供了第一套数学语言。*

---

### 主舞台 · Mandelbrot 集

![Mandelbrot set](https://commons.wikimedia.org/wiki/Special:FilePath/Mandelbrot_Set_Image_49.png?width=900)

*迭代公式 $z_{n+1} = z_n^2 + c$。黑色区域是"从 0 出发始终不飞向无穷"的 \(c\) 值集合。边界处**无限放大永远有新结构**——每一颗小卫星都是整个集合的复刻。*

---

### 兄弟 · Julia 集

![Julia set fractal](https://commons.wikimedia.org/wiki/Special:FilePath/Julia_set_fractal.png?width=900)

*固定 $c$、变动初值 $z_0$。Mandelbrot 集是**所有 Julia 集的地图**：c 落在黑色里 → Julia 连通；c 落在外面 → Julia 碎成康托集式尘埃。*

---

### 三条线长成雪花 · Koch Snowflake（1904）

![Koch snowflake](https://commons.wikimedia.org/wiki/Special:FilePath/KochFlake.svg?width=600)

*每次把线段的中间三分之一"顶起"成两个尖角。**周长 ×4/3 → 无穷；面积 ×8/5 → 有限**。一条无限长的曲线围出一块有限大小的雪花。*

---

### 挖洞的艺术 · Sierpinski 地毯

![Sierpinski carpet](https://commons.wikimedia.org/wiki/Special:FilePath/Sierpinski_carpet_6.svg?width=600)

*把正方形九宫格，挖掉中间那块；对剩下 8 块递归。分形维数 ≈ 1.893（介于线与面之间）。Wacław Sierpiński 1916 年的构造。*

---

### 四条仿射变换生成一株蕨 · Barnsley Fern（1988）

![Barnsley fern explained](https://commons.wikimedia.org/wiki/Special:FilePath/Fractal_fern_explained.png?width=700)

*只有四个概率化的仿射映射，从一片空白点开始迭代 → 长出一株**逼真的蕨类**。Michael Barnsley 用它证明"自然的形状可以被几行公式压缩"。*

---

## 分形的三个共同点

- **自相似**：局部与整体形态相似（严格或统计意义）
- **迭代**：由一条简单规则反复应用产生
- **非整数维**：Hausdorff 维数不是 1、2、3—— Koch 曲线维数 ≈ 1.26，Sierpinski 地毯 ≈ 1.89

---

## 今天在哪

- **CG 渲染**：山脉、云层、火焰、皮肤纹理（L-System + fBm）
- **天线**：分形天线（Koch 天线、Minkowski 天线）在很小体积里做出多频段
- **金融**：股价波动具**长尾 + 自相似**，Mandelbrot 1997《（分形）资本市场》挑战有效市场假说
- **医学**：肺、血管树、支气管均分形结构（用最小表面积做最大交换）
- **城市**：伦敦、东京的城市扩张分形维数 ≈ 1.7

---

:::info[一句话带走]

**"用有限的规则生成无限的结构"**——分形是数学送给所有复杂系统科学家的一份礼物。

---

**上一**：[贝叶斯定理](./06-bayes-theorem.md)　·　**下一**：[傅里叶分析 →](./08-fourier-analysis.md)

---

*图片来自 Wikimedia Commons，公有领域 / CC 自由许可。*
:::

