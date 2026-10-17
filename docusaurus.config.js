// @ts-check
const { themes } = require('prism-react-renderer');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: '胖头鱼学习网站',
  tagline: '编程教程学习平台',
  favicon: 'img/favicon.ico',

  url: 'https://chxu11.github.io',
  // baseUrl  需要改成你的仓库名，如果你启用了GitHub Pages，请改成你的仓库名,默认是/
  baseUrl: '/mydoc/',
  // 对于死链接，默认是warn，可以改成其他的选项，比如ignore,throw
  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'zh-CN',
    locales: ['zh-CN'],
  },

  themes: [
    // 图表：在 Markdown 中直接写 ```mermaid 代码块即可渲染
    '@docusaurus/theme-mermaid',
    // 交互式代码块：在 ```js live 中编辑并即时运行
    '@docusaurus/theme-live-codeblock',
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

  // Docusaurus 3.x 开启 Mermaid 支持（配合上面的 theme-mermaid）
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
          // 站点首页
          {
            to: '/',
            label: '🏠 首页',
            position: 'left',
          },
          // 文档入口（默认打开文档首页 /docs/0）
          {
            to: '/docs/0',
            label: '📘 文档',
            position: 'left',
          },
          // 标签浏览（Docusaurus 自动根据 frontmatter tags 生成）
          {
            to: '/docs/tags',
            label: '🏷 标签',
            position: 'left',
          },
          // 学习方向快捷入口
          {
            type: 'dropdown',
            label: '🎯 学习方向',
            position: 'left',
            items: [
              {label: '🌐 前端 (React)', to: '/docs/react/1'},
              {label: '🦀 Rust', to: '/docs/rust/1'},
              {label: '🐍 Python', to: '/docs/python/1'},
              {type: 'html', value: '<hr style="margin: 0.4rem 0; border: 0; border-top: 1px solid var(--ifm-color-emphasis-300);">'},
              {label: '📚 建站参考', to: '/docs/docusaurus/1'},
            ],
          },
          // 右侧：搜索 + 关于 + GitHub
          {
            type: 'search',
            position: 'right',
          },
          {
            to: '/about',
            label: '🖋 关于',
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
            title: '🎯 学习方向',
            items: [
              {label: '🌐 前端 (React)', to: '/docs/react/1'},
              {label: '🦀 Rust', to: '/docs/rust/1'},
              {label: '🐍 Python', to: '/docs/python/1'},
            ],
          },
          {
            title: '📚 资源导航',
            items: [
              {label: '📘 文档首页', to: '/docs/0'},
              {label: '🎯 学习三大目标', to: '/docs/intro/1'},
              {label: '🏷 标签浏览', to: '/docs/tags'},
              {label: '⚙️ 建站参考', to: '/docs/docusaurus/1'},
            ],
          },
          {
            title: '🌍 社区 & 关于',
            items: [
              {label: '🖋 关于「学者」', to: '/about'},
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

      // ---------- 公告栏：写有信息量的文案，而不是纯装饰 ----------
      announcementBar: {
        id: 'welcome_2026',
        content:
          '🎯 学习主线：<a href="/mydoc/docs/react/1">前端</a> · <a href="/mydoc/docs/rust/1">Rust</a> · <a href="/mydoc/docs/python/1">Python</a>　|　⭐ 欢迎 <a href="https://github.com/chxu11/mydoc" target="_blank" rel="noopener noreferrer">Star & 贡献</a>',
        backgroundColor: '#fafbfc',
        textColor: '#091E42',
        isCloseable: true,
      },

    }),
};

module.exports = config;