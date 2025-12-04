# Docusaurus 教程网站完整搭建指南

## 1. 初始化项目

```bash
# 使用 npx 创建项目（推荐）
npx create-docusaurus@latest my-tutorial-site classic

# 或使用 npm
pnpm init docusaurus@latest my-tutorial-site classic

# 进入项目目录
cd my-tutorial-site

# 安装依赖
npm install
```

## 2. 项目结构

```
my-tutorial-site/
├── docs/                    # 文档 Markdown 文件
│   ├── intro.md
│   ├── javascript/
│   │   ├── intro.md
│   │   ├── history.md
│   │   ├── basic-syntax.md
│   │   ├── data-types.md
│   │   └── ...
│   ├── python/
│   └── java/
├── blog/                    # 博客文章（可选）
├── src/
│   ├── components/         # 自定义 React 组件
│   ├── css/               # 全局样式
│   └── pages/             # 自定义页面
├── static/                 # 静态资源（图片、字体等）
│   └── img/
├── docusaurus.config.js    # 主配置文件
├── sidebars.js            # 侧边栏配置
└── package.json
```

## 3. 主配置文件 (docusaurus.config.js)

```javascript
// @ts-check
const {themes} = require('prism-react-renderer');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: '胖头鱼学习网站',
  tagline: '编程教程学习平台',
  favicon: 'img/favicon.ico',
  
  url: 'https://your-domain.com',
  baseUrl: '/',
  
  onBrokenLinks: 'throw',
  
  i18n: {
    defaultLocale: 'zh-CN',
    locales: ['zh-CN'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
        },
        blog: false, // 禁用博客
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: '胖头鱼学习网站',
        logo: {
          alt: 'Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            to: '/docs/javascript/intro',
            label: 'JavaScript教程',
            position: 'left',
          },
          {
            to: '/docs/python/intro',
            label: 'Pythont教程',
            position: 'left',
          },
          {
            href: 'https://github.com/your-repo',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      
      footer: {
        style: 'dark',
        copyright: `Copyright © ${new Date().getFullYear()} 胖头鱼学习网站`,
      },
      
      prism: {
        theme: themes.github,
        darkTheme: themes.nightOwl,
      },
    }),
};

module.exports = config;
```

## 4. 侧边栏配置 (sidebars.js)

```javascript
// @ts-check

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)



 /** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'JavaScript教程',
      items: [
        'javascript/intro',
        'javascript/basic-syntax',
      ],
    },
  ],
  pythonSidebar: [
    'intro',
    {
      type: 'category',
      label: 'python教程',
      items: [
        'python/intro',
        'python/basic-syntax',
      ],
    },
  ],
};

module.exports = sidebars;
```

## 5. 创建示例 Markdown 文档

### docs/javascript/basic-syntax.md

```markdown
---
sidebar_position: 3
title: 基本语法
---

# 基本语法

JavaScript 的执行单位为行（line），也就是一行一行地执行。一般情况下，每一行就是一个语句。

:::tip 提示
让JavaScript引擎自动在分号某种情况下会改变程序的语义，导致运行结果与期望不一致。在本教程中，我们不会省略，所有语句都会添加。
:::

例如，下面的一行代码就是一个完整的赋值语句：

```javascript
var x = 1;
```

下面的一行代码是一个字符串，但仍然可以视为一个完整的语句：

```javascript
'Hello, world';
```

下面的一行代码包含两个语句，每个语句用 `;` 表示语句结束：

```javascript
var x = 1; var y = 2; // 不建议一行写多个语句！
```

## 语句块

语句块是一组语句的集合，例如，下面的代码先做了一个判断，如果判断成立，将执行 `{...}` 中的所有语句：

```javascript
if (2 > 1) {
  x = 1;
  y = 2;
  z = 3;
}
```

:::note 注意
语句块中的语句应该适当缩进，通常使用 2 个或 4 个空格。
:::

## 注释

JavaScript 支持两种注释方式：

```javascript
// 单行注释

/*
  多行注释
  可以写多行
*/
```
```

### docs/javascript/intro.md

```markdown
---
sidebar_position: 1
slug: /javascript/intro
---

# JavaScript 简介

欢迎来到 JavaScript 教程！

## 什么是 JavaScript？

JavaScript 是一种轻量级的编程语言，主要用于：

- 网页交互
- 前端开发
- 后端开发（Node.js）
- 移动应用开发

## 学习路线

1. 基础语法
2. 数据类型
3. 函数
4. 对象和数组
5. 异步编程
6. DOM 操作

## 开始学习

让我们从[基本语法](./basic-syntax.md)开始吧！
```

