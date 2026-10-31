---
title: 9.经典几何
slug: '9'
mapShort: 几何
description: 从欧几里得《几何原本》莎草纸残片到斐波那契螺、黄金分割与鹦鹉螺壳。尺规两千年前的语言，今天仍在建筑、Logo、贝壳与银河旋臂里活着。
keywords: [欧几里得, 几何原本, 黄金分割, 斐波那契, 对数螺, 尺规]
tags: [数学]
wrapperClassName: math-page
---

import MathLab from '@site/src/components/MathLab';

# 9. 经典几何 · 从一根圆规到整个宇宙

*欧几里得只留下**五种作图动作**（点、线、圆、交点、公设），却搭建起两千年不容置疑的空间真理。直到 19 世纪罗巴切夫斯基质疑第五公设——那是另一个故事，见 [黎曼几何](./10-riemannian-geometry.md)。*

---

### 现存最古老的《几何原本》实物（约公元 100 年）

![P. Oxy. I 29 莎草纸残片](https://commons.wikimedia.org/wiki/Special:FilePath/P._Oxy._I_29.jpg?width=900)

*1897 年在埃及奥克西林库斯垃圾堆里出土。画的是《原本》第二卷命题 5—— "$(a+b)(a-b) = a^2 - b^2$" 的几何证明。古希腊人**没有代数符号**，全靠这块图。*

---

### 黄金螺 · Golden Spiral

![Golden Spiral](https://commons.wikimedia.org/wiki/Special:FilePath/Golden_Spiral.svg?width=800)

*从一个黄金矩形（长宽比 $\varphi = \dfrac{1+\sqrt{5}}{2} \approx 1.618$）里不断切正方形、连四分之一圆。缩放 $\varphi$ 倍自身完全重合 → **自相似对数螺**。*

---

### 斐波那契螺 · 用整数长出的曲线

![Fibonacci spiral 34](https://commons.wikimedia.org/wiki/Special:FilePath/Fibonacci_spiral_34.svg?width=800)

*正方形边长取 $1,1,2,3,5,8,13,21,34, \ldots$。当 $n \to \infty$，相邻比值 $\to \varphi$——**离散整数列 → 连续对数螺**。*

---

### 现实样本 · 鹦鹉螺的横切

![Nautilus shell cutaway](https://commons.wikimedia.org/wiki/Special:FilePath/NautilusCutawayLogarithmicSpiral.jpg?width=800)

*自然界的对数螺。贝壳气室半径按固定角度呈指数增长，是浮力控制的极优解。**鹦鹉螺 ≈ 斐波那契**是流行文化误解——实际比值更接近 1.33，不完全是 $\varphi$，但确实是**对数螺**。*

---

## 尺规能做的与不能做的

**古希腊三大作图难题**（都想用尺规解决）：

| 问题 | 结论 |
|---|---|
| **三等分任意角** | ❌ 不可能（Wantzel 1837 证明） |
| **倍立方**（体积 ×2 的立方体） | ❌ 不可能（需要 $\sqrt[3]{2}$，非可构造数） |
| **化圆为方**（等面积正方形） | ❌ 不可能（Lindemann 1882 证明 π 是超越数） |
| **正十七边形作图** | ✅ Gauss 1796 年 19 岁的成名作 |

**判据**：一个数能用尺规作出 $\Leftrightarrow$ 它落在有理数的**某个 2 的幂次扩张**里。看似几何的规矩，本质是**域论**。

---

## 欧几里得的遗产

- **公理化**：《原本》13 卷、5 公设、465 命题——人类第一次把一门学问写成"从少数前提演绎出整个体系"
- **透视法**：阿尔贝蒂、达·芬奇把投影几何变成绘画工具
- **建筑**：帕特农神庙的**entasis**（柱子微微凸起）需要圆锥曲线才能描述
- **现代 Logo**：Twitter、Apple、BBC、Airbnb 都用**圆 + 黄金比例**打底

---

## 动手 · 圆规之外，还有两个滑块

同一个外壳（母题 → 参数 → 图形），这里滑的是倍率与控制点：集中试见 [实验室 · 数学组](/lab#spiral)。

<MathLab kind="spiral">

对数螺的定义只有一句：「每转 90°，半径乘同一个倍率 g」。g = 1.618 就是黄金螺
（把正方形一个个切下来、连上四分之一圆）；鹦鹉螺实测约 1.33，仍然是对数螺——
自相似不挑倍率，只要求倍率恒定。切到「阿基米德」，圈距变成恒定的 2πa，
那才是唱片纹路与螺线泵里的形状。开「每 90° 半径线」，能直接看见倍率是不是真的恒定。

</MathLab>

<MathLab kind="bezier">

四个空心圆可以直接拖。曲线只认这几个控制点：端点固定、切线由中间点决定，
SVG 里就是一句 `d="M … C …"`。这就是矢量图形与照片的分水岭——没有像素，只有参数。
打开 de Casteljau 作图，能看见「逐段线性插值、逐层收缩到一个点」的全过程；
[纹样栏目](../patterns/04-japanese.md) 那些母题导出的也是同一种文件。

</MathLab>

---

## 💡 练习题

1. **记忆题**：尺规作图的三大不可能问题是什么？
2. **动手**：三次贝塞尔曲线的端点与切线分别由哪些控制点决定？
3. **辨区别**：黄金螺与斐波那契螺差在哪里？

<details>
<summary>参考答案</summary>

1. 化圆为方、倍立方、三等分任意角（Wantzel 1837 证明后两者不可能，Lindemann 1882 证明 $\pi$ 超越从而化圆为方不可能）。
2. 端点是 $P_0,P_3$；起点切线沿 $P_0\to P_1$，终点切线沿 $P_2\to P_3$。
3. 黄金螺每转 90° 半径乘 $\varphi$，严格自相似；斐波那契螺用 $1,1,2,3,5,\ldots$ 整数近似，只在极限下趋近黄金螺。

</details>

:::info[一句话带走]

**"几何不只是画图，是人类第一次试图把空间讲成一个可推理的对象。"**

---

**上一**：[傅里叶分析](./08-fourier-analysis.md)　·　**下一**：[黎曼几何 →](./10-riemannian-geometry.md)

---

*图片来自 Wikimedia Commons，公有领域 / CC 自由许可。*
:::

