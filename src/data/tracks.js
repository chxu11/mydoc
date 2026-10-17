/**
 * 各学习主线的站点数据。
 * 用于「知识地图」的渲染与阅读进度点亮。
 * short 为地图上的短标签，title 为完整标题，to 为文档路由。
 * kind: 'code' 编程线（共有「介绍/环境」换乘站）；'knowledge' 知识线（各站独立）。
 */

export const tracks = [
  {
    id: 'react',
    name: '前端',
    kind: 'code',
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
    kind: 'code',
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
    kind: 'code',
    color: '#3776ab',
    stations: [
      {pos: 1, short: '介绍', title: '1. Python 介绍', to: '/docs/python/1'},
      {pos: 2, short: '环境', title: '2. 环境搭建', to: '/docs/python/2'},
      {pos: 3, short: '变量', title: '3. 变量与控制流', to: '/docs/python/3'},
      {pos: 4, short: '数据结构', title: '4. 数据结构', to: '/docs/python/4'},
    ],
  },
  {
    id: 'patterns',
    name: '纹样',
    kind: 'knowledge',
    color: '#c2185b',
    stations: [
      {pos: 1, short: '总览', title: '1. 纹样总览', to: '/docs/patterns/1'},
      {pos: 2, short: '云雷纹', title: '2. 云雷纹', to: '/docs/patterns/2'},
      {pos: 3, short: '回纹', title: '3. Greek Key 希腊回纹', to: '/docs/patterns/3'},
      {pos: 4, short: '和风', title: '4. 日本纹样', to: '/docs/patterns/4'},
      {pos: 5, short: 'Girih', title: '5. Girih 伊斯兰几何', to: '/docs/patterns/5'},
      {pos: 6, short: '绳结', title: '6. 凯尔特绳结', to: '/docs/patterns/6'},
    ],
  },
  {
    id: 'math',
    name: '数学',
    kind: 'knowledge',
    color: '#5e35b1',
    stations: [
      {pos: 1, short: '巡礼', title: '1. 证明方法巡礼', to: '/docs/math/1'},
      {pos: 2, short: '素数', title: '2. 素数有无穷多个', to: '/docs/math/2'},
      {pos: 3, short: '根号2', title: '3. 根号2是无理数', to: '/docs/math/3'},
      {pos: 4, short: '毕氏', title: '4. 毕达哥拉斯定理', to: '/docs/math/4'},
      {pos: 5, short: '归纳', title: '5. 高斯求和与归纳法', to: '/docs/math/5'},
      {pos: 6, short: '贝叶斯', title: '6. 贝叶斯定理', to: '/docs/math/6'},
      {pos: 7, short: '分形', title: '7. 分形', to: '/docs/math/7'},
      {pos: 8, short: '傅里叶', title: '8. 傅里叶分析', to: '/docs/math/8'},
      {pos: 9, short: '几何', title: '9. 经典几何', to: '/docs/math/9'},
      {pos: 10, short: '黎曼', title: '10. 黎曼几何', to: '/docs/math/10'},
      {pos: 11, short: '欧拉', title: '11. 欧拉公式', to: '/docs/math/11'},
    ],
  },
  {
    id: 'physics',
    name: '物理',
    kind: 'knowledge',
    color: '#00838f',
    stations: [
      {pos: 1, short: '地图', title: '1. 物理地图', to: '/docs/physics/1'},
      {pos: 2, short: '力学', title: '2. 从牛顿到波', to: '/docs/physics/2'},
    ],
  },
  {
    id: 'education',
    name: '教育',
    kind: 'knowledge',
    color: '#ef6c00',
    stations: [
      {pos: 1, short: '学法', title: '1. 怎么学一门硬知识', to: '/docs/education/1'},
      {pos: 2, short: '记忆', title: '2. 间隔重复与记忆', to: '/docs/education/2'},
    ],
  },
  {
    id: 'poetry',
    name: '诗歌文章',
    kind: 'knowledge',
    color: '#8d6e63',
    stations: [
      {pos: 1, short: '导读', title: '1. 诗歌文章 · 导读', to: '/docs/poetry/1'},
      {pos: 2, short: '苏轼', title: '2. 自题金山画像 · 苏轼', to: '/docs/poetry/2'},
      {pos: 3, short: '李白', title: '3. 赠江夏韦太守良宰 · 李白', to: '/docs/poetry/3'},
      {pos: 4, short: '庄子', title: '4. 逍遥游 · 庄子', to: '/docs/poetry/4'},
      {pos: 5, short: '张岱', title: '5. 湖心亭看雪 · 张岱', to: '/docs/poetry/5'},
      {pos: 6, short: '归有光', title: '6. 项脊轩志 · 归有光', to: '/docs/poetry/6'},
      {pos: 7, short: '史铁生', title: '7. 我与地坛 · 史铁生', to: '/docs/poetry/7'},
    ],
  },
];

export const totalStations = tracks.reduce((n, t) => n + t.stations.length, 0);
