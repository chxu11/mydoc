/**
 * 实验室回归校验（node scripts/check-lab.mjs）。
 *
 * 三层，缺一不可：
 *   1 公式层：拿独立可验证的解析性质去撞 formulas.mjs（单位错、少一项都会挂）；
 *   2 注册层：docs 里挂载的 kind 必须都在各组的顺序表里，反之不能有孤儿；
 *   3 产物层：直接解析 build/ 里渲染出的 path，校验坐标不溢出 viewBox、
 *            曲线不退化（顶点多却恰好等于凸包 = 被细分的直线，Koch 事故的原形）。
 *
 * 第 3 层是 Koch 事故换来的教训：当时用 node 复刻了一份几何去核对周长比，
 * 四档参数全部吻合，而真实 kochEdge 少 push 了一个 apex —— 复刻校验通过、产品是坏的。
 * 所以这一层只读产物，不读源码、不复刻逻辑。
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  oscX,
  oscHalfLife,
  beatY,
  beatEnvelope,
  beatFreq,
  maxwellF,
  vMostProbable,
  vMean,
  vRms,
  R_GAS,
  planckB,
  planckPeakLambda,
  rayleighJeans,
  WIEN_B,
  SIGMA_SB,
  tunnelT,
  tunnelResonantWidths,
} from '../src/components/PhysicsLab/formulas.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILD = path.join(ROOT, 'build');

let failed = 0;
let passed = 0;

function assert(name, cond, detail = '') {
  if (cond) {
    passed++;
    console.log(`  ok   ${name}${detail ? `  (${detail})` : ''}`);
  } else {
    failed++;
    console.log(`  FAIL ${name}${detail ? `  → ${detail}` : ''}`);
  }
}

const near = (a, b, tol) => Math.abs(a - b) <= tol * Math.abs(b || 1);

/* ================= 1. 公式层 ================= */

console.log('\n[1] 物理公式 vs 独立解析性质');

/* 阻尼振动 */
{
  const w = 4;
  let maxErr = 0;
  for (let i = 0; i <= 2000; i++) {
    const t = (i / 2000) * 10;
    maxErr = Math.max(maxErr, Math.abs(oscX(t, {zeta: 0, omega: w}) - Math.cos(w * t)));
  }
  assert('ζ=0 的解恒等于 cos(ω₀t)', maxErr < 1e-9, `最大偏差 ${maxErr.toExponential(1)}`);

  for (const z of [1, 1.7, 3]) {
    let minVal = Infinity;
    for (let i = 0; i <= 4000; i++) minVal = Math.min(minVal, oscX(i / 400, {zeta: z, omega: w}));
    assert(`ζ=${z}（≥1）全程不越过零点`, minVal > -1e-12, `最小值 ${minVal.toExponential(1)}`);
  }

  let crossed = 0;
  for (const z of [0.05, 0.3]) {
    let prev = oscX(0, {zeta: z, omega: w});
    for (let i = 1; i <= 4000; i++) {
      const v = oscX(i / 400, {zeta: z, omega: w});
      if (prev * v < 0) crossed++;
      prev = v;
    }
    assert(`ζ=${z} 欠阻尼确实来回穿越零点`, crossed > 4, `穿越 ${crossed} 次`);
  }

  const hl = oscHalfLife({zeta: 0.2, omega: w});
  const env = (t) => Math.exp(-0.2 * w * t);
  assert(
    '半衰期 ln2/(ζω₀) 处包络恰为一半',
    near(env(hl), 0.5, 1e-9) && near(hl, Math.LN2 / (0.2 * w), 1e-12),
    `t½ = ${hl.toFixed(3)} s`,
  );
}

