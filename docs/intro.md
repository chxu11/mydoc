---
id: 0
sidebar_position: 0
title: '文档首页'
description: 胖头鱼学习网站文档首页：站点使用说明、写作规范、六大栏目（编程 / 纹样 / 数学 / 物理 / 教育 / 诗歌文章）。
tags: [指南]
---

import ColumnStats from '@site/src/components/ColumnStats';

# 👋 欢迎来到胖头鱼学习网站

这是一个基于 Docusaurus 搭建的**跨学科学习平台**，分为六大栏目：

<ColumnStats />

## 🚀 如何开始

1. 顶部导航 **栏目** 下拉，或左侧边栏，直达任一栏目的第一篇
2. 每篇教程尽量遵循统一节奏：**学习目标 → 通俗比喻 → 原理 → 常见坑 → 总结**
3. 建议按侧边栏顺序阅读，`阶段 X` / 编号即推荐学习次序

## 📖 写作规范（贡献前必读）

每个 Markdown 文件顶部必须包含 frontmatter：

```yaml
---
id: 3
title: 3.组件与Props
sidebar_position: 3
description: 一句话描述本章学什么（用于 SEO 与列表页）
keywords: [React, Props]
tags: [前端]
---
```

**其它约定**：

- `tags` 只写**一个**——即所属栏目（前端 / Rust / Python / 纹样 / 数学 / 物理 / 教育 / 诗歌文章 / 建站参考 / 指南），与顶部「栏目」下拉一一对应，保证「标签」页简洁清晰

- **新增一篇的同步点**：docs 文件本身 + `src/data/tracks.js` 加一站 + 上/下一篇链接；首页卡片与本页的**篇数自动派生**，不需手改
- 单文件建议不超过 **400 行**，超过请按子主题拆分
- 代码块必须写语言标签（`js` / `rust` / `python` / `bash`），前端示例可加 `live` 变成可编辑运行
- 概念性内容推荐插入 `mermaid` 图表
- 提示框使用 `:::tip` / `:::warning` / `:::danger` / `:::info` / `:::note`

## 🔍 找不到内容？

- 顶部导航右侧有**站内搜索**（中英文都支持）
- 每篇底部有**编辑此页**按钮，发现错漏欢迎直接提 PR

Happy hacking! 🎣
