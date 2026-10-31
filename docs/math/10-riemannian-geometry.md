---
title: 10.黎曼几何
slug: '10'
mapShort: 黎曼
description: 当平行公设崩塌，球面与双曲面上三角形内角不再等于 180 度。从 Gauss 曲率到 Einstein 广义相对论，再到今天的 Poincaré 圆盘与深度学习流形。
keywords: [黎曼几何, 曲率, 双曲, Poincaré, 球面几何, 广义相对论]
tags: [数学]
concepts: [dimension]
wrapperClassName: math-page
---
import useBaseUrl from '@docusaurus/useBaseUrl';


# 10. 黎曼几何 · 空间自己弯曲

*1854 年，Bernhard Riemann 在哥廷根做资格演讲《论几何学的基础假设》，把"空间"从欧几里得的舞台搬下来，变成**由度规张量决定的动态主体**。六十年后爱因斯坦用它写出了广义相对论。*

---

### 球面 · 三角形内角 > 180°

<img src={useBaseUrl("/img/docs/spherical_triangle_3d-w700-aa42b29a.png")} alt="Spherical triangle 3D" loading="lazy" decoding="async" />

*三条测地线（大圆弧）在球面上围出的三角形。**内角和 = 180° + 球面 excess**。地球上的飞行员沿大圆飞，就是走这种三角形的边。*

---

### 庞加莱圆盘 · 双曲平面的地图

<img src={useBaseUrl("/img/docs/ideal-triangle-hyperbolic-tiling-60d4d2ad.svg")} alt="Ideal-triangle hyperbolic tiling in the Poincaré disk" loading="lazy" decoding="async" />

*把整个无限的双曲平面**塞进一个圆盘**。"直线"变成与边界圆正交的弧，三角形内角和**小于 180°**——图中每个白色理想三角形的三个顶点都落在边界圆上（也就是"无穷远点"）。**给定点可以画出无穷多条"平行线"**（既不相交也不收敛到同一点），这就是 **Lobachevsky 平行公设的否定**。*

---

### 复变函数的黎曼面 · 让多值函数变单值

<img src={useBaseUrl("/img/docs/riemann_surface_sqrt-w600-7d17f118.svg")} alt="Riemann surface of sqrt" loading="lazy" decoding="async" />

*$\sqrt{z}$ 在 $z = 0$ 处"绕一圈换一次符号"。黎曼的办法：**再造一层纸，缝上**。走两圈回到原点，函数值才复原。**分支点 + 多叶结构**从此成为拓扑与物理（规范场、弦论）的基本语汇。*

---

### 对数函数的无限叶

<img src={useBaseUrl("/img/docs/riemann_surface_log-w600-a6fb140c.svg")} alt="Riemann surface of log" loading="lazy" decoding="async" />

*$\log z$ 每绕原点一周虚部增加 $2\pi$——黎曼面变成**无限螺旋停车坪**。这是解析延拓最直观的形状。*

---

## 三种几何对照

| 曲率 $K$ | 模型 | 三角形内角和 | 平行线 |
|---|---|---|---|
| $K = 0$ | 欧几里得平面 | 恰好 180° | 唯一 |
| $K > 0$ | 球面（黎曼几何） | **大于** 180° | 不存在（都相交） |
| $K < 0$ | 双曲平面（Lobachevsky） | **小于** 180° | 无穷多条 |

:::note Gauss 的洞见（1827）
曲面在一点如何弯曲，**只依赖生活在曲面上的蚂蚁能量到的距离**——不需要爬出三维空间去看。这叫 **Theorema Egregium（绝妙定理）**。黎曼把它推到任意维流形，爱因斯坦把它当成引力方程的骨架。
:::

---

## 从纯数学到宇宙

- **1854** Riemann 演讲 → 黎曼几何诞生
- **1915** Einstein 广义相对论：$G_{\mu\nu} = 8\pi G\, T_{\mu\nu}$ —— 时空是 4 维黎曼流形，物质告诉它如何弯曲，弯曲告诉物质如何运动
- **1918** Weyl 引入**规范场**，用纤维丛语言重写（杨–米尔斯 1954 沿用）
- **1960s** Penrose、Hawking 用黎曼/伪黎曼几何证明**黑洞奇点定理**（1970 狄拉克 medal / 2020 诺贝尔）
- **2010s** **流形假设**（manifold hypothesis）：语音、图像、语言的高维数据其实分布在低维流形附近 → 深度学习学的是**流形的几何**
- **今天** UMAP / t-SNE 把 784 维 MNIST 投影到 2 维；变分自编码器学一个隐流形——黎曼几何是 AI 的隐形地基

---

## 💡 练习题

1. **对照**：欧氏、球面、双曲三种几何的三角形内角和与曲率符号分别是什么？
2. **问为什么**：为什么平面地图不可能同时保角又保面积？
3. **回到物理**：广义相对论方程里"物质告诉时空如何弯曲"对应哪一侧？

<details>
<summary>参考答案</summary>

1. 欧氏：内角和 $=180°$，曲率 0；球面：$>180°$，正曲率；双曲：$<180°$，负曲率。
2. 曲率是内蕴的（高斯绝妙定理），把正曲率的球面摊平必然产生畸变，保角与保面积只能二选一。
3. 对应右边 $T_{\mu\nu}$（能量-动量张量）；左边 $G_{\mu\nu}$ 描述弯曲，负责"弯曲告诉物质如何运动"。

</details>

:::info[一句话带走]

**"空间不是容器，是演员。"** 从黎曼开始，几何学的对象不再是"里面的图形"，而是空间本身——它如何弯、如何胀、如何随时间演化。

---

**上一**：[经典几何](./09-classical-geometry.md)　·　**下一**：[欧拉公式 →](./11-euler-identity.md)　·　[回到栏目首页](./01-proof-methods.md)

---

*图片来自 Wikimedia Commons，公有领域 / CC 自由许可。*
:::