/* 拍频 */
{
  assert('f₁=f₂ 时叠加就是 2sin(2πft)', near(beatY(0.013, 44, 44), 2 * Math.sin(2 * Math.PI * 44 * 0.013), 1e-12));
  assert('t=0 合成必为零', Math.abs(beatY(0, 44, 46)) < 1e-12);
  const df = beatFreq(44, 46);
  let maxAt = 0;
  let peak = 0;
  for (let i = 0; i <= 20000; i++) {
    const t = i / 40000; // 半个拍周期内包络单调下降，取最大处即 t=0
    if (Math.abs(beatEnvelope(t, 44, 46)) > peak) {
      peak = Math.abs(beatEnvelope(t, 44, 46));
      maxAt = t;
    }
  }
  assert('拍频 = |f₁−f₂|（不是 2Δf）', near(df, 2, 1e-12), `Δf = ${df} Hz`);
  // 包络第一次回到峰值的时间应是一个拍周期 1/Δf
  let next = null;
  for (let i = 1; i <= 4000; i++) {
    const t = i / 4000;
    if (Math.abs(beatEnvelope(t, 44, 46) - 2) < 1e-6) {
      next = t;
      break;
    }
  }
  assert('包络再次满幅的时间 = 1/Δf', next !== null && near(next, 1 / df, 1e-3), `首回峰值 t = ${next} s`);
  assert('包络不会超过 2A', maxAt === 0 && peak <= 2 + 1e-9, `峰值 ${peak.toFixed(6)}`);
}

/* 麦克斯韦速率分布 */
{
  const T = 300;
  const M = 0.028; // N₂
  const vp = vMostProbable(T, M);
  let argmax = 0;
  let best = -1;
  for (let i = 1; i <= 200000; i++) {
    const v = (i / 200000) * 3000;
    const f = maxwellF(v, T, M);
    if (f > best) {
      best = f;
      argmax = v;
    }
  }
  assert('数值峰值 = √(2RT/M)', near(argmax, vp, 5e-4), `v_p = ${argmax.toFixed(1)} vs ${vp.toFixed(1)} m/s`);
  // 300 K 的氮气 ≈ 422 m/s（教材值），撞单位
  assert('N₂ 在 300 K 的最概然速率 ≈ 422 m/s', Math.abs(vp - 422) < 3, `算得 ${vp.toFixed(1)} m/s`);
  assert(
    '三个速率之比 = √2 : √(8/π) : √3',
    near(vMean(T, M) / vp, Math.sqrt(4 / Math.PI), 1e-9) &&
      near(vRms(T, M) / vp, Math.sqrt(1.5), 1e-9),
    `${(vMean(T, M) / vp).toFixed(4)} / ${(vRms(T, M) / vp).toFixed(4)}`,
  );
  // 归一化：∫₀^∞ f dv = 1（梯形积分到 20 v_p 已足够）
  const N = 200000;
  const hi = 20 * vp;
  let sum = 0;
  for (let i = 0; i <= N; i++) {
    const v = (i / N) * hi;
    const w = i === 0 || i === N ? 0.5 : 1;
    sum += w * maxwellF(v, T, M);
  }
  assert('分布归一化 ∫f dv = 1', near((sum / N) * hi, 1, 5e-4), `积得 ${((sum / N) * hi).toFixed(5)}`);
  assert('T 升 4 倍 → v_p 升 2 倍', near(vMostProbable(4 * T, M) / vp, 2, 1e-12));
  assert('M 升 4 倍 → v_p 减半', near(vMostProbable(T, 4 * M) / vp, 0.5, 1e-12));
  assert('R 与 √(RT/M) 量纲一致（J·mol⁻¹ → m²·s⁻²）', near(R_GAS * T / M / (vp * vp / 2), 1, 1e-12));
}

