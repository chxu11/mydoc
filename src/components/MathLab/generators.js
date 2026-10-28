import React from 'react';

import {H, W, n, polylinePath, strokeProps} from '../ParamLab/geometry';

/**
 * 数学参数化几何：分形 / 螺线 / 傅里叶 / 贝塞尔 / Julia 集。
 *
 * 与纹样母题同一条契约（见 ../ParamLab/index.js），只是这里每个生成器都带一句
 * 「参数背后的数学」：info(values) 会随拖动实时算出维数、周长、系数——
 * 让滑杆变成一条可以摸到的定理。
 */

const lerp = (a, b, t) => ({x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t});

/* ---------------- 1. Koch 雪花：一段变四段 ---------------- */

/** 把中间三分之一顶起：apex 取远离中心那一侧，保证永远向外凸 */
function bump(p0, p1, spike, center) {
  const a = lerp(p0, p1, 1 / 3);
  const b = lerp(p0, p1, 2 / 3);
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const h = len * spike;
  const c1 = {x: mx - (dy / len) * h, y: my + (dx / len) * h};
  const c2 = {x: mx + (dy / len) * h, y: my - (dx / len) * h};
  return {a, b, apex: Math.hypot(c1.x - center.x, c1.y - center.y) > Math.hypot(c2.x - center.x, c2.y - center.y) ? c1 : c2};
}

/**
 * 一次迭代把一条边换成四段：p0→a、a→apex、apex→b、b→p1。
 * 少 push 任何一个 apex 都会退化成「被细分的直线」——周长不涨、维数掉回 1，
 * 而图形看上去仍是个干净的三角形，所以这条必须靠产物校验，不能靠肉眼看。
 */
function kochEdge(p0, p1, depth, spike, center, out) {
  if (depth === 0) {
    out.push(p1);
    return;
  }
  const {a, b, apex} = bump(p0, p1, spike, center);
  kochEdge(p0, a, depth - 1, spike, center, out);
  kochEdge(a, apex, depth - 1, spike, center, out);
  kochEdge(apex, b, depth - 1, spike, center, out);
  kochEdge(b, p1, depth - 1, spike, center, out);
}

function renderKoch({depth, sides, spike, stroke}) {
  const d = kochDepth(depth, sides);
  // 底多边形先铺满画布，迭代长度随深度变化时才不会被「重新缩放」掩盖
  const base = Array.from({length: sides}, (_, k) => {
    const a = (-90 + (k * 360) / sides) * (Math.PI / 180);
    return {x: W / 2 + (Math.min(W, H) / 2 - 46) * Math.cos(a), y: H / 2 + (Math.min(W, H) / 2 - 46) * Math.sin(a)};
  });
  const center = {x: W / 2, y: H / 2};
  const pts = [base[0]];
  for (let i = 0; i < sides; i++) {
    kochEdge(base[i], base[(i + 1) % sides], d, spike, center, pts);
  }
  return <path d={`${polylinePath(pts)} Z`} {...strokeProps(stroke)} />;
}

/** 段数 = sides × 4^depth：底边数多时先压低深度，否则滑杆会卡 */
function kochDepth(depth, sides) {
  return Math.min(depth, sides > 4 ? 4 : 5);
}

/** 一次迭代把一条边换成 4 条子边：两条长 1/3，两条长 slant（由尖峰高度决定） */
function kochRatios(spike) {
  return {slant: Math.sqrt(0.25 + spike * spike) / 3};
}

