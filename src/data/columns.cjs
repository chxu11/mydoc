/**
 * 栏目入口的单一事实源（CJS，Node 端与浏览器端共用）。
 * docusaurus.config.js 用它生成 navbar「栏目」下拉与 footer「学习方向」；
 * src/pages/index.js 用它生成首页卡片（篇数再由 tracks.js 的 countOf 派生）。
 * 新增栏目改这里一处，导航与页脚入口即同步出现。
 */
const columns = [
  {id: 'react', emoji: '💻', group: '编程', name: '前端 (React)', to: '/docs/react/1'},
  {id: 'rust', emoji: '💻', group: '编程', name: 'Rust', to: '/docs/rust/1'},
  {id: 'python', emoji: '💻', group: '编程', name: 'Python', to: '/docs/python/1'},
  {id: 'patterns', emoji: '🎨', name: '纹样', to: '/docs/patterns/1', cardHint: '世界经典图案'},
  {id: 'math', emoji: '📐', name: '数学', to: '/docs/math/1', cardHint: '经典证明与可视化'},
  {id: 'physics', emoji: '🔭', name: '物理', to: '/docs/physics/1', cardHint: '力学→电磁→热→相对论→量子'},
  {id: 'education', emoji: '🎓', name: '教育', to: '/docs/education/1', cardHint: '学习方法与育儿语录'},
  {id: 'poetry', emoji: '📖', name: '诗歌文章', to: '/docs/poetry/1', cardHint: '诗词古文、家书格言与伴读'},
];

/** navbar「栏目」下拉：编程子项带组名前缀，独立栏目直接列名 */
const navbarDropdownItems = columns.map((c) => ({
  label: c.group ? `${c.emoji} ${c.group} · ${c.name}` : `${c.emoji} ${c.name}`,
  to: c.to,
}));

/** footer「学习方向」：逐栏目直达 */
const footerLearningItems = columns.map((c) => ({label: c.name, to: c.to}));

module.exports = {columns, navbarDropdownItems, footerLearningItems};