/* 黑体辐射 */
{
  for (const T of [2500, 3500, 5000, 6500]) {
    const lam = planckPeakLambda(T);
    assert(
      `维恩位移 λmax·T = b（T=${T} K）`,
      near(lam * T, WIEN_B, 5e-3),
      `λmax = ${(lam * 1e9).toFixed(0)} nm, b 算得 ${(lam * T).toExponential(5)}`,
    );
  }
  // 总功率 = ∫B dλ（半空间 π 积分略去，只比 T⁴ 标度）
  const integral = (T) => {
    const N = 4000;
    const lo = 1e-9;
    const hi = 5e-1;
    let s = 0;
    for (let i = 0; i <= N; i++) {
      // 对数网格上积分要用 dλ 的实际间距
      const l1 = lo * (hi / lo) ** (i / N);
      const l2 = lo * (hi / lo) ** ((i + 1) / N);
      const w = i === 0 || i === N ? 0.5 : 1;
      s += w * planckB((l1 + l2) / 2, T) * (l2 - l1);
    }
    return s;
  };
  const i3000 = integral(3000);
  const i6000 = integral(6000);
  assert('谱积分按 T⁴ 标度（Stefan–Boltzmann）', near(i6000 / i3000, 16, 2e-2), `比值 ${(i6000 / i3000).toFixed(3)}，期望 16`);
  // B 是单位立体角的谱辐亮度，半球积分差一个 π：∫B dλ = σT⁴/π
  assert('∫B dλ 恰为 σT⁴/π', near(i3000, (SIGMA_SB * 3000 ** 4) / Math.PI, 1e-2), `∫B dλ = ${i3000.toExponential(4)}，σT⁴/π = ${((SIGMA_SB * 3000 ** 4) / Math.PI).toExponential(4)}`);
  // 长波极限回落到 Rayleigh–Jeans：B = B_RJ · x/(eˣ−1)，x = hc/λkT ≪ 1 时比值落在 (1−x, 1) 之间
  const lamRJ = 2e-4; // 200 µm
  const x = (6.62607015e-34 * 2.99792458e8) / (lamRJ * 1.380649e-23 * 5000);
  const ratio = planckB(lamRJ, 5000) / rayleighJeans(lamRJ, 5000);
  assert(
    '长波极限 = Rayleigh–Jeans（一阶偏差 x/(eˣ−1) ∈ (1−x, 1)）',
    ratio < 1 && ratio > 1 - x,
    `x = ${x.toFixed(4)}，B/B_RJ = ${ratio.toFixed(5)}`,
  );
  // 紫外灾难不该回来：λ→0 时 B→0
  assert('短波端不发散（没有紫外灾难）', planckB(1e-9, 5000) < planckB(1e-7, 5000), `B(1nm) = ${planckB(1e-9, 5000).toExponential(2)}`);
}

/* 隧穿 */
{
  assert('V₀ = 0 必须全透', near(tunnelT({E: 1, V0: 0, a: 1}), 1, 1e-12));
  assert('a → 0 必须全透', near(tunnelT({E: 1, V0: 5, a: 1e-6}), 1, 1e-6), `T = ${tunnelT({E: 1, V0: 5, a: 1e-6}).toFixed(8)}`);
  {
    const E = 8;
    const V0 = 5;
    for (const [i, a] of tunnelResonantWidths({E, V0}, 3).entries()) {
      const t = tunnelT({E, V0, a});
      assert(`共振 k′a = ${i + 1}π 时 T = 1（a = ${a.toFixed(3)} nm）`, t > 1 - 1e-9, `T = ${t.toFixed(12)}`);
    }
  }
  // 厚垒极限的 WKB 估计（含前因子）：T ≈ 16E(V₀−E)/V₀² · e^(−2κa)，完全独立于闭式
  {
    const E = 0.01;
    const V0 = 5;
    const a = 1;
    const kappa = Math.sqrt((V0 - E) / 0.0380998212);
    const wkb = ((16 * E * (V0 - E)) / (V0 * V0)) * Math.exp(-2 * kappa * a);
    const t = tunnelT({E, V0, a});
    assert(
      '厚垒极限与 WKB 估计 16E(V₀−E)/V₀²·e^(−2κa) 吻合',
      near(t, wkb, 0.03),
      `闭式 ${t.toExponential(4)}，WKB ${wkb.toExponential(4)}`,
    );
    assert('E → 0 时透射趋于 0', t < 1e-9, `T = ${t.toExponential(2)}`);
  }
  let mono = true;
  let prev = 2;
  for (let a = 0.2; a <= 2.001; a += 0.2) {
    const t = tunnelT({E: 1, V0: 5, a});
    if (t > prev + 1e-15) mono = false;
    prev = t;
  }
  assert('垒宽 a 越厚越透不过（单调减）', mono);
  mono = true;
  prev = 0;
  for (let E = 0.2; E <= 4.999; E += 0.2) {
    const t = tunnelT({E, V0: 5, a: 0.5});
    if (t < prev - 1e-15) mono = false;
    prev = t;
  }
  assert('E < V₀ 区间内能量越高越易透（单调增）', mono);
  // E = V₀ 的连续极限
  const atTop = tunnelT({E: 5, V0: 5, a: 0.5});
  const expect = 1 / (1 + (5 * 0.25) / (4 * 0.0380998212));
  assert('E = V₀ 处与解析极限 [1+V₀a²/4G]⁻¹ 吻合', near(atTop, expect, 1e-9), `T = ${atTop.toFixed(5)}`);
  const justBelow = tunnelT({E: 5 - 1e-7, V0: 5, a: 0.5});
  const justAbove = tunnelT({E: 5 + 1e-7, V0: 5, a: 0.5});
  assert('E 跨过 V₀ 时 T 连续', Math.abs(justAbove - justBelow) < 1e-4, `Δ = ${Math.abs(justAbove - justBelow).toExponential(2)}`);
}