/** 相似维数 D 满足 2·(1/3)^D + 2·slant^D = 1；尖峰 = √3/2 时四段全等，D = log4/log3 */
function kochDimension(spike) {
  const {slant} = kochRatios(spike);
  let lo = 1;
  let hi = 3;
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    if (2 * 3 ** -mid + 2 * slant ** mid > 1) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

const KOCH_CLASSIC = 0.866; // √3 / 2：中间那段上顶出一个等边三角

/* ---------------- 2. Sierpinski：三角 / 地毯 ---------------- */

function sierpinskiTriangle(p0, p1, p2, depth, out) {
  if (depth === 0) {
    out.push(`M ${n(p0.x)} ${n(p0.y)} L ${n(p1.x)} ${n(p1.y)} L ${n(p2.x)} ${n(p2.y)} Z`);
    return;
  }
  const a = lerp(p0, p1, 0.5);
  const b = lerp(p1, p2, 0.5);
  const c = lerp(p2, p0, 0.5);
  sierpinskiTriangle(p0, a, c, depth - 1, out);
  sierpinskiTriangle(a, p1, b, depth - 1, out);
  sierpinskiTriangle(c, b, p2, depth - 1, out);
}

function sierpinskiCarpet(x, y, size, depth, out) {
  if (depth === 0) {
    out.push(`M ${n(x)} ${n(y)} h ${n(size)} v ${n(size)} h ${n(-size)} Z`);
    return;
  }
  const s = size / 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (r === 1 && c === 1) continue;
      sierpinskiCarpet(x + c * s, y + r * s, s, depth - 1, out);
    }
  }
}

function renderSierpinski({shape, depth, stroke}) {
  const margin = 34;
  const size = Math.min(W, H) - margin * 2;
  const ox = (W - size) / 2;
  const oy = (H - size) / 2;
  if (shape === 'carpet') {
    const d = Math.min(depth, 4); // 8^5 = 32768 个方框，滑杆拖不动了
    const out = [];
    sierpinskiCarpet(ox, oy, size, d, out);
    return <path d={out.join(' ')} {...strokeProps(stroke)} />;
  }
  const d = Math.min(depth, 6);
  const p0 = {x: W / 2, y: oy};
  const p1 = {x: ox + size, y: oy + size};
  const p2 = {x: ox, y: oy + size};
  const out = [];
  sierpinskiTriangle(p0, p1, p2, d, out);
  return <path d={out.join(' ')} {...strokeProps(stroke)} />;
}

/* ---------------- 3. 分形树：一条规则长出一株 ---------------- */

function renderTree({depth, angle, shrink, skew, stroke}) {
  const d = Math.min(depth, 9);
  const trunk = H * 0.26;
  const segs = [];
  const grow = (x, y, len, rot, level) => {
    const rad = (rot * Math.PI) / 180;
    const tx = x + len * Math.sin(rad);
    const ty = y - len * Math.cos(rad);
    segs.push(`M ${n(x)} ${n(y)} L ${n(tx)} ${n(ty)}`);
    if (level === 0) return;
    grow(tx, ty, len * shrink, rot - (angle - skew), level - 1);
    grow(tx, ty, len * shrink, rot + (angle + skew), level - 1);
  };
  grow(W / 2, H - 22, trunk, 0, d);
  return <path d={segs.join(' ')} {...strokeProps(stroke, {opacity: 0.9})} />;
}

/* ---------------- 4. 螺线：对数螺 / 阿基米德螺 ---------------- */

function renderSpiral({type, growth, turns, marks, stroke}) {
  const cx = W / 2;
  const cy = H / 2;
  const maxR = Math.min(W, H) / 2 - 26;
  const total = turns * 2 * Math.PI;
  const samples = Math.max(240, Math.round(turns * 220));
  const rAt = (theta) => {
    if (type === 'archimedean') {
      return (maxR / total) * theta;
    }
    // 对数螺：每转 90° 半径 ×growth
    const perQuarter = Math.log(growth) / (Math.PI / 2);
    return maxR * Math.exp(-perQuarter * (total - theta));
  };
  const pts = [];
  for (let i = 0; i <= samples; i++) {
    const theta = (total * i) / samples;
    const r = rAt(theta);
    pts.push({x: cx + r * Math.cos(theta), y: cy + r * Math.sin(theta)});
  }
  const guides = [];
  if (marks) {
    for (let q = 1; q <= Math.round(turns * 4); q++) {
      const theta = (q * Math.PI) / 2;
      if (theta > total) break;
      const r = rAt(theta);
      guides.push(`M ${n(cx)} ${n(cy)} L ${n(cx + r * Math.cos(theta))} ${n(cy + r * Math.sin(theta))}`);
    }
  }
  return (
    <>
      {guides.length ? <path d={guides.join(' ')} {...strokeProps(stroke * 0.6, {opacity: 0.3})} /> : null}
      <path d={polylinePath(pts)} {...strokeProps(stroke)} />
    </>
  );
}

