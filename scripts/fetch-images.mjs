/**
 * 图片本地化（node scripts/fetch-images.mjs [--dry-run|--check|--force]）。
 *
 * 为什么要它：docs 里三十多张示意图全部直链 Wikimedia 的
 * `Special:FilePath/<文件名>?width=900`。那是个**重定向服务**，不是稳定资源：
 * 文件被改名/删除、Commons 限流、访问者所在网络到不了 wikimedia，图就当场裂开，
 * 而构建期什么都不会报（onBrokenLinks 只管站内链接）。GitHub Pages 上的学习站
 * 不该把可读性押在第三方可用性上。
 *
 * 各种模式（互斥的是前三个）：
 *   · 默认      ：下载缺失的图片到 static/img/docs/，并把 md 里的外链改写成
 *                `<img src={useBaseUrl("/img/docs/…")} alt="…" />`（原因见下面扫描段的注释）
 *   · --dry-run  ：只打印计划（每张图会存成什么名字、哪篇正文引用它），不碰网络不写文件
 *   · --check    ：门禁模式，要求「docs 里已无站内可控的远程图」且「每张本地图都在
 *                  static/ 里真实存在、且登记在 manifest.json」。CI 里跑这个。
 *   · --only X   ：本次只下载文件名/URL 含 X 的那几张（配合重试补漏）
 *   · --force    ：连本地已有的也重下
 *
 * 判定「已有」的门槛是**文件在且 manifest 里有它**：只按文件存在来跳过的话，
 * 一次中断就会留下一堆没出处的图（我们真踩过），而 --check 会一直报未登记。
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
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';

const execFileP = promisify(execFile);

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = path.join(ROOT, 'docs');
const OUT_DIR = path.join(ROOT, 'static', 'img', 'docs');
const MANIFEST = path.join(OUT_DIR, 'manifest.json');
const PUBLIC_BASE = '/img/docs';

/**
 * 只搬这些域名的图；其余远程链接（example.com 这类教程示例）一律不动。
 * 只认 commons：`*wikipedia.org/wiki/Special:FilePath/…` 那些文件其实也都托管在
 * Commons，换成 commons 域名后同一张图可取（正文里已统一改写）。这不是洁癖——
 * zh.wikipedia.org 的 Special:FilePath 在本机网络上直接连不通，commons 却通。
 */
const HOSTS = new Set(['commons.wikimedia.org']);

/** Wikimedia 要求带可识别的 User-Agent，裸请求容易被 403 */
const UA =
  'mydoc-site-assets/1.0 (personal study site; https://github.com/pangtouyu/mydoc) +script/curl';

const MODE = process.argv.includes('--check')
  ? 'check'
  : process.argv.includes('--dry-run')
    ? 'dry'
    : 'fetch';
const FORCE = process.argv.includes('--force');
/** --only <子串>：只处理文件名/URL 命中该子串的那几张（补漏用，不影响其余） */
const ONLY = (() => {
  const i = process.argv.indexOf('--only');
  return i > -1 ? process.argv[i + 1] : null;
})();

/**
 * content-type 会骗人（Commons 出错时也回 image/png），文件头不会。
 * ⚠️ 另一个坑：`Special:FilePath/foo.svg?width=900` 返回的是 **渲染后的 PNG**，
 * 不是矢量文件 —— 因为带 width 参数走的是缩略图服务。所以扩展名必须按真实字节定，
 * 并且对 SVG 额外试一次"去掉 width 拿原件"：拿到矢量就用矢量，拿不到才退回位图。
 */
const MAGICS = [
  ['image/png', '.png', (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))],
  ['image/jpeg', '.jpg', (b) => b[0] === 0xff && b[1] === 0xd8],
  ['image/gif', '.gif', (b) => b.subarray(0, 3).toString() === 'GIF'],
];

function actualType(buf) {
  if (buf.length < 512) return null;
  const head = buf.subarray(0, 512).toString('utf8');
  if (/<svg|<[?]xml/.test(head)) return {mime: 'image/svg+xml', ext: '.svg'};
  for (const [mime, ext, test] of MAGICS) if (test(buf)) return {mime, ext};
  return null;
}

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

