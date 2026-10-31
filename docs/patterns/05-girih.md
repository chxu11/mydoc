---
title: 5.Girih 伊斯兰几何
slug: '5'
mapShort: Girih
description: 五种带角的瓷砖拼出十重对称的无限平面。9 世纪巴格达到 15 世纪伊斯法罕，比 Penrose 早五百年触摸到准晶体的秘密。
keywords: [Girih, 伊斯兰几何, 密铺, 准晶体, Darb-e Imam, al-Kashī]
tags: [纹样]
concepts: [symmetry, order]
wrapperClassName: pattern-page
---
import useBaseUrl from '@docusaurus/useBaseUrl';


import PatternLab from '@site/src/components/PatternLab';

# 5. Girih · 用五块砖画出无限

*Girih（波斯语 گِرَه，"结"）—— 伊斯兰工匠用**五种带角的瓷砖**拼出的连续几何宇宙。禁止偶像的信仰，逼出了人类最纯粹的抽象装饰。*

---

### 五块砖 · Girih Tiles 家族

<img src={useBaseUrl("/img/docs/girih_tiles-w900-8c4cecf1.jpg")} alt="Girih 五砖" loading="lazy" decoding="async" />

*正十边形、长菱形、短菱形、领结形、菱形——五块砖按角度规则拼接，就能铺满整面墙。所有砖上的线延伸出去自然形成星与多边形。*

---

### 实物 · 伊斯法罕 Darb-e Imam 圣祠（1453）

<img src={useBaseUrl("/img/docs/darb-i_imam_shrine_spandrel-w900-dd11dce6.jpg")} alt="Darb-e Imam spandrel 十重对称" loading="lazy" decoding="async" />

*这面三角拱肩是**最出名的 Girih 实例**：2007 年物理学家 Peter Lu（哈佛）与建筑史学家 Salbaichik 在这里发现了**局部十重对称 + 准晶体周期性**——比苏联数学家彭罗斯（Penrose）1974 年的准晶理论**早了整整五百年**。*

---

### 顶峰 · Oljaytu 米哈拉布（1310 年代）

<img src={useBaseUrl("/img/docs/oljaytu_mihrab-w900-73fc297c.jpg")} alt="Oljaytu Mihrab" loading="lazy" decoding="async" />

*苏丹尼耶清真寺的祈祷壁龛，整面由细密 Girih 与库法体经文交织。Wikimedia **特色图片**级作品——伊斯兰几何的巅峰之一。*

---

### 日常版 · 伊朗彩釉瓷砖

<img src={useBaseUrl("/img/docs/iranian_tiles_1-w900-c000c098.jpg")} alt="Iranian Tiles" loading="lazy" decoding="async" />

*基贾尔时代的彩釉瓷砖把 Girih 从清真寺带到茶室、庭院、市集。今天伊朗街头抬头还是这个图案。*

---

## 动手 · 先拆出骨架

<PatternLab kind="rosette">

Girih 的五块砖很难一眼看懂，但它背后的骨架极简单：**把圆周 n 等分，再把多边形错位套几层**。
n=10 就是 al-Kāshī 在 15 世纪算出的十重对称；把 n 调到 5，得到的是与 Penrose 铺砖同族的五重对称；
n 调到 6 或 8，又会掉回「普通」的周期性对称——真正常见的只有 2/3/4/6，其余都要靠 n 重旋转去硬碰。
再把「星形跨步」和 n 一起看：两者互质时星形一笔画成，有公约数就会拆成几笔各自闭合——
滑杆下面那行小字会实时告诉你现在是几笔。

</PatternLab>

「错位半格」这个动作，和 [纹样总览](./01-overview.md) 里说的「平移重复」是同一件事，
只是这次绕着圆周转。古人用圆规和直尺画它，今天用 `cos / sin` 和 `for` 画它，都是同一套坐标。

---

## 为什么值得看

- **数学**：五砖密铺是**非周期性铺砖**的实例，与 20 世纪准晶体学（2011 年诺贝尔化学奖）直接对应
- **宗教**：不画神像、不画人形的戒律，把装饰压力全部推到几何
- **工艺**：所有 Girih 都能用**圆规 + 直尺**做出——工匠不写公式，图纸就是几何本身

:::note 一句话
伊斯兰工匠没有微积分，却用五块砖画出了**欧几里得平面上不可能的对称**。
:::

---

## 💡 练习题

1. **几笔画成**：在[十重星盘](/lab#rosette)里取 $n=10$。星形跨步设 3 需要几笔？设 4 呢？判断依据是什么？
2. **对称的贵贱**：把 $n$ 调到 5 或 10，图案显得"稀有"；调到 6 或 8 却像普通花窗。周期性铺砖允许的旋转阶只有哪几个？为什么 5 重、10 重要靠非周期铺砖？
3. **工匠的数学**：所有 Girih 都能用圆规 + 直尺作出，却画出了 20 世纪准晶体学（2011 年诺贝尔化学奖）才在实验室里遇上的对称。用一句话说清这为什么不矛盾。

<details>
<summary>参考答案</summary>

1. 跨步 3 与 10 互质 → **1 笔**就把十个顶点全部走完；跨步 4 与 10 的最大公约数是 2 → 拆成 **2 笔**各自闭合。规律：笔数就等于 $\gcd(n,\ \text{跨步})$，滑杆下方那行小字实时报的就是它。
2. 只允许 2、3、4、6 重。因为周期平移格点必须密铺平面，而能填满平面的正多边形只有三角形、正方形、六边形，对应旋转阶就是这四个（五次及以上会留下空隙）。想要 5 重或 10 重，就得放弃周期性——Girih 的五块砖正是这样一条出路。
3. 圆规与直尺是"作图规则"，不是"公式"：工匠执行的是可作图的几何步骤，而步骤本身蕴含了非周期铺砖的组合逻辑。规则不依赖代数符号也能生成超越当时理论的秩序——这栏最想让你带走的一句话就在这里。

</details>

**上一**：[麻叶 · 市松 · 青海波](./04-japanese.md)　·　**下一**：[凯尔特绳结 →](./06-celtic-knot.md)

---

*图片来自 Wikimedia Commons，公有领域 / CC 自由许可。*
