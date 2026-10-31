// @ts-check
const { themes } = require('prism-react-renderer');
const {navbarDropdownItems, footerLearningItems} = require('./src/data/columns.cjs');

// 站点地址可在部署时用环境变量覆盖（GitHub Pages / Qoder Sites 共用一份配置）
const SITE_URL = process.env.SITE_URL || 'https://chxu11.github.io';
const BASE_URL = process.env.SITE_BASE_URL || '/mydoc/';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: '胖头鱼学习网站',
  tagline: '跨学科学习平台 · 编程 / 纹样 / 数学 / 物理 / 教育 / 诗歌文章',
  favicon: 'img/favicon.ico',

  url: SITE_URL,
  // baseUrl  需要改成你的仓库名，如果你启用了GitHub Pages，请改成你的仓库名,默认是/
  // 部署到独立站点（如 Qoder Sites）时用 SITE_BASE_URL=/ 覆盖，避免静态资源指向 /mydoc/
  baseUrl: BASE_URL,
  // 必须显式设置：不设置时 Docusaurus 走 legacy 分支，文件产出为「目录/index.html」，
  // 但 Link.js 不给 href 补尾斜杠。静态网关（GitHub Pages / Qoder Sites）不会自动补斜杠，
  // 于是站内所有链接刷新/直接访问都会 404。设为 true 后 href 与产物布局一致。
  trailingSlash: true,
  // 对于死链接，默认是warn，可以改成其他的选项，比如ignore,throw
  onBrokenLinks: 'throw',
  // 锚点也按死链处理：/concepts#id 与 /lab#kind 是手写锚点（已在页面里 collectAnchor 登记），
  // 保持 throw 才能在改标题/改 kind 时立刻发现断锚点
  onBrokenAnchors: 'throw',

  i18n: {
    defaultLocale: 'zh-CN',
    locales: ['zh-CN'],
  },

  themes: [
    // 图表：在 Markdown 中直接写 ```mermaid 代码块即可渲染
    '@docusaurus/theme-mermaid',
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        language: ['en', 'zh'], // 支持中英文
        indexBlog: false, // 博客已禁用
        indexDocs: true,
      },
    ],
  ],

  // 客户端模块：记录阅读进度，驱动「苗圃」生长与「知识地图」点亮
  clientModules: [require.resolve('./src/clientModules/trackProgress.js')],

  // 本地插件：start/build 启动与 dev 每次重编译前，重扫 docs frontmatter 生成地图数据（src/data/tracks.json）
  plugins: [require.resolve('./scripts/gen-tracks-plugin')],

  // Docusaurus 3.x 开启 Mermaid 支持（配合上面的 theme-mermaid）
  // 注：docs/math/* 里的行内公式统一用 $ ... $ 而不是 \( ... \)：
  //   • remark-math 在 micromark 层识别 $...$，把内部 {...} 归为数学节点
  //   • 若用 \(...\) 则 MDX 会把 LaTeX 里的花括号当作 JSX 表达式，构建失败
  markdown: {
    mermaid: true,
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // 每篇文档底部出现「编辑此页」按钮，指向 GitHub main 分支
          editUrl: 'https://github.com/chxu11/mydoc/edit/main/',
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
          routeBasePath: 'docs',
          // KaTeX 数学公式支持（docs/math 依赖）
          // 注意：remark-math@6 / rehype-katex@7 是 ESM-only，在 CJS 配置中需取 .default
          remarkPlugins: [require('remark-math').default],
          rehypePlugins: [[require('rehype-katex').default, {output: 'htmlAndMathml'}]],
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
      // 分享卡片：Docusaurus 只输出 twitter:card，不会自动补图，这里显式给一张
      metadata: [
        {
          property: 'og:image',
          content: `${SITE_URL}${BASE_URL}img/docusaurus-social-card.jpg`,
        },
        {
          name: 'twitter:image',
          content: `${SITE_URL}${BASE_URL}img/docusaurus-social-card.jpg`,
        },
      ],
      navbar: {
        title: '胖头鱼学习网站',
        logo: {
          alt: 'Logo',
          src: 'img/logo.svg',
        },
        items: [
          // 知识地图（学习主线的可视化导航）
          {
            to: '/map',
            label: '地图',
            position: 'left',
          },
          // 概念坐标（跨栏目换乘枢纽，按概念重排站点）
          {
            to: '/concepts',
            label: '概念',
            position: 'left',
          },
          // 参数化实验室（纹样七母题 + 数学七图形，母题 → 参数 → 图形，可拖可导出）
          {
            to: '/lab',
            label: '实验室',
            position: 'left',
          },
          // 文档入口（默认打开文档首页 /docs/0）
          {
            to: '/docs/0',
            label: '文档',
            position: 'left',
          },
          // 六大学习栏目（下拉直达各栏首页；清单来自 src/data/columns.cjs）
          {
            type: 'dropdown',
            label: '栏目',
            position: 'left',
            items: navbarDropdownItems,
          },
          // 右侧：搜索 + 关于 + GitHub
          {
            type: 'search',
            position: 'right',
          },
          {
            to: '/about',
            label: '关于',
            position: 'right',
          },
          {
            href: 'https://github.com/chxu11/mydoc',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },

      footer: {
        style: 'dark',
        links: [
          {
            title: '学习方向',
            items: footerLearningItems,
          },
          {
            title: '资源导航',
            items: [
              {label: '知识地图', to: '/map'},
              {label: '文档首页', to: '/docs/0'},
              {label: '学习三大目标', to: '/docs/intro/1'},
              {label: '建站参考', to: '/docs/docusaurus/1'},
            ],
          },
          {
            title: '社区 & 关于',
            items: [
              {label: '关于「学者」', to: '/about'},
              {label: 'GitHub 仓库', href: 'https://github.com/chxu11/mydoc'},
              {label: '提交 Issue', href: 'https://github.com/chxu11/mydoc/issues'},
              {label: '作者主页', href: 'https://github.com/chxu11'},
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} 胖头鱼学习网站 · Built with Docusaurus.`,
      },

      prism: {
        theme: themes.github,
        darkTheme: themes.nightOwl,
      },

    }),
};

module.exports = config;