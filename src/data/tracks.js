/**
 * 三条学习主线的站点数据。
 * 用于「花园首页」与「知识地铁图」的渲染。
 * short 为地图/苗圃上的短标签，title 为完整标题，to 为文档路由。
 */

export const tracks = [
  {
    id: 'react',
    name: '前端',
    emoji: '🌐',
    color: '#2e8555',
    stations: [
      {pos: 1, short: '介绍', title: '1. React 介绍', to: '/docs/react/1'},
      {pos: 2, short: '环境', title: '2. 环境搭建', to: '/docs/react/2'},
      {pos: 3, short: 'Props', title: '3. 组件与 Props', to: '/docs/react/3'},
      {pos: 4, short: 'State', title: '4. 状态 State', to: '/docs/react/4'},
      {pos: 5, short: '事件', title: '5. 事件处理', to: '/docs/react/5'},
      {pos: 6, short: '渲染', title: '6. 渲染技巧', to: '/docs/react/6'},
      {pos: 7, short: '实战', title: '7. 实战项目 TodoList', to: '/docs/react/7'},
      {pos: 8, short: '进阶', title: '8. 后续学习方向', to: '/docs/react/8'},
    ],
  },
  {
    id: 'rust',
    name: 'Rust',
    emoji: '🦀',
    color: '#b7410e',
    stations: [
      {pos: 1, short: '介绍', title: '1. Rust 介绍', to: '/docs/rust/1'},
      {pos: 2, short: '环境', title: '2. 环境搭建', to: '/docs/rust/2'},
      {pos: 3, short: '变量', title: '3. 变量与类型', to: '/docs/rust/3'},
      {pos: 4, short: '所有权', title: '4. 所有权 Ownership', to: '/docs/rust/4'},
    ],
  },
  {
    id: 'python',
    name: 'Python',
    emoji: '🐍',
    color: '#3776ab',
    stations: [
      {pos: 1, short: '介绍', title: '1. Python 介绍', to: '/docs/python/1'},
      {pos: 2, short: '环境', title: '2. 环境搭建', to: '/docs/python/2'},
      {pos: 3, short: '变量', title: '3. 变量与控制流', to: '/docs/python/3'},
      {pos: 4, short: '数据结构', title: '4. 数据结构', to: '/docs/python/4'},
    ],
  },
];

export const totalStations = tracks.reduce((n, t) => n + t.stations.length, 0);
