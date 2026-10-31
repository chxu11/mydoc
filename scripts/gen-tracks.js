#!/usr/bin/env node
// @ts-check
/**
 * 知识地图数据生成器：扫描 docs/ 各栏目目录的 Markdown frontmatter，
 * 生成 src/data/tracks.json（站点与线路）与 src/data/concepts.json（换乘枢纽），
 * 均由 src/data 下的同名 shim 再导出。
 *
 * 约定（新增一篇文档只需改内容本身，地图/篇数/进度点亮自动跟随）：
 *   · slug          → 路由 /docs/<dir>/<slug>
 *   · mapShort      → 地图上的短标签
 *   · title         → 地图完整站名（自动规整为「N. 标题」格式）
 *   · 文件名数字前缀 → 站点顺序（01-, 02-, ...）
 *   · concepts      → 可选的换乘枢纽 id 数组，取自 src/data/concepts.cjs
 *
 * 栏目显示名来自 src/data/columns.cjs（导航单一事实源）；
 * 颜色与线路类型（code/knowledge）是本脚本内的展示配置。
 * 跳过 intro / docusaurus（非学习主线）。
 * 契约：主线栏目内的 md 必须带 slug + mapShort；slug 必须等于文件名序号
 * （进度按 slug 记、站点按序号点亮）；concepts 只能是词表内 id，
 * 且每个概念至少要落在 2 条不同线路上——否则抛错（构建期拦截）。
 * 也可作为模块被 scripts/gen-tracks-plugin.js 调用（generate(docsDir)）。
 */
const fs = require('fs');
const path = require('path');
const {columns} = require('../src/data/columns.cjs');
const {concepts: CONCEPTS, conceptById} = require('../src/data/concepts.cjs');

