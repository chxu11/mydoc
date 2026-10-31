/**
 * 图片本地化（node scripts/fetch-images.mjs [--dry-run|--check|--force]）。
 *
 * 为什么要它：docs 里三十多张示意图全部直链 Wikimedia 的
 * `Special:FilePath/<文件名>?width=900`。那是个**重定向服务**，不是稳定资源：
 * 文件被改名/删除、Commons 限流、访问者所在网络到不了 wikimedia，图就当场裂开，
 * 而构建期什么都不会报（onBrokenLinks 只管站内链接）。GitHub Pages 上的学习站
 * 不该把可读性押在第三方可用性上。
 *
 * 三种模式：
 *   · 默认      ：下载缺失的图片到 static/img/docs/，并把 md 里的外链改写成 /img/docs/…
 *   · --dry-run  ：只打印计划（每张图会存成什么名字、哪篇正文引用它），不碰网络不写文件
 *   · --check    ：门禁模式，要求「docs 里已无站内可控的远程图」且「每张本地图都在
 *                  static/ 里真实存在、且登记在 manifest.json」。CI 里跑这个。
 *
 * 命名是**确定性**的：文件名 = 原始文件名(ASCII 化) + 请求宽度 + 整个 URL 的 sha1 前 8 位。
 * 同一个 URL 永远落在同一个文件上，所以脚本可以反复运行、只补缺失的那几张；
 * 中文文件名（云雷纹大铜鼓.jpg）ASCII 化后为空，则退化成 `file-<宽度>-<hash>`。
 *
 * 许可：图片全部来自 Wikimedia Commons，公有领域或 CC 自由许可；manifest.json
 * 逐张记录来源 URL 与字节数，等于一份可追溯的出处清单。
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = path.join(ROOT, 'docs');
const OUT_DIR = path.join(ROOT, 'static', 'img', 'docs');
const MANIFEST = path.join(OUT_DIR, 'manifest.json');
const PUBLIC_BASE = '/img/docs';

/** 只搬这些域名的图；其余远程链接（example.com 这类教程示例）一律不动 */
const HOSTS = new Set([
  'commons.wikimedia.org',
  'en.wikipedia.org',
  'zh.wikipedia.org',
]);

/** Wikimedia 要求带可识别的 User-Agent，裸 fetch 容易被 403 */
const UA =
  'mydoc-site-assets/1.0 (personal study site; https://github.com/pangtouyu/mydoc) node/undici';

const MODE = process.argv.includes('--check')
  ? 'check'
  : process.argv.includes('--dry-run')
    ? 'dry'
    : 'fetch';
const FORCE = process.argv.includes('--force');

const sha1 = (s) => crypto.createHash('sha1').update(s).digest('hex');

const listMarkdown = (dir) => {
  const out = [];
  for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...listMarkdown(p));
    else if (e.name.endsWith('.md')) out.push(p);
  }
  return out;
};

/**
 * 从 `![alt](https://commons.wikimedia.org/wiki/Special:FilePath/Name.png?width=900)`
 * 里抽出 {url, name, width}。只认 markdown 图片语法（站内没有 <img> 写法）。
 */
function parseImage(url) {
  let u;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  if (!HOSTS.has(u.hostname)) return null;
  const m = u.pathname.match(/Special:FilePath\/(.+)$/i);
  if (!m) return null;
  const raw = decodeURIComponent(m[1]);
  const ext = path.extname(raw).toLowerCase() || '.png';
  const ascii = raw
    .replace(/\.[^.]+$/, '')
    .replace(/[^\w.-]+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
    .toLowerCase()
    .slice(0, 48);
  const width = u.searchParams.get('width');
  const stem = [ascii || 'file', width ? `w${width}` : ''].filter(Boolean).join('-');
  return {name: raw, ext, file: `${stem}-${sha1(url).slice(0, 8)}${ext}`};
}

/* ---------- 扫描 ---------- */

const refs = []; // {url, file, ext, name, doc, line}
for (const doc of listMarkdown(DOCS)) {
  const text = fs.readFileSync(doc, 'utf8');
  text.split('\n').forEach((line, i) => {
    for (const m of line.matchAll(/!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/g)) {
      const parsed = parseImage(m[1]);
      if (parsed) {
        refs.push({...parsed, url: m[1], doc: path.relative(ROOT, doc), line: i + 1});
      }
    }
  });
}

const byUrl = new Map();
for (const r of refs) {
  if (!byUrl.has(r.url)) byUrl.set(r.url, r);
}

/** 站内已经引用的本地 /img/docs 资源 */
const localRefs = new Set();
for (const doc of listMarkdown(DOCS)) {
  const text = fs.readFileSync(doc, 'utf8');
  for (const m of text.matchAll(/!\[[^\]]*\]\((?:https?:\/\/[^)\s]+|([^)\s]*))\)/g)) {
    const rel = m[1];
    if (rel && rel.startsWith(`${PUBLIC_BASE}/`)) localRefs.add(rel.slice(PUBLIC_BASE.length + 1));
  }
}