/* ---------------- 5. 傅里叶：把方波拆成正弦 ---------------- */

const SERIES = {
  square: {
    label: '方波',
    // 只保留奇次谐波，幅度 1/k
    term: (k, x) => (k % 2 === 1 ? Math.sin(k * x) / k : 0),
    weight: 4 / Math.PI,
  },
  saw: {
    label: '锯齿波',
    term: (k, x) => ((k % 2 === 0 ? -1 : 1) * Math.sin(k * x)) / k,
    weight: 2 / Math.PI,
  },
  triangle: {
    label: '三角波',
    term: (k, x) => (k % 2 === 1 ? (((k - 1) / 2) % 2 === 0 ? 1 : -1) * Math.sin(k * x) / (k * k) : 0),
    weight: 8 / Math.PI ** 2,
  },
};

function seriesValue(target, terms, x) {
  const s = SERIES[target] ?? SERIES.square;
  let v = 0;
  for (let k = 1; k <= terms; k++) {
    v += s.term(k, x);
  }
  return v * s.weight;
}

function wavePath(target, terms, x0, x1, amp, cy, samples) {
  const pts = [];
  for (let i = 0; i <= samples; i++) {
    const x = x0 + ((x1 - x0) * i) / samples;
    pts.push({x, y: cy - seriesValue(target, terms, x) * amp});
  }
  return polylinePath(pts);
}

function renderFourier({target, terms, harmonics, stroke}) {
  const cy = H / 2;
  const amp = H * 0.34;
  const x0 = 26;
  const x1 = W - 26;
  const span = 4 * Math.PI; // 两个周期
  const toX = (phase) => x0 + ((x1 - x0) * phase) / span;
  const s = SERIES[target] ?? SERIES.square;

  const layers = [];
  if (harmonics) {
    for (let k = 1; k <= terms; k++) {
      const pts = [];
      for (let i = 0; i <= 120; i++) {
        const phase = (span * i) / 120;
        const v = s.term(k, phase) * s.weight;
        if (!v) continue;
        pts.push({x: toX(phase), y: cy - v * amp});
      }
      if (pts.length < 2) continue;
      layers.push(
        <path
          key={`h-${k}`}
          d={polylinePath(pts)}
          {...strokeProps(Math.max(0.8, stroke * 0.5), {opacity: 0.28})}
        />,
      );
    }
  }
  return (
    <>
      <path d={`M ${x0} ${cy} L ${x1} ${cy}`} {...strokeProps(1, {opacity: 0.25})} />
      {/* 「理想波形」用 120 项逼近，当作参照系 */}
      <path
        d={wavePath(target, 120, x0, x1, amp, cy, 320)}
        {...strokeProps(stroke * 0.7, {opacity: 0.22, strokeDasharray: '6 5'})}
      />
      {layers}
      <path d={wavePath(target, terms, x0, x1, amp, cy, 420)} {...strokeProps(stroke)} />
    </>
  );
}

/* ---------------- 6. 贝塞尔：矢量图形只有一个「控制多边形」 ---------------- */

const BEZIER_DEFAULT = [
  {x: 52, y: 262},
  {x: 132, y: 44},
  {x: 330, y: 76},
  {x: 432, y: 250},
];

function bezierPath(points) {
  const [p0, p1, p2, p3] = points;
  if (points.length === 3) {
    return `M ${n(p0.x)} ${n(p0.y)} Q ${n(p1.x)} ${n(p1.y)} ${n(p2.x)} ${n(p2.y)}`;
  }
  return `M ${n(p0.x)} ${n(p0.y)} C ${n(p1.x)} ${n(p1.y)}, ${n(p2.x)} ${n(p2.y)}, ${n(p3.x)} ${n(p3.y)}`;
}