## 6. 自定义样式 (src/css/custom.css)

```css
:root {
  --ifm-color-primary: #2e8555;
  --ifm-color-primary-dark: #29784c;
  --ifm-color-primary-darker: #277148;
  --ifm-color-primary-darkest: #205d3b;
  --ifm-color-primary-light: #33925d;
  --ifm-color-primary-lighter: #359962;
  --ifm-color-primary-lightest: #3cad6e;
  --ifm-code-font-size: 95%;
  --docusaurus-highlighted-code-line-bg: rgba(0, 0, 0, 0.1);
}

[data-theme='dark'] {
  --ifm-color-primary: #25c2a0;
  --ifm-color-primary-dark: #21af90;
  --ifm-color-primary-darker: #1fa588;
  --ifm-color-primary-darkest: #1a8870;
  --ifm-color-primary-light: #29d5b0;
  --ifm-color-primary-lighter: #32d8b4;
  --ifm-color-primary-lightest: #4fddbf;
  --docusaurus-highlighted-code-line-bg: rgba(0, 0, 0, 0.3);
}

/* 自定义代码块样式 */
.prism-code {
  font-size: 14px;
  line-height: 1.6;
}

/* 侧边栏样式调整 */
.menu__link--active {
  font-weight: 600;
}
```

## 7. package.json 脚本

```json
{
  "name": "my-tutorial-site",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "docusaurus": "docusaurus",
    "start": "docusaurus start",
    "build": "docusaurus build",
    "swizzle": "docusaurus swizzle",
    "deploy": "docusaurus deploy",
    "clear": "docusaurus clear",
    "serve": "docusaurus serve",
    "write-translations": "docusaurus write-translations",
    "write-heading-ids": "docusaurus write-heading-ids"
  }
}
```

## 8. 常用命令

```bash
# 启动开发服务器（热重载）
npm start

# 构建生产版本
npm run build

# 本地预览构建结果
npm run serve

# 清除缓存
npm run clear
```

## 9. 部署

### 部署到 GitHub Pages

```bash
# 1. 修改 docusaurus.config.js
organizationName: 'your-github-username',
projectName: 'your-repo-name',
deploymentBranch: 'gh-pages',

# 2. 执行部署命令
GIT_USER=<your-github-username> npm run deploy
```

### 部署到 Vercel / Netlify

1. 将代码推送到 Git 仓库
2. 在 Vercel/Netlify 中导入项目
3. 构建命令：`npm run build`
4. 输出目录：`build`

## 10. 添加新文档的工作流程

```bash
# 1. 创建新的 Markdown 文件
touch docs/javascript/new-topic.md

# 2. 添加 frontmatter
---
sidebar_position: 10
title: 新主题
---

# 3. 在 sidebars.js 中添加引用（如果需要）

# 4. 保存后自动热重载，查看效果

# 5. 构建并部署
npm run build
npm run deploy
```

## 11. Markdown 增强功能

Docusaurus 支持丰富的 Markdown 语法：

```markdown
:::tip 提示
这是一个提示框
:::

:::warning 警告
这是一个警告框
:::

:::danger 危险
这是一个危险提示
:::

:::note 注意
这是一个注意事项
:::

:::info 信息
这是一个信息框
:::

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="js" label="JavaScript">
    ```javascript
    console.log('Hello');
    ```
  </TabItem>
  <TabItem value="py" label="Python">
    ```python
    print('Hello')
    ```
  </TabItem>
</Tabs>
```

## 12. 插件推荐

```bash
# 搜索插件
npm install --save @docusaurus/theme-search-algolia

# 图片优化
npm install --save @docusaurus/plugin-ideal-image

# 代码块功能增强
npm install --save @docusaurus/theme-live-codeblock
```
## 13. 更新
> 每次更新新的文档，只需要改动 侧边栏（sidebars.js）和导航栏(docusaurus.config.js)的配置

现在你就可以：
1. 在 `docs/` 目录下添加 `.md` 文件
2. 运行 `npm start` 实时预览
3. 运行 `npm run build` 生成静态网站
4. 部署到服务器或静态托管平台