const manifest = fs.existsSync(MANIFEST)
  ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8'))
  : {};

console.log(
  `${{dry: '[dry-run] 只报计划', fetch: '[fetch] 下载并改写', check: '[check] 门禁模式'}[MODE]} ` +
    `远程图 ${byUrl.size} 张（引用 ${refs.length} 处）/ 本地引用 ${localRefs.size} 张`,
);

/* ---------- 门禁 ---------- */

if (MODE === 'check') {
  const problems = [];
  if (refs.length) {
    for (const r of refs) problems.push(`${r.doc}:${r.line} 仍是远程直链 ${r.name}`);
  }
  for (const f of localRefs) {
    const abs = path.join(OUT_DIR, f);
    if (!fs.existsSync(abs)) problems.push(`本地引用缺文件 ${PUBLIC_BASE}/${f}`);
    else if (fs.statSync(abs).size < 512) problems.push(`文件疑似空壳 ${f}（${fs.statSync(abs).size} B）`);
    if (!(f in manifest)) problems.push(`${f} 未登记在 manifest.json（出处丢失）`);
  }
  if (problems.length) {
    for (const p of problems) console.log(`  FAIL ${p}`);
    console.log(`\n合计 ${problems.length} 项问题。跑 npm run fetch:images 补齐后再构建。`);
    process.exit(1);
  }
  console.log(`  ok   docs 里已无 Wikimedia 直链，${localRefs.size} 张本地图齐备且有出处记录`);
  console.log(`\n合计 0 项问题。`);
  process.exit(0);
}

/* ---------- 计划 ---------- */

const plan = [];
for (const r of [...byUrl.values()].sort((a, b) => a.file.localeCompare(b.file))) {
  const abs = path.join(OUT_DIR, r.file);
  const hit = fs.existsSync(abs) && !FORCE;
  plan.push({...r, abs, skip: hit});
  const users = refs.filter((x) => x.url === r.url).map((x) => x.doc);
  console.log(
    `  ${hit ? 'skip' : 'GET '} ${r.file}\n         ← ${r.name}\n         引用：${[...new Set(users)].join('、')}`,
  );
}

if (MODE === 'dry') {
  console.log(`\n[dry-run] 需要下载 ${plan.filter((p) => !p.skip).length} 张，改写后 docs 引用变为 ${PUBLIC_BASE}/<文件名>。`);
  console.log('[dry-run] 真正执行：npm run fetch:images');
  process.exit(0);
}

/* ---------- 下载 ---------- */

fs.mkdirSync(OUT_DIR, {recursive: true});

const failures = [];
for (const p of plan) {
  if (p.skip) continue;
  try {
    const res = await fetch(p.url, {headers: {'User-Agent': UA}, redirect: 'follow'});
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const type = res.headers.get('content-type') ?? '';
    const buf = Buffer.from(await res.arrayBuffer());
    if (!type.startsWith('image/')) throw new Error(`content-type=${type}`);
    if (buf.length < 512) throw new Error(`只有 ${buf.length} B，疑似占位图`);
    fs.writeFileSync(p.abs, buf);
    manifest[path.basename(p.abs)] = {
      source: p.url,
      upstreamName: p.name,
      bytes: buf.length,
      type,
      sha1: sha1(buf),
      fetchedAt: new Date().toISOString().slice(0, 10),
    };
    console.log(`  ok   ${p.file}  ${(buf.length / 1024).toFixed(0)} KB`);
  } catch (e) {
    failures.push(`${p.file}: ${e.message}`);
    console.log(`  FAIL ${p.file}: ${e.message}`);
  }
}

/* ---------- 改写正文 ---------- */

if (failures.length) {
  console.log(`\n${failures.length} 张下载失败，正文一律不改写（裂链不会被替换成本地 404）。`);
  process.exit(1);
}

let rewritten = 0;
for (const doc of listMarkdown(DOCS)) {
  const before = fs.readFileSync(doc, 'utf8');
  const after = before.replace(
    /(!\[[^\]]*\]\()(https?:\/\/[^)\s]+)(\))/g,
    (whole, head, url, tail) => {
      const parsed = parseImage(url);
      if (!parsed) return whole;
      rewritten += 1;
      return `${head}${PUBLIC_BASE}/${parsed.file}${tail}`;
    },
  );
  if (after !== before) fs.writeFileSync(doc, after);
}

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');

console.log(
  `\n下载 ${plan.filter((p) => !p.skip).length} 张 / 改写引用 ${rewritten} 处 / ` +
    `出处清单 ${Object.keys(manifest).length} 条 → static/img/docs/manifest.json`,
);
console.log('下一步：npm run build（会连 onBrokenLinks 一起验图），再 npm run check:images。');
