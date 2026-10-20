import {countOf} from '@site/src/data/tracks';

/**
 * 文档首页（docs/intro.md）的栏目清单。
 * 篇数全部由 tracks.js 的 countOf 派生；hint 只描述内容构成，不写数字。
 * 新增一篇：docs 文件 + tracks.js 加站即可，本页计数自动更新。
 */
const LINES = [
  {
    emoji: '💻',
    name: '编程',
    hint: '主线所在',
    subs: [
      {emoji: '🌐', name: '前端', text: `已上线 ${countOf('react')} 篇 React 入门（含 TodoList 实战）；后续覆盖 JavaScript、TypeScript、工程化`},
      {emoji: '🦀', name: 'Rust', text: `已上线 ${countOf('rust')} 篇基础（介绍 / 环境 / 变量与类型 / ⭐ 所有权）`},
      {emoji: '🐍', name: 'Python', text: `已上线 ${countOf('python')} 篇基础（介绍 / 环境 / 变量与控制流 / 数据结构）`},
      {emoji: '☕', name: 'Java', text: '附属子栏目（另有 📚 建站参考教程）'},
    ],
  },
  {emoji: '🎨', name: '纹样', track: 'patterns', hint: '世界经典图案（以图为主，跨越五大文明）'},
  {emoji: '📐', name: '数学', track: 'math', hint: '经典证明与可视化（反证、归纳、分形、欧拉公式…），末篇伴读《数学精英》'},
  {emoji: '🔭', name: '物理', track: 'physics', hint: '主线（物理地图 → 从牛顿到波 → 电磁与光 → 热与熵 → 相对论 → 量子力学），末篇伴读《超越时空》'},
  {emoji: '🎓', name: '教育', track: 'education', hint: '（怎么学硬知识、间隔重复、专注、笔记、读难书、项目驱动、育儿语录）'},
  {emoji: '📖', name: '诗歌文章', track: 'poetry', hint: '（苏轼、李白、庄子、张岱、归有光、史铁生、洛克菲勒家书、格言联语、士人语录、名联、房龙伴读）'},
];

export default function ColumnStats() {
  return (
    <ul>
      {LINES.map((l) => (
        <li key={l.name}>
          {l.subs ? (
            <>
              {l.emoji} <strong>{l.name}</strong>：{l.hint}
              <ul>
                {l.subs.map((s) => (
                  <li key={s.name}>
                    {s.emoji} <strong>{s.name}</strong>：{s.text}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              {l.emoji} <strong>{l.name}</strong>：已上线 {countOf(l.track)} 篇{l.hint}
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