const ROOT = path.resolve(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');
const OUT = path.join(ROOT, 'src/data/tracks.json');
const OUT_CONCEPTS = path.join(ROOT, 'src/data/concepts.json');

/** 展示配置：线路颜色 + 类型（与原 tracks.js 一致） */
const STYLE = {
  react: {color: '#2e8555', kind: 'code'},
  rust: {color: '#b7410e', kind: 'code'},
  python: {color: '#3776ab', kind: 'code'},
  patterns: {color: '#c2185b', kind: 'knowledge'},
  math: {color: '#5e35b1', kind: 'knowledge'},
  physics: {color: '#00838f', kind: 'knowledge'},
  education: {color: '#ef6c00', kind: 'knowledge'},
  poetry: {color: '#8d6e63', kind: 'knowledge'},
};
const SKIP = new Set(['intro', 'docusaurus', 'java']);

/** 极简 frontmatter 解析：顶层标量 + 单行数组（如 concepts: [infinity, wave]） */
function parseFrontmatter(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  /** @type {Record<string, string | string[]>} */
  const fields = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    const raw = kv[2].trim().replace(/^['"]|['"]$/g, '');
    const arr = raw.match(/^\[(.*)\]$/);
    fields[kv[1]] = arr
      ? arr[1]
          .split(',')
          .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
          .filter(Boolean)
      : raw;
  }
  return fields;
}

/** 标题去掉原有数字前缀，规整为「N. 标题」 */
function normalizeTitle(fm, pos) {
  const bare = (fm.title || fm.slug || '未命名').replace(/^\d+\.\s*/, '');
  return `${pos}. ${bare}`;
}

const tracks = [];
const dirsOnDisk = new Set(DOCSDirs());
const contractErrors = [];
// 按 columns.cjs 声明序迭代，线路顺序与导航一致
for (const entry of columns) {
  const dir = entry.id;
  if (SKIP.has(dir) || !STYLE[dir] || !dirsOnDisk.has(dir)) continue;

  const files = fs
    .readdirSync(path.join(DOCS, dir))
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .sort(); // 文件名数字前缀决定顺序

  const stations = [];
  for (const [i, f] of files.entries()) {
    const fm = parseFrontmatter(fs.readFileSync(path.join(DOCS, dir, f), 'utf8'));
    if (!fm) {
      contractErrors.push(`docs/${dir}/${f}: 缺少 frontmatter`);
      continue;
    }
    const missing = ['slug', 'mapShort'].filter((k) => !fm[k]);
    if (missing.length) {
      contractErrors.push(`docs/${dir}/${f}: 缺少必填字段 ${missing.join(' / ')}`);
      continue;
    }
    const pos = i + 1;
    // 进度键契约：客户端按 URL 里的 slug 记「已读」，地图按文件名序号点亮。
    // 两者必须相等，否则读过的站会点不亮，或者点亮隔壁站。
    if (String(fm.slug) !== String(pos)) {
      contractErrors.push(
        `docs/${dir}/${f}: slug “${fm.slug}” 与文件名序号 ${pos} 不一致（进度按 slug 记录，站点按序号点亮，两者必须相等）`,
      );
    }
    // 换乘枢纽：必须取自词表，写错即构建失败（防止概念页出现空锚点）
    const claimed = Array.isArray(fm.concepts) ? [...new Set(fm.concepts)] : [];
    for (const c of claimed) {
      if (!conceptById[c]) {
        contractErrors.push(
          `docs/${dir}/${f}: concepts 含未知概念 “${c}”（可选：${CONCEPTS.map((x) => x.id).join(' / ')}）`,
        );
      }
    }
    stations.push({
      pos,
      short: fm.mapShort,
      title: normalizeTitle(fm, pos),
      to: `/docs/${dir}/${fm.slug}`,
      ...(claimed.length ? {concepts: claimed} : {}),
    });
  }

  // 显示名取栏目 label：去 emoji、「(React) 」类括注留磁盘目录语义，地图用短名
  const name = entry.name.replace(/\s*\([^)]*\)$/, '');
  tracks.push({id: dir, name, kind: STYLE[dir].kind, color: STYLE[dir].color, stations});
}

function DOCSDirs() {
  return fs
    .readdirSync(DOCS, {withFileTypes: true})
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

/* ---------- 换乘枢纽：把各站认领的概念汇总成「概念 → 站点」索引 ---------- */
/** @type {Record<string, Array<{track: string, pos: number, short: string, title: string, to: string}>>} */
const conceptIndex = {};
for (const track of tracks) {
  for (const station of track.stations) {
    for (const id of station.concepts ?? []) {
      (conceptIndex[id] ??= []).push({
        track: track.id,
        pos: station.pos,
        short: station.short,
        title: station.title,
        to: station.to,
      });
    }
  }
}

// 每个概念必须真的跨栏目：只落在一条线路上的「枢纽」没有换乘对象
for (const [id, entries] of Object.entries(conceptIndex)) {
  const lineCount = new Set(entries.map((e) => e.track)).size;
  if (lineCount < 2) {
    contractErrors.push(
      `概念 “${id}” 只落在 1 条线路上，跨栏目枢纽至少需要 2 条线路（当前 ${entries[0]?.to}）`,
    );
  }
}

if (contractErrors.length) {
  throw new Error(
    `\n[gen-tracks] frontmatter / 换乘枢纽契约校验失败（${contractErrors.length} 处）：\n  ${contractErrors.join('\n  ')}\n`,
  );
}

fs.writeFileSync(OUT, JSON.stringify(tracks, null, 2) + '\n');
fs.writeFileSync(OUT_CONCEPTS, JSON.stringify(conceptIndex, null, 2) + '\n');
const total = tracks.reduce((n, t) => n + t.stations.length, 0);
console.log(
  `[gen-tracks] ${tracks.length} 条线路 / ${total} 站 / ${Object.keys(conceptIndex).length} 个换乘枢纽 → src/data/{tracks,concepts}.json`,
);

module.exports = {tracks, total, conceptIndex};
