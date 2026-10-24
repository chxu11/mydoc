#!/usr/bin/env node
// @ts-check
/**
 * 知识地图数据生成器：扫描 docs/ 各栏目目录的 Markdown frontmatter，
 * 生成 src/data/tracks.json（由 src/data/tracks.js shim 再导出）。
 *
 * 约定（新增一篇文档只需改内容本身，地图/篇数/进度点亮自动跟随）：
 *   · slug          → 路由 /docs/<dir>/<slug>
 *   · mapShort      → 地图上的短标签
 *   · title         → 地图完整站名（自动规整为「N. 标题」格式）
 *   · 文件名数字前缀 → 站点顺序（01-, 02-, ...）
 *
 * 栏目显示名来自 src/data/columns.cjs（导航单一事实源）；
 * 颜色与线路类型（code/knowledge）是本脚本内的展示配置。
 * 跳过 intro / docusaurus（非学习主线）。
 * 契约：主线栏目内的 md 必须带 slug + mapShort，否则抛错（构建期拦截）。
 * 也可作为模块被 scripts/gen-tracks-plugin.js 调用（generate(docsDir)）。
 */
const fs = require('fs');
const path = require('path');
const {columns} = require('../src/data/columns.cjs');

const ROOT = path.resolve(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');
const OUT = path.join(ROOT, 'src/data/tracks.json');

/** 展示配置：线路颜色 + 类型（与原 tracks.js 一致） */
const STYLE = {
  react: {color: '#2e8555', kind: 'code'},
  rust: {color: '#b7410e', kind: 'code'},
  python: {color: '#3776ab', kind: 'code'},
  java: {color: '#f89820', kind: 'code'},
  patterns: {color: '#c2185b', kind: 'knowledge'},
  math: {color: '#5e35b1', kind: 'knowledge'},
  physics: {color: '#00838f', kind: 'knowledge'},
  education: {color: '#ef6c00', kind: 'knowledge'},
  poetry: {color: '#8d6e63', kind: 'knowledge'},
};
const SKIP = new Set(['intro', 'docusaurus']);

/** 极简 frontmatter 解析：只取顶层标量字段（本项目字段均为单行） */
function parseFrontmatter(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  /** @type {Record<string, string>} */
  const fields = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) fields[kv[1]] = kv[2].trim().replace(/^['"]|['"]$/g, '');
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
    stations.push({
      pos,
      short: fm.mapShort,
      title: normalizeTitle(fm, pos),
      to: `/docs/${dir}/${fm.slug}`,
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

if (contractErrors.length) {
  throw new Error(
    `\n[gen-tracks] frontmatter 契约校验失败（${contractErrors.length} 处）：\n  ${contractErrors.join('\n  ')}\n`,
  );
}

fs.writeFileSync(OUT, JSON.stringify(tracks, null, 2) + '\n');
const total = tracks.reduce((n, t) => n + t.stations.length, 0);
console.log(`[gen-tracks] ${tracks.length} 条线路 / ${total} 站 → src/data/tracks.json`);

module.exports = {tracks, total};