/**
 * 图片链接的两种远程写法都要认（本地引用则统一成 `<img src={useBaseUrl("/img/docs/…")}>`）：
 *   · `![alt](远程 URL)` —— 正文里的原始写法；
 *   · `<img src="远程 URL" alt="…">` —— 手工写掉的图也接得住；
 *   · 文件名可以带空格（`Special:FilePath/Ideal-triangle hyperbolic tiling.svg`），
 *     markdown 允许这样写，所以不能按 `[^)\s]+` 截断，要允许空格、只在右括号前收尾。
 *
 * ⚠️ 为什么本地引用用 `<img>` 而不用 `![alt](/img/docs/…)`：
 * Docusaurus 会用 webpack 处理 markdown 里以 `/` 开头的图片，于是同一张图在产物里
 * 出现两份（assets/images/<hash> + static 原文件），10 MB 的图库直接翻倍。
 * 裸 `<img>` 原样进 HTML，只有一份；但 src 必须过 `useBaseUrl()`，否则站点挂在
 * GitHub Pages 的 `/mydoc/` 子路径下时，绝对路径 `/img/…` 会打到域名根目录 404
 * （dev server 挂在根路径，看不出这个问题 —— 只在生产构建暴露）。
 */
const REMOTE_MD = /!\[[^\]]*\]\(\s*([^)]+?)(?:\s+"[^"]*")?\s*\)/g;
const REMOTE_HTML = /<img\s+([^>]*?)\/?>/g;
const LOCAL_IMG =
  /(?:!\[[^\]]*\]\(\s*|<img\s+[^>]*?src=\{?useBaseUrl\("?"?)(\/img\/docs\/[^)\s"=]+)(?:\s+"[^"]*")?\s*\)?/g;
const USE_BASE_URL_IMPORT = `import useBaseUrl from '@docusaurus/useBaseUrl';`;

const attr = (attrs, name) => attrs.match(new RegExp(`${name}="([^"]*)"`))?.[1];

const refs = []; // {url, file, ext, name, doc, line}
const localRefs = new Set(); // 站内已引用的本地图
for (const doc of listMarkdown(DOCS)) {
  const rel = path.relative(ROOT, doc);
  fs.readFileSync(doc, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      for (const m of line.matchAll(REMOTE_MD)) {
        const parsed = parseImage(m[1]);
        if (parsed) refs.push({...parsed, url: m[1], doc: rel, line: i + 1});
      }
      for (const m of line.matchAll(REMOTE_HTML)) {
        const src = attr(m[1], 'src');
        const parsed = src && parseImage(src);
        if (parsed) refs.push({...parsed, url: src, doc: rel, line: i + 1});
      }
      for (const m of line.matchAll(LOCAL_IMG)) localRefs.add(m[1].slice(PUBLIC_BASE.length + 1));
    });
}

const byUrl = new Map();
for (const r of refs) {
  if (!byUrl.has(r.url)) byUrl.set(r.url, r);
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

/**
 * 本地可能已经存成哪个名字。首选原后缀，其次试渲染位图的后缀 ——
 * 因为 `foo.svg?width=900` 落盘其实是 .png，只认 .svg 的话每次重跑都会白下一遍。
 */
function landedFile(r) {
  for (const ext of [r.ext, ...MAGICS.map(([, e]) => e)]) {
    const f = ext === r.ext ? r.file : `${r.file.slice(0, -r.ext.length)}${ext}`;
    if (fs.existsSync(path.join(OUT_DIR, f)) && f in manifest) return f;
  }
  return null;
}

const plan = [];
for (const r of [...byUrl.values()].sort((a, b) => a.file.localeCompare(b.file))) {
  const landed = FORCE ? null : landedFile(r);
  const file = landed ?? r.file;
  plan.push({...r, file, abs: path.join(OUT_DIR, file), skip: Boolean(landed), landed});
  const users = refs.filter((x) => x.url === r.url).map((x) => x.doc);
  console.log(
    `  ${landed ? 'skip' : 'GET '} ${file}\n         ← ${r.name}\n         引用：${[...new Set(users)].join('、')}`,
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
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 下载走 curl 而不是 global fetch：Wikimedia 的 A 记录（103.102.166.x）在不少网络下
 * 直接连不通，而 AAAA（2001:df2:e500:ed1a::）是通的——node 的 fetch 会先试 IPv4
 * 然后 10 s 超时，报出来的却是含糊的 `fetch failed`。curl 可以显式 -6 / -4 逐个试，
 * 错误码也读得懂。三种协议栈各试 tries 次，退避后换下一个。
 */
async function curl(rawUrl, args) {
  // 正文里可以写带空格的 `Special:FilePath/Ideal-triangle hyperbolic tiling.svg`
  // （markdown 允许），但 curl 会报 "URL rejected: Malformed input"，先规范成 %20
  const u = new URL(rawUrl);
  const url = `${u.protocol}//${u.host}${u.pathname.replace(/ /g, '%20')}${u.search}${u.hash}`;
  const file = await fsp.mkdtemp(path.join(os.tmpdir(), 'mydoc-img-'));
  const out = path.join(file, 'body');
  try {
    await execFileP('curl', [
      ...args, '-sS', '-L', '--fail', '--max-time', '30',
      '-A', UA, '-o', out, url,
    ]);
    const buf = await fsp.readFile(out);
    return buf;
  } finally {
    await fsp.rm(file, {recursive: true, force: true});
  }
}

/** 去掉 ?width= 只保留其余参数，用来索取 SVG 原件 */
const withoutWidth = (url) => {
  const u = new URL(url);
  u.searchParams.delete('width');
  return u.toString();
};

/**
 * Adobe Illustrator 老导出的 SVG 用实体声明命名空间（xmlns="&ns_svg;"），
 * Docusaurus 的 image-size 读不出尺寸，构建时会 warning（浏览器倒是照画）。
 * 这种原件不要，退回带 width 的渲染位图。
 */
const legacyAiSvg = (buf) => /xmlns(:\w+)?="&/.test(buf.subarray(0, 4000).toString('utf8'));

async function grab(url, tries = 2) {
  let last = new Error('未尝试');
  // 协议栈顺序：先 -6（Wikimedia 的 A 记录在不少网络下连不通，AAAA 才是通的），
  // 再 -4，最后不指定让 curl 自己挑
  for (const stack of ['-6', '-4', '']) {
    for (let i = 0; i < tries; i++) {
      try {
        const buf = await curl(url, stack ? [stack] : []);
        const got = actualType(buf);
        if (!got) throw new Error(`认不出内容类型（${buf.length} B），拒收`);
        if (got.ext === '.svg' && !legacyAiSvg(buf)) return {buf, got};
        // 到这里 either 请求 .svg 却拿到位图（缩略图服务在渲染），
        // either 原件是 image-size 读不了的 AI 老 SVG —— 两种都试一次取原件/取位图
        if (path.extname(url.split('?')[0]).toLowerCase() === '.svg') {
          const alt = legacyAiSvg(buf) ? url : withoutWidth(url);
          if (alt !== url) {
            try {
              const raw = await curl(alt, stack ? [stack] : []);
              const vector = actualType(raw);
              if (vector?.ext === '.svg' && !legacyAiSvg(raw)) return {buf: raw, got: vector};
            } catch {
              /* 取不到就用手上这份，扩展名按实际字节改 */
            }
          }
          if (got.ext !== '.svg') return {buf, got};
          throw new Error('只拿到 image-size 读不了的 AI 老 SVG（原件与渲染都不可用）');
        }
        return {buf, got};
      } catch (e) {
        last = e;
        // curl 22 = --fail 拿到 4xx/5xx：名字错了，重试和换协议栈都没意义
        if (/error:\s*404/.test(e.message)) throw new Error('HTTP 404（上游文件名已失效）');
        await sleep(800 * (i + 1));
      }
    }
  }
  throw new Error(last.message || String(last));
}

/** 每存成一张就落一次盘：中途断网时已下载的图不会丢出处记录 */
const saveManifest = () =>
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');

/**
 * 一轮跑完通常还剩几张——Wikimedia 的失败几乎全是瞬时连接超时（同一张重试就好），
 * 所以这里做多轮：每轮只碰还没落地的，本轮一张都没新增就认为剩下的不是网络问题，
 * 停下来看错误信息（多半是上游改名/删除，得换文件名而不是继续重试）。
 */
const ROUNDS = 4;

if (ONLY) for (const p of plan) p.deferred = !`${p.file}${p.name}${p.url}`.includes(ONLY);

for (let round = 1; round <= ROUNDS; round++) {
  const todo = plan.filter((p) => !p.skip && !p.done && !p.deferred);
  if (!todo.length) break;
  if (round > 1) console.log(`\n—— 第 ${round} 轮：还剩 ${todo.length} 张 ——`);
  failures.length = 0;

  for (const p of todo) {
    const wantExt = p.ext;
    try {
      const {buf, got} = await grab(p.url);
      // 真实字节和 URL 后缀不一致时（`foo.svg?width=900` 给我们的是渲染位图），
      // 落盘文件名跟着字节走，否则浏览器按 .svg 解 PNG 会直接裂图。
      const file = got.ext === wantExt ? p.file : `${p.file.slice(0, -wantExt.length)}${got.ext}`;
      const abs = path.join(OUT_DIR, file);
      if (file !== p.file && fs.existsSync(p.abs)) fs.rmSync(p.abs); // 清掉自己的旧后缀版
      fs.writeFileSync(abs, buf);
      manifest[file] = {
        source: p.url,
        upstreamName: p.name,
        bytes: buf.length,
        type: got.mime,
        sha1: sha1(buf),
        fetchedAt: new Date().toISOString().slice(0, 10),
      };
      p.file = file;
      p.abs = abs;
      p.done = true;
      saveManifest();
      console.log(
        `  ok   ${file}  ${(buf.length / 1024).toFixed(0)} KB` +
          (got.ext === wantExt ? '' : '　※URL 后缀是 .svg，实为渲染位图'),
      );
    } catch (e) {
      const docs = [...new Set(refs.filter((x) => x.url === p.url).map((x) => x.doc))];
      failures.push(`${p.file}: ${e.message}`);
      console.log(`  FAIL ${p.file}: ${e.message}\n       url ${p.url}\n       引用：${docs.join('、')}`);
    }
    await sleep(400);
  }

  if (!failures.length) break;
}

/* ---------- 改写正文 ---------- */

/** 磁盘上确实有货、且登记在 manifest 里的才允许改写；失败/被 --only 跳过的保持原外链 */
const ready = new Map(
  plan
    .filter((p) => fs.existsSync(p.abs) && path.basename(p.abs) in manifest)
    .map((p) => [p.url, p.file]),
);

if (failures.length) {
  console.log(`\n${failures.length} 张下载失败，这几张的正文保持远程直链（裂链不会被替换成本地 404）。`);
}

let rewritten = 0;
const esc = (s) => s.replace(/"/g, '&quot;');
const imgTag = (file, alt) =>
  `<img src={useBaseUrl("${PUBLIC_BASE}/${file}")} alt="${esc(alt)}" loading="lazy" decoding="async" />`;

/** frontmatter 之后插入 useBaseUrl 的 import（已有就不动） */
const ensureImport = (text) => {
  if (!text.includes(USE_BASE_URL_IMPORT)) {
    const lines = text.split('\n');
    const end = lines.indexOf('---', lines[0] === '---' ? 1 : 0);
    if (end > 0) {
      lines.splice(end + 1, 0, USE_BASE_URL_IMPORT, '');
      return lines.join('\n');
    }
  }
  return text;
};

for (const doc of listMarkdown(DOCS)) {
  const before = fs.readFileSync(doc, 'utf8');
  const after = before
    // ![alt](远程) → <img src={useBaseUrl("/img/docs/…")} alt="…">
    .replace(REMOTE_MD, (whole, url) => {
      const file = ready.get(url); // 用落地时的真名，不是按 URL 猜的名（.svg → .png 会变）
      if (!file) return whole;
      rewritten += 1;
      return imgTag(file, whole.match(/^!\[([^\]]*)\]/)?.[1] ?? '');
    })
    // <img src="远程"> → 同上新写法（保留原有其它属性）
    .replace(REMOTE_HTML, (whole, attrs) => {
      const src = attr(attrs, 'src');
      const file = src && ready.get(src);
      if (!file) return whole;
      rewritten += 1;
      const rest = attrs.replace(/src="[^"]*"/, '').trim();
      return `<img src={useBaseUrl("${PUBLIC_BASE}/${file}")}${rest ? ` ${rest}` : ''} />`;
    });
  if (after !== before) fs.writeFileSync(doc, ensureImport(after));
}

saveManifest();

/**
 * 清场：本地只留 manifest 认账的文件。换图源（改 URL → 换 hash → 换文件名）之后，
 * 旧名字会同时从正文和 manifest 里消失，留在磁盘上就是无人引用的死重。
 * 只删 docs 里也没引用的，避免手滑删掉别人正在手工放的图。
 */
const kept = new Set(Object.keys(manifest));
let pruned = 0;
for (const f of fs.readdirSync(OUT_DIR)) {
  if (f === 'manifest.json' || kept.has(f) || localRefs.has(f)) continue;
  fs.rmSync(path.join(OUT_DIR, f));
  pruned += 1;
  console.log(`  prune ${f}`);
}

console.log(
  `\n本地就绪 ${ready.size} 张（远程图共 ${byUrl.size} 张）/ 改写引用 ${rewritten} 处 / ` +
    `出处清单 ${Object.keys(manifest).length} 条 → static/img/docs/manifest.json`,
);
if (failures.length || ready.size + plan.filter((p) => p.deferred).length < byUrl.size) {
  console.log('还有图没落地，正文未完全本地化：修掉上面的失败项后重跑 npm run fetch:images。');
  process.exit(1);
}
console.log('下一步：npm run build（会连 onBrokenLinks 一起验图），再 npm run check:images。');