/* ================= 2. 注册层 ================= */

console.log('\n[2] 注册表 vs 正文挂载');

const REGISTRIES = [
  {
    name: 'PatternLab',
    gen: 'src/components/PatternLab/generators.js',
    registryVar: 'PATTERNS',
    orderVar: 'PATTERN_ORDER',
  },
  {
    name: 'MathLab',
    gen: 'src/components/MathLab/generators.js',
    registryVar: 'MATH_PATTERNS',
    orderVar: 'MATH_ORDER',
  },
  {
    name: 'PhysicsLab',
    gen: 'src/components/PhysicsLab/generators.js',
    registryVar: 'PHYSICS_PATTERNS',
    orderVar: 'PHYSICS_ORDER',
  },
];

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

/**
 * 从注册表源码里抓顶层 key 与 ORDER 数组。
 * 必须先把范围锁到 `export const PATTERNS = {…};` 这一块 —— 否则同文件里的
 * 其它查表对象（MathLab 的 WAVEFORMS：square/saw/triangle）会被误当成 kind，
 * 报出一堆不存在的孤儿。
 */
function registryOf(rel, registryVar, orderVar) {
  const src = read(rel);
  const start = src.indexOf(`export const ${registryVar} = {`);
  const end = start < 0 ? -1 : src.indexOf('\n};', start);
  const block = end < 0 ? '' : src.slice(start, end);
  const keys = [...block.matchAll(/^ {2}([a-z][a-zA-Z]*)\s*:\s*\{/gm)].map((m) => m[1]);
  const orderBlock = src.match(new RegExp(`export const ${orderVar} = \\[([\\s\\S]*?)\\];`));
  const order = orderBlock
    ? [...orderBlock[1].matchAll(/'([a-zA-Z]+)'/g)].map((m) => m[1])
    : [];
  return {keys, order};
}

const mounted = new Map(); // kind -> [文件]
const mountRoot = path.join(ROOT, 'docs');
(function walk(dir) {
  for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.md')) {
      const src = fs.readFileSync(p, 'utf8');
      for (const m of src.matchAll(/(?:PatternLab|MathLab|PhysicsLab)\s+kind="([a-zA-Z]+)"/g)) {
        const list = mounted.get(m[1]) ?? [];
        list.push(path.relative(ROOT, p));
        mounted.set(m[1], list);
      }
    }
  }
})(mountRoot);

const allKeys = new Set();
const liveRegistries = REGISTRIES.filter((r) => exists(r.gen));
for (const {name, gen, registryVar, orderVar} of liveRegistries) {
  const {keys, order} = registryOf(gen, registryVar, orderVar);
  keys.forEach((k) => allKeys.add(k));
  assert(`${name}：ORDER 覆盖全部注册项`, order.length >= keys.length && keys.every((k) => order.includes(k)), `注册 ${keys.length}、登记 ${order.length}`);
  assert(`${name}：ORDER 里没有空引用`, order.every((k) => keys.includes(k)), order.filter((k) => !keys.includes(k)).join(',') || '');
  const orphans = keys.filter((k) => !(mounted.get(k) ?? []).length);
  assert(`${name}：没有「注册了但正文没挂」的孤儿`, orphans.length === 0, orphans.join(','));
  assert(`${name}：至少有一件图形`, keys.length > 0, `${keys.length} 件`);
}
for (const {name, gen} of REGISTRIES.filter((r) => !exists(r.gen))) {
  console.log(`  --   ${name} 尚不存在，跳过`);
}
const unknown = [...mounted.keys()].filter((k) => !allKeys.has(k));
assert('正文没有引用未注册的 kind', unknown.length === 0, unknown.join(','));
{
  const per = liveRegistries.map((r) => ({name: r.name, keys: registryOf(r.gen, r.registryVar, r.orderVar).keys}));
  const dup = [...allKeys].filter(
    (k) => per.filter((p) => p.keys.includes(k)).length > 1,
  );
  assert('kind 在全部注册表里唯一（深链 /lab#kind 依赖它）', dup.length === 0, dup.join(','));
}

