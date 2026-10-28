---
title: 4.日本纹样
slug: '4'
mapShort: 和风
description: 麻叶、市松、青海波——江户时代最流行的三种小纹。看图学名，从 Kumiko 木格栅到浮世绘、从和服到县徽。
keywords: [麻叶纹, 市松, 青海波, asanoha, ichimatsu, seigaiha, 日本纹样]
tags: [纹样]
concepts: [wave]
wrapperClassName: pattern-page
---

import PatternLab from '@site/src/components/PatternLab';

# 4. 麻叶 · 市松 · 青海波

*江户小纹三巨头。三种几何、三种性格：成长的、时尚的、平静的。*

> 本栏七个母题全部做成了可拖的**参数化生成器**；想集中玩，直接去 [实验室](/lab)（默认就是纹样组）。

---

### 麻叶纹 · Asanoha（前 8 世纪已有，江户普及）

![麻叶 Kumiko](https://commons.wikimedia.org/wiki/Special:FilePath/Asanoha_Kumiko_Pattern.svg?width=900)

*六角放射的星形，像展开的大麻叶。农民把婴儿背带织上它，祈求孩子"像麻一样长得又快又直"。木格窗（Kumiko）里也叫同名图案。*

---

### 麻叶 + 七宝 · 复合变体

![Shippo-Asanoha](https://commons.wikimedia.org/wiki/Special:FilePath/Shippo_Asanoha_Kumiko_Pattern.svg?width=900)

*麻叶叠在七宝（相连的圆环）之上，是 Kumiko 木工里最考验手艺的图案之一。*

---

### 市松 · Ichimatsu（江户，18 世纪）

![市松方格](https://commons.wikimedia.org/wiki/Special:FilePath/Ichimatsu.JPG?width=900)

*黑白方格交错。得名于江户歌舞伎演员 **佐野川市松**——他 1741 年在《真山崎天狗缘》里穿了一身这种图案戏服，全城模仿，两个月内"市松"成了方格纹的通用名。今天日本警车、出租车、奥运会视觉都还在用。*

---

### 青海波 · Seigaiha（6 世纪经朝鲜传入，室町–江户定型）

![青海波示意](https://commons.wikimedia.org/wiki/Special:FilePath/Seigaiha.svg?width=900)

*层层同心扇形排列如海面波纹。名字来自"波斯（青海在古日语借自波斯音）传来的波浪纹"，实际经由丝绸之路与朝鲜半岛传入。寓意：**风平浪静的日常**。*

---

### 实物版 · 青海波织物

![青海波代表例](https://commons.wikimedia.org/wiki/Special:FilePath/%E6%97%A5%E6%9C%AC%E3%81%AE%E4%BC%9D%E7%B5%B1%E6%96%87%E6%A7%98%E3%81%AB%E3%81%8A%E3%81%91%E3%82%8B%E4%BB%A3%E8%A1%A8%E4%BE%8B%EF%BC%9C%E9%9D%92%E6%B5%B7%E6%B3%A2%EF%BC%8E.jpg?width=900)

*和服振袖上的青海波——层叠的扇形在曲面上会自然变形，织工要提前算好。*

---

## 动手 · 三种几何是怎么排出来的

<PatternLab kind="asanoha">

先把六边形密铺，再从每个中心向六个顶点拉六条辐条——**叶片不是画出来的**，
它是相邻两个六边形共享一条边时自然形成的菱形。
关掉「六边形外框」，只剩辐条，图案立刻散成一堆星花；把辐条缩到 0.6，留白开始参与造型。
顺带一提：能无缝密铺的正多边形只有 3、4、6 三种，五边形做不到——
所以 [Girih](./05-girih.md) 想要五重对称，只能改用十重对称的五块砖。

</PatternLab>

<PatternLab kind="ichimatsu">

市松只有两个动作：棋盘上隔一格画一块，然后平铺。
不管你怎么调大小、加留白，色块占比永远等于 1/2——这是棋盘对称给的保证。
把「逐行平移」推到 0.5，方块立刻斜成菱形列，就是**斜市松**；
它靠的还是同一套奇偶规则，和 [凯尔特绳结的压挑](./06-celtic-knot.md) 是一个母题的两次出现。

</PatternLab>

<PatternLab kind="seigaiha">

青海波的全部秘密只有两行：**半圆弧层层套进同一圆心**，**每一行错开半个扇形**。
把「逐行错排」拉到 0，扇子对齐成方阵；拉到 0.5 就是砖缝错排的正版青海波；
拉到 0.25，浪开始斜着走——同一批弧线，错排比例一改就变了一种铺法。
再把「行间压叠」推到 1，扇面不再互相盖住，纹样立刻退回成一堆普通同心圆：
所谓「鳞浪」的层次感，本来就长在 0.74 这个数里。

</PatternLab>

把这一行行弧看成周期信号，它正是 [傅里叶分析](../math/08-fourier-analysis.md) 里那串正弦波的近亲：
只要有**周期**和**平移**，任何波形都能铺满平面——这既是纹样的算法，也是傅里叶级数的直觉。

---

## 一分钟记住三种

| 纹样 | 母题 | 情绪 |
|---|---|---|
| **麻叶** | 六角星 · 放射对称 | 生长、护佑 |
| **市松** | 方格 · 明暗交替 | 都市、时尚 |
| **青海波** | 扇形 · 平移重复 | 宁静、悠远 |

**彩蛋**：葛饰北斋《神奈川冲浪里》里的浪花用了青海波的构图逻辑——把传统纹样推到了世界名画的高度。

---

**上一**：[Greek Key 希腊回纹](./03-greek-key.md)　·　**下一**：[Girih · 伊斯兰无限 →](./05-girih.md)

---

*图片来自 Wikimedia Commons，公有领域 / CC 自由许可。*
