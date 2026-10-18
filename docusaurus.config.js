// @ts-check
const { themes } = require('prism-react-renderer');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: '胖头鱼学习网站',
  tagline: '跨学科学习平台 · 编程 / 纹样 / 数学 / 物理 / 教育 / 诗歌文章',
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

  // 客户端模块：记录阅读进度，驱动「苗圃」生长与「知识地图」点亮
  clientModules: [require.resolve('./src/clientModules/trackProgress.js')],

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
          // 文档入口（默认打开文档首页 /docs/0）
          {
            to: '/docs/0',
            label: '文档',
            position: 'left',
          },
          // 六大学习栏目（下拉直达各栏首页）
          {
            type: 'dropdown',
            label: '栏目',
            position: 'left',
            items: [
              {label: '💻 编程 · 前端 (React)', to: '/docs/react/1'},
              {label: '💻 编程 · Rust', to: '/docs/rust/1'},
              {label: '💻 编程 · Python', to: '/docs/python/1'},
              {label: '🎨 纹样', to: '/docs/patterns/1'},
              {label: '📐 数学', to: '/docs/math/1'},
              {label: '🔭 物理', to: '/docs/physics/1'},
              {label: '🎓 教育', to: '/docs/education/1'},
              {label: '📖 诗歌文章', to: '/docs/poetry/1'},
            ],
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
            items: [
              {label: '前端 (React)', to: '/docs/react/1'},
              {label: 'Rust', to: '/docs/rust/1'},
              {label: 'Python', to: '/docs/python/1'},
              {label: '纹样', to: '/docs/patterns/1'},
              {label: '数学证明', to: '/docs/math/1'},
              {label: '物理', to: '/docs/physics/1'},
              {label: '教育', to: '/docs/education/1'},
              {label: '诗歌文章', to: '/docs/poetry/1'},
            ],
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