/* ================= 3. 产物层 ================= */

console.log('\n[3] 构建产物：坐标不溢出 viewBox、曲线不退化');

const W = 480;
const H = 320;

function collectPoints(d) {
  const pts = [];
  for (const m of d.matchAll(/([MLQTCA])((?:[^MLQTCA])*)/g)) {
    const nums = (m[2].match(/-?\d*\.?\d+(?:e-?\d+)?/gi) ?? []).map(Number);
    if (m[1] === 'A') {
      for (let i = 0; i + 1 < nums.length; i += 7) pts.push([nums[i + 5], nums[i + 6]]);
      continue;
    }
    for (let i = 0; i + 1 < nums.length; i += 2) pts.push([nums[i], nums[i + 1]]);
  }
  return pts;
}

function hullPerimeter(pts) {
  const p = [...new Set(pts.map(([x, y]) => `${x},${y}`))].map((s) => s.split(',').map(Number));
  if (p.length < 3) return 0;
  p.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const build = (arr) => {
    const out = [];
    for (const q of arr) {
      while (out.length >= 2 && cross(out[out.length - 2], out[out.length - 1], q) <= 0) out.pop();
      out.push(q);
    }
    out.pop();
    return out;
  };
  const h = [...build(p), ...build(p.slice().reverse())];
  let per = 0;
  for (let i = 1; i < h.length; i++) per += Math.hypot(h[i][0] - h[i - 1][0], h[i][1] - h[i - 1][1]);
  return per;
}

/** 按元素类型正确取包围盒顶点：不能把属性值当成一对 (v,v) */
function attrPoints(tag) {
  const num = (name) => {
    const m = tag.match(new RegExp(`\\b${name}="(-?[\\d.]+)"`));
    return m ? Number(m[1]) : null;
  };
  const at = (name, dflt = 0) => num(name) ?? dflt;
  if (/<rect/.test(tag)) {
    const x = at('x');
    const y = at('y');
    return [
      [x, y],
      [x + at('width'), y + at('height')],
    ];
  }
  if (/<circle/.test(tag)) {
    const cx = at('cx');
    const cy = at('cy');
    const r = at('r');
    return [
      [cx - r, cy - r],
      [cx + r, cy + r],
    ];
  }
  if (/<line/.test(tag)) return [[at('x1'), at('y1')], [at('x2'), at('y2')]];
  if (/<text/.test(tag)) return [[at('x'), at('y')]];
  return [];
}

const pathLen = (pts) => {
  let s = 0;
  for (let i = 1; i < pts.length; i++) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return s;
};