/** de Casteljau：逐段线性插值，直到剩下一个点——它就是曲线上的点 */
function casteljau(points, t) {
  const rows = [points];
  while (rows[rows.length - 1].length > 1) {
    const prev = rows[rows.length - 1];
    rows.push(prev.slice(1).map((p, i) => lerp(prev[i], p, t)));
  }
  return rows;
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function renderBezier({degree, t, construction, points}) {
  const pts = points.slice(0, degree === 'quad' ? 3 : 4);
  const rows = casteljau(pts, t);
  const final = rows[rows.length - 1][0];
  const guides = [];
  if (construction) {
    // 中间每一行都是一条“插值折线”，逐行收缩到最后一个点
    for (let r = 1; r < rows.length - 1; r++) {
      guides.push(polylinePath(rows[r]));
    }
  }
  return (
    <>
      <path d={bezierPath(pts)} {...strokeProps(3)} />
      {/* 控制多边形、作图线、拖把手都标了 data-no-export：导出的是干净的曲线本身 */}
      <g data-no-export="true">
        <path
          d={polylinePath(pts)}
          {...strokeProps(1.2, {opacity: 0.35, strokeDasharray: '5 4'})}
        />
        {guides.length ? <path d={guides.join(' ')} {...strokeProps(1.2, {opacity: 0.5})} /> : null}
        {pts.map((p, i) => (
          <g key={`h-${i}`}>
            {/* 外面这个透明圆把命中区撑到 28 单位，手机上也抓得住 */}
            <circle cx={n(p.x)} cy={n(p.y)} r={14} fill="transparent" stroke="none" />
            <circle
              cx={n(p.x)}
              cy={n(p.y)}
              r={7}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              opacity={0.8}
            />
          </g>
        ))}
        <circle cx={n(final.x)} cy={n(final.y)} r={4.5} style={{fill: 'currentColor'}} />
      </g>
    </>
  );
}

/* ---------------- 7. Julia 集：一个复数就是一整个世界 ---------------- */

/** c 是否落在 Mandelbrot 集内（从 0 迭代，不逃逸即在集合内） */
function inMandelbrot(cr, ci, limit = 220) {
  let zr = 0;
  let zi = 0;
  for (let i = 0; i < limit; i++) {
    const nr = zr * zr - zi * zi + cr;
    const ni = 2 * zr * zi + ci;
    zr = nr;
    zi = ni;
    if (zr * zr + zi * zi > 16) return false;
  }
  return true;
}

// 5 段余弦式色标：从深海到暖沙，纯装饰，不参与任何数学判断
const RAMP = [
  [8, 14, 32],
  [26, 88, 122],
  [116, 182, 190],
  [232, 214, 176],
  [206, 128, 62],
];

function rampColor(t) {
  const p = Math.min(0.999, Math.max(0, t)) * (RAMP.length - 1);
  const i = Math.floor(p);
  const f = p - i;
  const a = RAMP[i];
  const b = RAMP[i + 1] ?? RAMP[i];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}

function paintJulia(ctx, {re, im, iter, scale}, view) {
  const {w, h} = view;
  const img = ctx.createImageData(w, h);
  const data = img.data;
  // 复平面视野：横向 [-2,2]，按画布比例给纵向
  const halfX = 2 / scale;
  const halfY = halfX * (h / w);
  for (let py = 0; py < h; py++) {
    const ci0 = -halfY + (2 * halfY * py) / h;
    for (let px = 0; px < w; px++) {
      const cr0 = -halfX + (2 * halfX * px) / w;
      let zr = cr0;
      let zi = ci0;
      let i = 0;
      let d2 = 0;
      while (i < iter) {
        d2 = zr * zr + zi * zi;
        if (d2 > 16) break;
        const nr = zr * zr - zi * zi + cr0;
        zi = 2 * zr * zi + ci0;
        zr = nr;
        i++;
      }
      const k = (py * w + px) * 4;
      if (i >= iter) {
        data[k] = 14;
        data[k + 1] = 16;
        data[k + 2] = 20;
      } else {
        // 平滑逃逸时间：mu = i + 1 - log₂(log|z|)
        const mu = i + 1 - Math.log(Math.log(Math.max(1.0000001, Math.sqrt(d2)))) / Math.LN2;
        const t = Math.pow(Math.max(0, mu) / iter, 0.42);
        const [r, g, b] = rampColor(t);
        data[k] = r;
        data[k + 1] = g;
        data[k + 2] = b;
      }
      data[k + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  // 标出当前 c 在这张图上的位置（同一个复平面），拖动时能对上号
  const mx = ((re + halfX) / (2 * halfX)) * w;
  const my = ((im + halfY) / (2 * halfY)) * h;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(mx, my, 8, 0, Math.PI * 2);
  ctx.stroke();
}

/* ---------------- 注册表 ---------------- */

export const MATH_PATTERNS = {
  koch: {
    label: 'Koch 雪花',
    source: '1904 · von Koch',
    hint: '把每段线的中间三分之一顶起来。规则一句话，迭代五次就是一朵周长无穷、面积有限的雪花——前提是顶得够高。',
    params: [
      {key: 'depth', label: '迭代次数', value: 4, min: 1, max: 5, step: 1},
      {key: 'sides', label: '底边数', value: 3, min: 3, max: 8, step: 1},
      {key: 'spike', label: '尖峰高度（0.866 = 等边）', value: KOCH_CLASSIC, min: 0.05, max: 1.4, step: 0.001},
      {key: 'stroke', label: '线宽', value: 1.5, min: 0.5, max: 3, step: 0.25},
    ],
    info: (v) => {
      const d = kochDepth(v.depth, v.sides);
      const segs = v.sides * 4 ** d;
      const {slant} = kochRatios(v.spike);
      const f = 2 / 3 + 2 * slant; // 每迭代一次，周长乘上这个因子
      const growth = f ** d;
      const classic = Math.abs(v.spike - KOCH_CLASSIC) < 0.0005;
      return `第 ${d} 步：${segs} 段折线，总周长 = 初始 × ${f.toFixed(
        3,
      )}^${d} = ${growth < 10000 ? growth.toFixed(2) : growth.toExponential(1)} 倍；四条子边的比是 1/3、${slant.toFixed(
        3,
      )}、${slant.toFixed(3)}、1/3，解 2·(1/3)^D + 2·${slant.toFixed(3)}^D = 1 得维数 D ≈ ${kochDimension(
        v.spike,
      ).toFixed(3)}${
        classic
          ? '（四段全等，正是教科书的 log4/log3 ≈ 1.2619）'
          : v.spike < KOCH_CLASSIC
            ? '（尖峰太平，周长几乎不涨，维数正向 1 掉回去）—— 推到 0.866 才是那朵雪花'
            : '（尖峰过等边，曲线开始自交，靠重叠填平平面，维数向 2 靠）'
      }`;
    },
    render: renderKoch,
  },
  sierpinski: {
    label: 'Sierpinski 分形',
    source: '1915 / 1916 · Sierpiński',
    hint: '三角形：留下三个角，挖掉中间；地毯：九宫格挖掉正中一块。同一个动作反复做，维数就落在 1 和 2 之间。',
    params: [
      {
        key: 'shape',
        label: '形状',
        value: 'triangle',
        options: [
          {value: 'triangle', label: '三角'},
          {value: 'carpet', label: '地毯'},
        ],
      },
      {key: 'depth', label: '层数', value: 5, min: 1, max: 6, step: 1},
      {key: 'stroke', label: '线宽', value: 1.2, min: 0.5, max: 2.5, step: 0.25},
    ],
    info: (v) => {
      const isCarpet = v.shape === 'carpet';
      const d = Math.min(v.depth, isCarpet ? 4 : 6);
      const pieces = isCarpet ? 8 : 3;
      const ratio = isCarpet ? 3 : 2;
      const dim = Math.log(pieces) / Math.log(ratio);
      return `${isCarpet ? '地毯：每块分成 9 份挖掉中间，留 8 份（缩 3 倍）' : '三角：缩一半留 3 份'}；实画 ${d} 层 → ${
        pieces ** d
      } 块，维数 = log${pieces}/log${ratio} ≈ ${dim.toFixed(3)}（介于线与面之间）；面积：${
        isCarpet ? '→ 0' : '→ 0，周长 → ∞'
      }`;
    },
    render: renderSierpinski,
  },
  tree: {
    label: '分形树',
    source: '自相似结构 · 支气管 / 血管 / 河流',
    hint: '每根枝分成两叉，角度 ±θ，长度 ×r。只有三个参数，却能从一棵针叶林调到一株珊瑚。',
    params: [
      {key: 'depth', label: '分叉层数', value: 8, min: 1, max: 9, step: 1},
      {key: 'angle', label: '分叉角', value: 25, min: 5, max: 80, step: 1},
      {key: 'shrink', label: '长度比 r', value: 0.72, min: 0.5, max: 0.85, step: 0.01},
      {key: 'skew', label: '左右不对称', value: 0, min: 0, max: 20, step: 1},
      {key: 'stroke', label: '枝粗', value: 2, min: 0.5, max: 5, step: 0.5},
    ],
    info: (v) => {
      const d = Math.min(v.depth, 9);
      const dim = Math.log(2) / Math.log(1 / v.shrink);
      return `${2 ** d} 根末梢；总枝长按 (2r)^n ${
        v.shrink < 0.5 ? '收敛 → 用有限材料搭出无限层次' : v.shrink === 0.5 ? '刚好持平' : '发散 → 越分越密，最后糊成一团'
      }；自相似维数 = log2/log(1/r) ≈ ${dim.toFixed(2)}${dim > 2 ? '（超过 2 说明平面装不下，只能靠重叠）' : ''}`;
    },
    render: renderTree,
  },
  spiral: {
    label: '螺线',
    source: '对数螺（1638）/ 阿基米德螺（前 3 世纪）',
    hint: '对数螺「每转 90° 放大固定倍率」，所以缩放后与自身重合；阿基米德螺「每转增加固定长度」，圈距相等。',
    params: [
      {
        key: 'type',
        label: '螺线种类',
        value: 'logarithmic',
        options: [
          {value: 'logarithmic', label: '对数螺'},
          {value: 'archimedean', label: '阿基米德'},
        ],
      },
      {key: 'growth', label: '每 90° 倍率 g', value: 1.618, min: 1.05, max: 2.2, step: 0.01},
      {key: 'turns', label: '圈数', value: 4, min: 1, max: 6, step: 1},
      {
        key: 'marks',
        label: '每 90° 半径线',
        value: true,
        options: [
          {value: true, label: '显示'},
          {value: false, label: '隐藏'},
        ],
      },
      {key: 'stroke', label: '线宽', value: 2, min: 1, max: 4, step: 0.5},
    ],
    info: (v) =>
      v.type === 'archimedean'
        ? `r = a·θ，圈距恒为 2πa ≈ ${n(((Math.min(W, H) / 2 - 26) / (v.turns * 2 * Math.PI)) * 2 * Math.PI)}：这正是「圆盘能被一圈圈绕出来的」那种螺线（唱片纹路）`
        : `每转 90° 半径 ×${v.growth}，一整圈 ×${(v.growth ** 4).toFixed(3)}；g = 1.618 → 黄金螺（切正方形连四分之一圆），鹦鹉螺实测 ≈ 1.33，仍是**对数螺**——自相似不挑倍率`,
    render: renderSpiral,
  },
  fourier: {
    label: '傅里叶级数',
    source: '1807 · Fourier',
    hint: '方波 = 只留奇次谐波、幅度按 1/k 收缩的一串正弦。拖「项数」看逼近，开「各次谐波」看它们是谁在出力。',
    params: [
      {
        key: 'target',
        label: '目标波形',
        value: 'square',
        options: [
          {value: 'square', label: '方波'},
          {value: 'saw', label: '锯齿'},
          {value: 'triangle', label: '三角'},
        ],
      },
      {key: 'terms', label: '项数 N', value: 8, min: 1, max: 24, step: 1},
      {
        key: 'harmonics',
        label: '各次谐波',
        value: false,
        options: [
          {value: true, label: '画出'},
          {value: false, label: '只看合成'},
        ],
      },
      {key: 'stroke', label: '线宽', value: 2.5, min: 1, max: 4, step: 0.5},
    ],
    info: (v) => {
      const odd = v.target === 'square' || v.target === 'triangle';
      const used = odd ? Math.ceil(v.terms / 2) : v.terms;
      // 最后一项取实际画出的最高次谐波：奇次系列在 terms 为偶数时落在 terms - 1
      const lastK = odd && v.terms % 2 === 0 ? v.terms - 1 : v.terms;
      const amp = v.target === 'triangle' ? 1 / lastK ** 2 : 1 / lastK;
      return `实画 ${used} 个非零谐波，最高到第 ${lastK} 次，幅度 ${
        v.target === 'triangle' ? '1/k²' : '1/k'
      } = ${amp.toFixed(4)}；虚线是 120 项的「理想波形」。跳变处的超调约 8.9%，加到 1000 项也不会消失——那就是 Gibbs 现象`;
    },
    render: renderFourier,
  },
  bezier: {
    label: '贝塞尔曲线',
    source: '1960 · Bézier / de Casteljau',
    hint: '拖动四个空心圆：曲线只认这几个控制点。这就是矢量图形与照片的分水岭——没有像素，只有参数。',
    state: {points: BEZIER_DEFAULT},
    params: [
      {
        key: 'degree',
        label: '阶数',
        value: 'cubic',
        options: [
          {value: 'quad', label: '二次（3 点）'},
          {value: 'cubic', label: '三次（4 点）'},
        ],
      },
      {key: 't', label: '取样位置 t', value: 0.5, min: 0, max: 1, step: 0.01},
      {
        key: 'construction',
        label: 'de Casteljau 作图',
        value: true,
        options: [
          {value: true, label: '显示'},
          {value: false, label: '隐藏'},
        ],
      },
    ],
    hitTest: (point, values) => {
      let best = null;
      let bestD = 20;
      values.points.forEach((p, index) => {
        const d = Math.hypot(p.x - point.x, p.y - point.y);
        if (d < bestD) {
          bestD = d;
          best = {index};
        }
      });
      return best;
    },
    onDrag: (handle, point, values) => ({
      points: values.points.map((p, i) =>
        i === handle.index ? {x: n(clamp(point.x, 10, W - 10)), y: n(clamp(point.y, 10, H - 10))} : p,
      ),
    }),
    info: (v) => {
      const pts = v.points.slice(0, v.degree === 'quad' ? 3 : 4);
      return `SVG 里就一句：d="${bezierPath(pts)}"（${pts.length} 个点、${pts.length * 2} 个数字）。曲线一定经过首尾两个端点，中间点只决定出发与到达时的切线方向 —— Logo 与字体轮廓全是这一条`;
    },
    render: renderBezier,
  },
  julia: {
    label: 'Julia 集',
    source: '1918 · Gaston Julia',
    hint: '固定 c、变动初值 z₀，迭代 z²+c：不逃逸的点连成一片。拖动画面即可换 c——c 在 Mandelbrot 集里就连通，在外面就碎成尘埃。',
    medium: 'canvas',
    params: [
      {key: 're', label: 'c 实部', value: -0.4, min: -1, max: 1, step: 0.01},
      {key: 'im', label: 'c 虚部', value: 0.6, min: -1, max: 1, step: 0.01},
      {key: 'iter', label: '迭代上限', value: 160, min: 32, max: 400, step: 8},
      {key: 'scale', label: '视野缩放', value: 1, min: 0.5, max: 3, step: 0.05},
    ],
    paint: paintJulia,
    onPoint: ({u, v}, values) => {
      // 与 paint 里的复平面同一套映射，鼠标点下去就是那个 c
      const halfX = 2 / (values.scale ?? 1);
      const halfY = halfX * (H / W);
      return {
        re: n(clamp(-halfX + 2 * halfX * u, -1, 1)),
        im: n(clamp(-halfY + 2 * halfY * v, -1, 1)),
      };
    },
    info: (v) =>
      `c = ${v.re} ${v.im >= 0 ? '+' : '−'} ${Math.abs(v.im)}i，${
        inMandelbrot(v.re, v.im)
          ? '落在 Mandelbrot 集内 → 这枚 Julia 集是连成一片的'
          : '在 Mandelbrot 集外 → Julia 碎成康托式尘埃'
      }；迭代 ${v.iter} 次。边界维数 = 2（Mandelbrot 边界同样是 2）`,
  },
};
