---
title: 1.Python 介绍
slug: '1'
mapShort: 介绍
description: 认识 Python：语法简洁、生态最广的通用语言，覆盖脚本、Web、数据分析、AI/ML、自动化运维等几乎所有领域。
keywords: [Python, 入门, 环境搭建, 学习路线]
tags: [Python]
---

# 阶段 1：Python 是什么

## 🎯 学习目标

- 理解 Python 的定位："胶水语言"意味着什么
- 知道 Python 最强的三类场景与最不适合的一类
- 选对 Python 版本与包管理工具，避免一开始就踩坑

---

## 🍔 一句话比喻

> **Python 像"瑞士军刀 + 大白话"**：写起来最接近自然语言，能做的范围又最广——从"批量重命名文件"到"训练一个模型"都能上手；只是不适合要求极致性能或强类型的大型工程核心。

---

## 📚 Python 适合做什么

| 场景 | 代表库 / 工具 |
|---|---|
| 脚本与自动化 | pathlib、shutil、subprocess、invoke |
| 网络请求与爬虫 | requests、httpx、scrapy、playwright |
| Web 后端 | FastAPI、Flask、Django |
| 数据分析 | pandas、numpy、matplotlib、seaborn |
| AI / 机器学习 | scikit-learn、PyTorch、transformers |
| 科学计算 | scipy、sympy、Jupyter |

## ⚠️ Python 不太适合

- 高并发长连接服务（Node/Go/Rust 更合适）
- 移动端 App、桌面 GUI 分发（有方案但不主流）
- 对启动速度/内存敏感的场景（PyInstaller 打出来动辄几十 MB）

---

## 🧭 学习路线预览

```
阶段1 (当前) ✓ 认识 Python + 选版本
    ↓
阶段2 → 环境搭建：pyenv 管版本，uv / poetry 管依赖
    ↓
阶段3 → 基础语法：变量、类型、控制流
    ↓
阶段4 → 数据结构：list / dict / set / tuple 的复杂度直觉
    ↓
阶段5 → 函数与递归：def 三件套、基例与调用栈、汉诺塔 / 目录树 / 分形树
    ↓
阶段6 → 面向对象 & 模块包
    ↓
阶段7 → ⭐ 装饰器 / 生成器 / 上下文管理器（Python 味儿的三件套）
    ↓
阶段8 → 标准库精选：pathlib / datetime / json / re
    ↓
阶段9 → 异步：asyncio / aiohttp
    ↓
实战 → 爬虫 → 数据分析小报告 → FastAPI 小服务
```

---

## 🛠 工具与资源

- 官方中文教程：python.org 中文文档
- 交互式练习：Exercism Python Track
- 在线沙盒：[Google Colab](https://colab.research.google.com/) / [Replit](https://replit.com/)
- 现代包管理：强烈推荐 [uv](https://docs.astral.sh/uv/)（Rust 写的，比 pip 快 10-100 倍）

---

## ✅ 阶段 1 总结

1. Python 是"广度冠军"——一件事未必最快，但几乎任何事都能做
2. 起步阶段最重要的两件事：**选对版本管理器**（pyenv） + **选对包管理器**（uv / poetry）
3. 学到装饰器/生成器之后，才算真正跨过 Python 的"入门门槛"

**下一步**：前往[阶段 2：环境搭建](../python/02-setup.md)，装好 Python 3.12+ 与 uv，跑通第一段脚本。

---

## 💡 思考题

- 回想过去半年你写过或想写的自动化脚本，哪些用 Python 最省事？
- 为什么 Python 生态里既有 pip / poetry / uv / conda / pipenv 这么多工具？它们分别解决了什么问题？
