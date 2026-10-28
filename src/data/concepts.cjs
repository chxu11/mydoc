/**
 * 换乘枢纽词表（概念坐标的单一事实源）。
 *
 * 一个概念 = 一条「跨栏目换乘线」：同一件事在纹样 / 数学 / 物理 / 编程 / 诗歌里
 * 的不同讲法。文档 frontmatter 用 `concepts: [symmetry, wave]` 认领概念，
 * 由 scripts/gen-tracks.js 汇总成 src/data/concepts.json。
 *
 * 契约（构建期校验）：
 *   · 只能使用本表里的 id，写错即构建失败；
 *   · 每个概念至少要落在 2 条不同线路上，否则不算枢纽（构建失败）。
 */
const concepts = [
  {
    id: 'symmetry',
    label: '对称',
    blurb:
      '对称不止是镜像：Girih 的十重旋转、欧拉公式里的旋转、中文格言与对联的对仗——数学、纹样与文字在同一条线上换乘。',
  },
  {
    id: 'infinity',
    label: '无穷',
    blurb:
      '欧几里得用「再加 1」证明素数用不完，分形把无穷塞进一小块平面，Greek Key 用一条线无限折返，庄子用「大小之辩」讲无限。',
  },
  {
    id: 'uncertainty',
    label: '不确定性',
    blurb:
      '贝叶斯把不确定变成可更新的信念，量子力学说它可能是世界本身的性质——一个在纸上算，一个在实验室里量。',
  },
  {
    id: 'dimension',
    label: '维度',
    blurb:
      '黎曼给空间加弯曲，爱因斯坦给时空加时间，房龙给历史加地理——「升维」在不同学科里是同一个动作。',
  },
  {
    id: 'wave',
    label: '波与频率',
    blurb:
      '振动、电磁波、傅里叶级数、日本的青海波——物理、数学与纹样共享同一个形状：把周期画出来。',
  },
  {
    id: 'order',
    label: '秩序与混沌',
    blurb:
      '密铺的秩序、分形在混沌边缘的自相似、熵增给出的时间箭头——结构如何生成，又如何耗散。',
  },
];

const conceptById = Object.fromEntries(concepts.map((c) => [c.id, c]));

module.exports = {concepts, conceptById};