if (!fs.existsSync(BUILD)) {
  console.log('  --   没有 build/ 目录，先跑 npm run build 再校验产物层');
} else {
  const pages = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name === 'index.html') pages.push(p);
    }
  })(BUILD);

  const seen = new Map(); // label -> {pts, paths, canvas, ratio, longest}
  for (const f of pages) {
    const html = fs.readFileSync(f, 'utf8');
    for (const m of html.matchAll(/<(svg|canvas)[^>]*aria-label="([^"]+?)，由当前参数生成"[^>]*>/g)) {
      const label = m[2];
      const chunk = m[1] === 'canvas' ? '' : html.slice(m.index, m.index + 400000).split('</svg>')[0];
      const rec = seen.get(label) ?? {pts: [], paths: 0, canvas: false, ratio: 0, longest: null};
      if (m[1] === 'canvas') {
        rec.canvas = true;
        seen.set(label, rec);
        continue;
      }
      for (const p of chunk.matchAll(/<path[^>]*\bd="([^"]+)"/g)) {
        const pts = collectPoints(p[1]);
        rec.pts.push(...pts);
        rec.paths++;
        if (pts.length > 200) {
          // 曲线越长越该比凸包绕；若相等就是「被细分的直线」——Koch 事故的原形
          rec.ratio = Math.max(rec.ratio, pathLen(pts) / (hullPerimeter(pts) || 1));
        }
        if (!rec.longest || pts.length > rec.longest.count) {
          const xs = pts.map(([x]) => x);
          const ys = pts.map(([, y]) => y);
          rec.longest = {
            count: pts.length,
            w: pts.length ? Math.max(...xs) - Math.min(...xs) : 0,
            h: pts.length ? Math.max(...ys) - Math.min(...ys) : 0,
          };
        }
      }
      for (const a of chunk.matchAll(/<(rect|circle|line|text)[^>]*>/g)) rec.pts.push(...attrPoints(a[0]));
      seen.set(label, rec);
    }
  }

  assert('产物里找到至少 19 件生成器画布（纹样 7 + 数学 7 + 物理 5）', seen.size >= 19, `${seen.size} 件`);

  /*
   * 这里**不能**要求「所有坐标都落在 viewBox 内」：满地密铺的母题（麻叶、市松、
   * 青海波、交织绳带）本来就是把图形画到画布外、再靠 clipPath 裁齐，SVG 根元素
   * 默认也会裁掉界外内容。真正会出错的是另一件事——图形缩成一小块、或者整体
   * 画到了界外看不见。所以断言改成：界内可见点足够多，且它们的包围盒铺满画布。
   */
  let cramped = 0;
  for (const [label, rec] of seen) {
    if (rec.canvas) continue;
    const inside = rec.pts.filter(([x, y]) => x >= -1.5 && x <= W + 1.5 && y >= -1.5 && y <= H + 1.5);
    if (inside.length < 20) {
      cramped++;
      console.log(`       ${label}: 界内只有 ${inside.length} 个点（共 ${rec.pts.length}）`);
      continue;
    }
    const bw = Math.max(...inside.map((p) => p[0])) - Math.min(...inside.map((p) => p[0]));
    const bh = Math.max(...inside.map((p) => p[1])) - Math.min(...inside.map((p) => p[1]));
    if (bw < 0.3 * W || bh < 0.3 * H) {
      cramped++;
      console.log(`       ${label}: 可见范围只有 ${bw.toFixed(0)}×${bh.toFixed(0)}（画布 ${W}×${H}）`);
    }
  }
  assert('每件矢量图形都铺满画布（界内点 ≥ 20 且包围盒 ≥ 30% 宽高）', cramped === 0, `${cramped} 件缩成一小块`);

  /*
   * 上一段只看「所有点的并集」，会被坐标框蒙住：PhysicsLab 第一版把 0–1 的归一化
   * 纵坐标当成像素送进 path（少套一层 py），曲线糊成距顶边 0.4px 的一条横线，
   * 而轴线、刻度、文字照样把画布撑得满满的 —— 校验全绿，图是坏的。
   * 所以再看一眼**采样点最多的那条曲线自己**铺开了多少：曲线退化时这里先红。
   */
  const flat = [];
  for (const [label, rec] of seen) {
    const long = rec.longest;
    if (rec.canvas || !long || long.count < 150) continue;
    if (long.w < 0.3 * W || long.h < 0.12 * H) {
      flat.push(`${label}: ${long.count} 个采样点只铺开 ${long.w.toFixed(0)}×${long.h.toFixed(0)}`);
    }
  }
  assert('最长的采样曲线自身也铺开（≥30% 宽 / ≥12% 高）', flat.length === 0, flat.join('　|　'));

  for (const label of ['Koch 雪花']) {
    const rec = seen.get(label);
    assert(`${label}：长曲线相对凸包不退化（>1.05）`, rec && rec.ratio > 1.05, `比值 ${rec ? rec.ratio.toFixed(3) : 'n/a'}`);
  }
}

/* ================= 汇总 ================= */

console.log(`\n合计 ${passed} 项通过，${failed} 项失败。`);
process.exit(failed ? 1 : 0);
