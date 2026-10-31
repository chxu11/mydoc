---
title: '文档首页'
slug: '/0'
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

每个 Markdown 文件顶部必须包含 frontmatter（文件名以数字前缀定序，如 `03-props.md`）：

```yaml
---
title: 3.组件与Props
slug: '3'            # 路由 /docs/<栏目>/<slug>，与旧链接保持兼容
mapShort: Props      # 知识地图上的短标签（栏目首页也需参与地图时填写）
description: 一句话描述本章学什么（用于 SEO 与列表页）
keywords: [React, Props]
tags: [前端]
---
```

**其它约定**：

- `tags` 只写**一个**——即所属栏目（前端 / Rust / Python / 纹样 / 数学 / 物理 / 教育 / 诗歌文章 / 建站参考 / 指南），与顶部「栏目」下拉一一对应，保证「标签」页简洁清晰

- **新增一篇只需一个文件**：排序由文件名数字前缀决定；知识地图、首页卡片与本页**篇数**由 `scripts/gen-tracks.js` 从 frontmatter 自动扫描生成（缺 `slug`/`mapShort` 会在构建时报错）；上/下一篇链接建议用相对路径（如 `./04-state.md`），站内引用勿写死 baseUrl 前缀
- 栏目显示名/排序/折叠状态维护在目录的 `_category_.json`；新增栏目同步 `src/data/columns.cjs` 与 `sidebars.js` 各一行
- 单文件建议不超过 **400 行**，超过请按子主题拆分
- 代码块必须写语言标签（`js` / `rust` / `python` / `bash`）
- 概念性内容推荐插入 `mermaid` 图表
- 提示框使用 `:::tip` / `:::warning` / `:::danger` / `:::info` / `:::note`

## 🔍 找不到内容？

- 顶部导航右侧有**站内搜索**（中英文都支持）
- 每篇底部有**编辑此页**按钮，发现错漏欢迎直接提 PR

Happy hacking! 🎣

**下一**：[三条学习主线与本站目标](./1-three-goals.md)
