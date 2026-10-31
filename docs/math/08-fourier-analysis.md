---
title: 8.傅里叶分析
slug: '8'
mapShort: 傅里叶
description: 任何周期信号都能拆成一堆正弦波。从 1807 年巴黎科学院的争论到 MP3、JPEG、FFT、语音识别——一幅图看懂傅里叶级数怎么"长出来"。
keywords: [傅里叶, Fourier, 级数, 方波, FFT, 频谱, Gibbs]
tags: [数学]
concepts: [wave]
wrapperClassName: math-page
---
import useBaseUrl from '@docusaurus/useBaseUrl';


import MathLab from '@site/src/components/MathLab';

# 8. 傅里叶 · 把世界拆成频率

*1807 年，Joseph Fourier 在巴黎科学院宣称"**任何**函数（哪怕有跳变）都能用正弦波叠加逼近"。Lagrange 当场反对。两百年后，每次你打开 MP3、JPEG、Wi-Fi，傅里叶都赢了。*

---

### 核心图 · 用旋转的圆叠加方波

<img src={useBaseUrl("/img/docs/fourier_series_square_wave_circles_animation-w800-6e0c7cff.svg")} alt="Fourier square wave epicycles" loading="lazy" decoding="async" />

*方波 = 只保留奇次谐波 $\dfrac{4}{\pi}\sum_{k=1,3,5,\ldots} \dfrac{\sin(kx)}{k}$。每个圆代表一项，半径随 $1/k$ 收缩。*

---

### 静态版 · 前 5 项与 15 项逼近

<img src={useBaseUrl("/img/docs/square_wave_fourier_series-w900-39658c8e.svg")} alt="Square Wave Fourier Series k=5 与 k=15" loading="lazy" decoding="async" />

*k=5 已经能看出方波轮廓；k=15 逼得更紧——**只在跳变点两侧留下一小段超调**，那就是 **Gibbs 现象**（9% 超调不会消失）。*

---

### 彩色版 · 驻波视角

<img src={useBaseUrl("/img/docs/fourier_series_square_wave-w900-83ea1e25.svg")} alt="Fourier Series Square Wave" loading="lazy" decoding="async" />

*色盲友好版本，同时展示弦上的驻波。吉他弦被拨动时，振动模式本身就是这一族 sin 函数。*

---

### 频谱 · 把波形翻译成"每根频率柱"

<img src={useBaseUrl("/img/docs/fourierspectrumofasquarewave-de-w800-2af8a52a.svg")} alt="Fourier Spectrum of a Square Wave" loading="lazy" decoding="async" />

*同一支方波在**频率域**里的样子：只有 $f, 3f, 5f, 7f, \ldots$ 上有能量，且幅度按 $1/k$ 递减。*

**时域**看波形 ↔ **频域**看频谱，是同一枚硬币的两面。这就是傅里叶变换的全部哲学。

---

## 傅里叶做了什么

**Fourier 级数**（周期信号）：

$$
f(x) = \frac{a_0}{2} + \sum_{n=1}^{\infty}\left(a_n \cos nx + b_n \sin nx\right)
$$

**Fourier 变换**（非周期信号）：

$$
\hat{f}(\xi) = \int_{-\infty}^{\infty} f(x)\, e^{-2\pi i x \xi}\, dx
$$

**核心洞察**：**$e^{i\theta}$ 是"最纯粹的振动"**，任何信号都能沿这个基展开。

---

## 今天在哪

| 应用 | 用了什么 |
|---|---|
| **MP3 / AAC** | 时域信号 → MDCT（Modified DCT）→ 丢掉人耳听不见的高频 |
| **JPEG** | 图像块 → 二维 DCT → 丢掉高频系数 |
| **4G / 5G / Wi-Fi** | OFDM：把信道切成一堆正交子载波，各自做 QAM |
| **语音识别** | 每 20ms 帧做 FFT → 得到频谱图（Spectrogram）→ 送进神经网络 |
| **医学** | MRI、CT、脑电 EEG 全靠傅里叶重构 |
| **数论** | 素数分布的显式公式与 Riemann ζ 函数用 Fourier 分析工具 |
| **快速算法** | Cooley–Tukey FFT（1965）把 $O(n^2)$ 变成 $O(n\log n)$—— 20 世纪最重要的算法之一 |

---

## 动手 · 一项一项加上去

同一个外壳（母题 → 参数 → 图形），这里滑的是谐波项数：集中试见 [实验室 · 傅里叶](/lab#fourier)。

<MathLab kind="fourier">

方波只留奇次谐波、幅度按 1/k 收缩；锯齿波全次都留；三角波按 1/k² 收缩，所以它收敛得快得多——
同样 8 项，三角波已经几乎贴着目标，方波在跳变处还鼓着一个包。
那个包不会消失：项数加到 1000，超调仍是约 8.9%，这就是 Gibbs 现象。
打开「各次谐波」，能看见每一根正弦各自在出力，而实线只是它们的累加。

</MathLab>

---

## 💡 练习题

1. **问为什么**：方波的展开式里为什么没有偶次谐波？
2. **比收敛**：三角波的系数按 $1/k^2$ 衰减，方波按 $1/k$，同样取 8 项谁的误差更小？为什么？
3. **换波形**：锯齿波含全部谐波、幅度按 $1/k$，它的"音色"与方波差在哪里？

<details>
<summary>参考答案</summary>

1. 方波是奇函数且具有半波对称性，偶次谐波与这种对称性不匹配，系数恒为 0。
2. 三角波误差更小：系数衰减更快意味着高频能量更少，截断损失更小；方波在跳变处必然留下约 8.9% 的 Gibbs 超调，加多少项都不会消失。
3. 锯齿波含全部谐波、高频更丰富，听感更"亮"更粗糙；去掉高频后波形变圆钝，正是"少了一些频率"的直接体现。

</details>

:::info[一句话带走]

**"看一个东西的本质，是看它由哪些频率组成。"** 傅里叶把这个物理直觉变成了严谨的数学工具。

---

**上一**：[分形](./07-fractals.md)　·　**下一**：[经典几何 →](./09-classical-geometry.md)

---

*图片来自 Wikimedia Commons，公有领域 / CC 自由许可。*
:::

