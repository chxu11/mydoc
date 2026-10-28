import React from 'react';

import {
  CANVAS_BG,
  H,
  W,
  bbox,
  gcd,
  haloProps,
  n,
  polylinePath,
  strokeProps,
} from '../ParamLab/geometry';

/**
 * 纹样参数化几何：母题 → 参数 → 图形（几何工具见 ../ParamLab/geometry）。
 *
 * 每个母题导出 {label, source, hint, params, info, render}，
 * render(values, uid) 返回 <g>/<path>，uid 只用于 <mask> 等内部引用去重。
 */

/* ---------------- 1. 青海波：同心弧按砖缝错排 ---------------- */
function renderSeigaiha({radius, rings, stroke, shear, overlap}) {
  const colStep = radius * 2;
  // 行距小于半径 → 下排扇面盖住上排弧线的下沿，才有「鳞浪」的压叠感
  const rowStep = radius * overlap;
  // 环距至少要压得住线宽，否则层数堆满会连成一块实心
  const usedRings = Math.min(rings, Math.max(1, Math.floor(radius / (stroke * 1.7))));
  const fans = [];
  for (let row = -2; row * rowStep < H + radius; row++) {
    const cy = row * rowStep + radius * 0.55;
    // 每行平移「列距 × shear × 行号」，取小数部分 → 0.5 是砖缝，0.25 是斜列
    const shift = ((((row * shear) % 1) + 1) % 1) * colStep;
    for (let col = -1; col * colStep < W + colStep; col++) {
      const cx = col * colStep + shift + radius;
      // 一个扇形 = 若干层同心半圆弧（开口朝下，像浪头）
      const arcs = [];
      for (let k = 0; k < usedRings; k++) {
        const rr = radius * (1 - k / usedRings) - 0.5;
        if (rr <= 2) break;
        arcs.push(`M ${n(cx - rr)} ${n(cy)} A ${n(rr)} ${n(rr)} 0 0 1 ${n(cx + rr)} ${n(cy)}`);
      }
      if (!arcs.length) continue;
      // 先铺一层扇面底：下排扇面盖住上排弧线的下沿，才有「鳞浪」的压叠感，
      // 否则两排弧线会真的相交，形成一排叉形毛刺
      fans.push(
        <g key={`${row}-${col}`}>
          <path
            d={`M ${n(cx - radius)} ${n(cy)} A ${n(radius)} ${n(radius)} 0 0 1 ${n(cx + radius)} ${n(cy)} Z`}
            style={{fill: CANVAS_BG}}
            stroke="none"
          />
          <path d={arcs.join(' ')} {...strokeProps(stroke)} />
        </g>,
      );
    }
  }
  return <>{fans}</>;
}

/* ---------------- 2. Greek Key：一条线连续折返 ---------------- */
function renderMeander({units, ratio, rows, stroke, flip}) {
  const margin = 24;
  const u = (W - margin * 2) / units;
  const slot = (H - margin * 2) / rows;
  // 单元做成近似方形的「钥匙」，一层带子放不下就叠几层（古希腊双回纹）
  const h = Math.min(slot - 20, u * ratio);
  const bands = [];
  for (let r = 0; r < rows; r++) {
    const top = margin + r * slot + (slot - h) / 2;
    const bottom = top + h;
    const pts = [];
    for (let i = 0; i < units; i++) {
      const x = margin + i * u;
      if (i === 0) pts.push({x, y: bottom});
      pts.push({x, y: top}); // 上行
      pts.push({x: x + u * 0.78, y: top}); // 顶边右折
      pts.push({x: x + u * 0.78, y: top + h * 0.58}); // 下垂
      pts.push({x: x + u * 0.42, y: top + h * 0.58}); // 左钩
      pts.push({x: x + u * 0.42, y: bottom}); // 落到底边
      pts.push({x: x + u, y: bottom}); // 交给下一个单元
    }
    // 收尾竖线：与左端的上行对称，不让线悬空在底边
    pts.push({x: margin + units * u, y: top});
    bands.push(
      <path
        key={r}
        d={polylinePath(pts)}
        {...strokeProps(stroke)}
        // 隔层镜像：两条回纹逆向而行，接近古典「双回纹」带
        transform={
          flip === 'mirror' && r % 2 === 1 ? `translate(${W} 0) scale(-1 1)` : undefined
        }
      />,
    );
  }
  return <>{bands}</>;
}

/* ---------------- 3. 云雷：方折螺旋满地铺，圆角化即「云」 ---------------- */

/** 一个螺旋的点集：四方向轮转，每两段把步长加一截 */
function spiralPoints(turns, step) {
  const dirs = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
  ];
  const pts = [{x: 0, y: 0}];
  let x = 0;
  let y = 0;
  let len = step;
  for (let i = 0; i < turns * 4; i++) {
    const [dx, dy] = dirs[i % 4];
    x += dx * len;
    y += dy * len;
    pts.push({x, y});
    if (i % 2 === 1) len += step;
  }
  return pts;
}

/** 按列数定格子，保证螺旋在竖向上也装得下 */
function leiwenGrid(cols) {
  const cell = W / cols;
  const rows = Math.max(1, Math.ceil(H / cell));
  return {cell, rows, unit: Math.min(cell, H / rows)};
}

function renderLeiwen({turns, corner, stroke, cols, mirror}) {
  const {cell, rows, unit} = leiwenGrid(cols);
  const step = unit / (turns * 2 + 1.6);
  const base = spiralPoints(turns, step);
  const box = bbox(base);
  const mx = (box.x0 + box.x1) / 2;
  const my = (box.y0 + box.y1) / 2;
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = (c + 0.5) * cell;
      const cy = (r + 0.5) * (H / rows);
      // 相邻格镜像：两个旋向相反的螺旋才能咬合——商周铜器上的雷纹就是这么铺地的
      const sx = mirror === 'same' || (r + c) % 2 === 0 ? 1 : -1;
      const pts = base.map((p) => ({x: cx + sx * (p.x - mx), y: cy + (p.y - my)}));
      cells.push(
        <path
          key={`${r}-${c}`}
          d={polylinePath(pts, corner * step * 0.46)}
          {...strokeProps(stroke)}
        />,
      );
    }
  }
  return <>{cells}</>;
}

/** 最大公约数见 ../ParamLab/geometry；此处只用于星形跨步 */

/* ---------------- 4. 麻叶：六边形密铺 + 每个中心的六条辐条 ---------------- */
function renderAsanoha({radius, spoke, outline, stroke}) {
  // 尖顶六边形：水平间距 √3·R，垂直 1.5·R，奇数行错半格——只有 6 能这样无缝密铺
  const dx = Math.sqrt(3) * radius;
  const dy = radius * 1.5;
  const spokes = [];
  const hexes = [];
  for (let row = -1; row * dy < H + dy; row++) {
    const cy = row * dy;
    for (let col = -1; col * dx < W + dx; col++) {
      const cx = col * dx + (row % 2 ? dx / 2 : 0);
      const verts = Array.from({length: 6}, (_, k) => {
        const a = (-90 + k * 60) * (Math.PI / 180);
        return {x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a)};
      });
      // 辐条缩到 0.6 就把「叶」变成六瓣星花，留白一起长出来
      const inner = verts.map((p) => ({
        x: cx + (p.x - cx) * spoke,
        y: cy + (p.y - cy) * spoke,
      }));
      spokes.push(
        ...inner.map(
          (p) => `M ${n(cx)} ${n(cy)} L ${n(p.x)} ${n(p.y)}`,
        ),
      );
      if (outline) {
        hexes.push(
          `M ${verts.map((p) => `${n(p.x)} ${n(p.y)}`).join(' L ')} Z`,
        );
      }
    }
  }
  return (
    <>
      {outline ? <path d={hexes.join(' ')} {...strokeProps(stroke)} /> : null}
      <path d={spokes.join(' ')} {...strokeProps(stroke)} />
    </>
  );
}

/* ---------------- 5. 市松：棋盘错色，平移半格就斜过来 ---------------- */
function renderIchimatsu({cell, shear, gap, ink}) {
  const s = cell * (1 - gap);
  const tiles = [];
  for (let row = -2; row * cell < H + cell * 2; row++) {
    const shift = row * cell * shear;
    for (let col = -2; col * cell < W + cell * 2; col++) {
      // 棋盘奇偶：只画一半格子，剩下的空位就是另一种颜色
      if ((row + col) % 2 !== 0) continue;
      tiles.push(
        <rect
          key={`${row}-${col}`}
          x={n(col * cell + shift)}
          y={n(row * cell)}
          width={n(s)}
          height={n(s)}
          style={{fill: 'currentColor'}}
          opacity={ink}
          stroke="none"
        />,
      );
    }
  }
  return <>{tiles}</>;
}

/* ---------------- 6. 十重星盘：Girih 的对称骨架 ---------------- */
function renderRosette({sides, rings, star, stroke}) {
  const cx = W / 2;
  const cy = H / 2;
  const R = Math.min(W, H) / 2 - 22;
  const at = (angle, r) => ({x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle)});
  const vertices = (r, rot) =>
    Array.from({length: sides}, (_, i) => at(rot + (i * 2 * Math.PI) / sides, r));

  const layers = [];
  for (let r = 0; r < rings; r++) {
    const rr = R * (0.4 + (0.56 * r) / Math.max(1, rings - 1));
    // 相邻层旋转半格，密铺的错位感就出来了
    const rot = -Math.PI / 2 + (r % 2 === 0 ? 0 : Math.PI / sides);
    const pts = vertices(rr, rot);
    layers.push(
      <polygon
        key={`ring-${r}`}
        points={pts.map((p) => `${n(p.x)},${n(p.y)}`).join(' ')}
        {...strokeProps(stroke)}
      />,
    );
  }

  // 星形：沿「跨步」在顶点上循环。gcd(n, star) = g 时图形拆成 g 笔，
  // g=1 才能一笔画成——这正是古老星形铺砖里常见的「能不能一笔连完」问题。
  const cycles = gcd(sides, star);
  const perCycle = sides / cycles;
  const r0 = R * 0.4;
  let starPath = '';
  for (let start = 0; start < cycles; start++) {
    const pts = [];
    for (let k = 0; k <= perCycle; k++) {
      const idx = (start + k * star) % sides;
      pts.push(at(-Math.PI / 2 + (idx * 2 * Math.PI) / sides, r0));
    }
    starPath += `M ${n(pts[0].x)} ${n(pts[0].y)} `;
    starPath += pts.slice(1).map((p) => `L ${n(p.x)} ${n(p.y)}`).join(' ');
    starPath += ' ';
  }

  const spokes = [];
  for (let i = 0; i < sides; i++) {
    const a = at(-Math.PI / 2 + (i * 2 * Math.PI) / sides, R * 0.4);
    const b = at(-Math.PI / 2 + (i * 2 * Math.PI) / sides, R);
    spokes.push(`M ${n(a.x)} ${n(a.y)} L ${n(b.x)} ${n(b.y)}`);
  }

  return (
    <>
      {/* 外圆略大于最外层多边形，避免两条线重合出错觉上的「双线」 */}
      <circle cx={cx} cy={cy} r={R * 1.06} {...strokeProps(stroke)} />
      <path d={spokes.join(' ')} {...strokeProps(stroke, {opacity: 0.45})} />
      {layers}
      <path d={starPath} {...strokeProps(stroke)} />
    </>
  );
}

/* ---------------- 7. 交织绳带：两族斜线交替压挑 ---------------- */
function renderInterlace({gap, stroke, tilt, weave}, uid) {
  const pad = 18;
  const rect = {x: pad, y: pad, w: W - pad * 2, h: H - pad * 2};
  const maskId = `weave-${uid}`;
  const clipId = `clip-${uid}`;
  // 斜织时整组会被旋转，局部坐标得把画框多留一圈，否则旋转后四角会空掉
  const ext = 300;
  const y0 = rect.y - ext;
  const y1 = rect.y + rect.h + ext;
  const cutPad = 150;

  // 族 A：x + y = c（左下 → 右上）；族 B：x - y = d（左上 → 右下）
  const familyA = [];
  const familyB = [];
  const cuts = [];
  // 断口必须大于 B 的 halo 半宽（stroke/2 + 1.75），否则洞里还留着 B 的底色描边，
  // 会把 A 也一起切断 —— 交叉处就成了「两边都断」的假压挑
  const holeR = Math.min(stroke / 2 + 2.6, gap * 0.35);

  for (let c = rect.x + rect.y - ext; c <= rect.x + rect.w + rect.y + rect.h + ext; c += gap) {
    familyA.push(c);
  }
  for (let d = rect.x - (rect.y + rect.h) - ext; d <= rect.x + rect.w - rect.y + ext; d += gap) {
    familyB.push(d);
  }

  const dA = familyA.map((c) => `M ${n(c - y0)} ${n(y0)} L ${n(c - y1)} ${n(y1)}`).join(' ');
  const dB = familyB.map((d) => `M ${n(d + y0)} ${n(y0)} L ${n(d + y1)} ${n(y1)}`).join(' ');

  // 「不压挑」：只留两族平行斜线——压挑是叠在几何上的额外规则，关掉才能看清这一点
  if (weave === 'off') {
    return (
      <>
        <defs>
          <clipPath id={clipId}>
            <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <g transform={tilt ? `rotate(${tilt} ${W / 2} ${H / 2})` : undefined}>
            <path d={`${dA} ${dB}`} {...strokeProps(stroke)} />
          </g>
        </g>
      </>
    );
  }

  // 交叉点：x=(c+d)/2, y=(c-d)/2；棋盘奇偶交替 → 一半让 B 断，A 就露出来
  familyB.forEach((d, jb) => {
    familyA.forEach((c, ia) => {
      const x = (c + d) / 2;
      const y = (c - d) / 2;
      if (
        x < rect.x - cutPad ||
        x > rect.x + rect.w + cutPad ||
        y < rect.y - cutPad ||
        y > rect.y + rect.h + cutPad
      ) {
        return;
      }
      if ((ia + jb) % 2 === 0) {
        cuts.push({x, y});
      }
    });
  });

  return (
    <>
      <defs>
        <clipPath id={clipId}>
          <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} />
        </clipPath>
        {/* 遮罩区域要涵盖旋转后的局部坐标，不能只给画布那么大 */}
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x={-ext}
          y={-ext}
          width={W + ext * 2}
          height={H + ext * 2}>
          <rect x={-ext} y={-ext} width={W + ext * 2} height={H + ext * 2} fill="#fff" />
          {cuts.map((c, k) => (
            <circle key={k} cx={n(c.x)} cy={n(c.y)} r={n(holeR)} fill="#000" />
          ))}
        </mask>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <g transform={tilt ? `rotate(${tilt} ${W / 2} ${H / 2})` : undefined}>
          {/* 族 A：先铺一层底色光晕再画线，让后画的 B 在交叉处“顶”出留白 */}
          <path d={dA} {...haloProps(stroke)} />
          <path d={dA} {...strokeProps(stroke)} />
          {/* 族 B：被遮罩切断的地方露出 A，就是「A 压 B」；其余位置 B 的光晕切开 A，就是「B 压 A」 */}
          <g mask={`url(#${maskId})`}>
            <path d={dB} {...haloProps(stroke)} />
            <path d={dB} {...strokeProps(stroke)} />
          </g>
        </g>
      </g>
    </>
  );
}

/* ---------------- 母题注册表 ---------------- */

/**
 * 展示顺序跟正文一致：云雷 → 回纹 → 麻叶 → 市松 → 青海波 → Girih → 交织。
 * 新加母题忘了登记也不会消失，只是排在最后（见 src/pages/lab.js）。
 */
export const PATTERN_ORDER = [
  'leiwen',
  'meander',
  'asanoha',
  'ichimatsu',
  'seigaiha',
  'rosette',
  'interlace',
];

export const PATTERNS = {
  seigaiha: {
    label: '青海波',
    source: '日本 · 室町–江户',
    hint: '把一个半圆弧层层套住，再按砖缝错排，浪就自己长出来了（满铺纹样，四边按画布裁切）。',
    params: [
      {key: 'radius', label: '扇形半径', value: 44, min: 26, max: 64, step: 2},
      {key: 'rings', label: '同心层数', value: 4, min: 1, max: 6, step: 1},
      {key: 'overlap', label: '行间压叠', value: 0.74, min: 0.45, max: 1.05, step: 0.01},
      {key: 'shear', label: '逐行错排', value: 0.5, min: 0, max: 0.5, step: 0.05},
      {key: 'stroke', label: '线宽', value: 2, min: 1, max: 4, step: 0.5},
    ],
    info: (v) => {
      const used = Math.min(v.rings, Math.max(1, Math.floor(v.radius / (v.stroke * 1.7))));
      return `每行 ${Math.ceil(W / (v.radius * 2))} 个扇形；行距 = ${v.overlap}·R（压住上排 ${Math.round(
        (1 - v.overlap) * 100,
      )}%，拉到 1 就不重叠，变回普通的同心圆阵），逐行错排 ${(v.shear * 100).toFixed(
        0,
      )}% 列距${v.shear === 0.5 ? '（砖缝，青海波的正身）' : v.shear === 0 ? '（对齐成方阵）' : '（斜列，鳞纹的变体）'}；实际画 ${used} 层（再多会粘连）`;
    },
    render: renderSeigaiha,
  },
  meander: {
    label: 'Greek Key 回纹',
    source: '希腊 · 前 8 世纪',
    hint: '整条带子只有一笔：上行、右折、下垂、左钩、落底，然后交给下一个单元。',
    params: [
      {key: 'units', label: '单元数', value: 6, min: 2, max: 12, step: 1},
      {key: 'ratio', label: '高宽比', value: 0.9, min: 0.5, max: 1.2, step: 0.05},
      {key: 'rows', label: '带数', value: 2, min: 1, max: 3, step: 1},
      {
        key: 'flip',
        label: '隔层镜像',
        value: 'mirror',
        options: [
          {value: 'mirror', label: '逆向而行'},
          {value: 'same', label: '全部同向'},
        ],
      },
      {key: 'stroke', label: '线宽', value: 5, min: 2, max: 10, step: 0.5},
    ],
    info: (v) =>
      `${v.units} 个单元 × 6 段折线 = 一笔走完 ${v.units * 6} 段；${
        v.rows > 1
          ? v.flip === 'mirror'
            ? `${v.rows} 条带子隔层镜像、逆向而行（古典双回纹）`
            : `${v.rows} 条带子同向叠着（能看出镜像那一翻其实在补对称）`
          : '单带，两端竖向收口'
      }`,
    render: renderMeander,
  },
  leiwen: {
    label: '云雷纹',
    source: '中国 · 商周',
    hint: '方折螺旋是「雷」，把拐角磨圆就成了「云」——同一个点集，只差一个圆角半径；而铜器上的雷纹从来不只有一个，它们是满地镜像咬合的。',
    params: [
      {key: 'cols', label: '每行几个螺旋', value: 3, min: 1, max: 6, step: 1},
      {key: 'turns', label: '螺旋圈数', value: 3, min: 1, max: 6, step: 1},
      {key: 'corner', label: '圆角（雷 → 云）', value: 0, min: 0, max: 1, step: 0.05},
      {
        key: 'mirror',
        label: '相邻格旋向',
        value: 'alternate',
        options: [
          {value: 'alternate', label: '一正一反'},
          {value: 'same', label: '全部同旋'},
        ],
      },
      {key: 'stroke', label: '线宽', value: 4, min: 1, max: 10, step: 0.5},
    ],
    info: (v) => {
      const {rows} = leiwenGrid(v.cols);
      return `${v.cols} × ${rows} 满地密铺，${
        v.mirror === 'same' ? '全部同旋：看上去像一排排漩涡，但邻格之间留不出互嵌的余地' : '相邻旋向相反（镜像才咬得住）'
      }；每个螺旋 ${v.turns * 4} 个直角，圆角半径 = 步长的 ${Math.round(
        v.corner * 46,
      )}%${v.cols === 1 ? '（单开一个，就是“云”的标准像）' : ''}`;
    },
    render: renderLeiwen,
  },
  asanoha: {
    label: '麻叶纹',
    source: '日本 · 江户（Kumiko）',
    hint: '先把六边形密铺，再从每个中心向六个顶点拉六条辐条——叶片是相邻两个三角形拼成的菱形。',
    params: [
      {key: 'radius', label: '六边形外接圆', value: 44, min: 24, max: 70, step: 2},
      {key: 'spoke', label: '辐条长度', value: 1, min: 0.4, max: 1, step: 0.05},
      {
        key: 'outline',
        label: '六边形外框',
        value: true,
        options: [
          {value: true, label: '画'},
          {value: false, label: '不画'},
        ],
      },
      {key: 'stroke', label: '线宽', value: 2, min: 1, max: 4, step: 0.5},
    ],
    info: (v) =>
      `中心间距：横向 √3·R ≈ ${n(Math.sqrt(3) * v.radius)}，纵向 1.5·R = ${n(v.radius * 1.5)}；360° ÷ 6 = 60° 恰好整除，所以六边形能无缝密铺（正三角形、正方形也行，正五边形不行）——Girih 想要五重对称，只能改用十重对称的五块砖`,
    render: renderAsanoha,
  },
  ichimatsu: {
    label: '市松纹',
    source: '日本 · 江户（1650s）',
    hint: '只画棋盘上的一半格子，空着的那一半就是另一种色；每行平移半格，色块就排成斜列（斜市松）。',
    params: [
      {key: 'cell', label: '格子大小', value: 48, min: 24, max: 80, step: 2},
      {key: 'shear', label: '逐行平移', value: 0, min: 0, max: 0.5, step: 0.05},
      {key: 'gap', label: '格间留白', value: 0, min: 0, max: 0.3, step: 0.02},
      {key: 'ink', label: '墨色浓度', value: 0.82, min: 0.2, max: 1, step: 0.02},
    ],
    info: (v) =>
      `色块占比恒为 1/2（平移、加留白都不改比例）；格子 ${v.cell}，逐行平移 ${Math.round(
        v.shear * 100,
      )}%${v.shear === 0 ? '——棋盘原版' : v.shear === 0.5 ? '，正好半格：斜市松' : '，斜而不齐，带子歪着走'}`,
    render: renderIchimatsu,
  },
  rosette: {
    label: '十重星盘',
    source: '伊斯兰 · Girih 骨架',
    hint: 'Girih 用五块砖拼，但骨架只有一件事：把圆周 n 等分，再错位套几层多边形。',
    params: [
      {key: 'sides', label: '重数 n', value: 10, min: 5, max: 12, step: 1},
      {key: 'rings', label: '层数', value: 3, min: 1, max: 4, step: 1},
      {key: 'star', label: '星形跨步', value: 3, min: 2, max: 4, step: 1},
      {key: 'stroke', label: '线宽', value: 2, min: 1, max: 4, step: 0.5},
    ],
    info: (v) => {
      const g = gcd(v.sides, v.star);
      return `每 ${n(360 / v.sides)}° 重复一次；跨步 ${v.star} 与 n=${v.sides} 的公约数是 ${g} —— 星形${
        g === 1 ? '一笔画成' : `会拆成 ${g} 笔互不相连`
      }`;
    },
    render: renderRosette,
  },
  interlace: {
    label: '交织绳带',
    source: '凯尔特 / 伊斯兰 · interlace',
    hint: '两族斜线铺满平面，在每个交叉点交替「压」和「挑」，绳结的基本动作就这一条。把「压挑规则」关掉，剩下的只是两组平行线。',
    params: [
      {key: 'gap', label: '带宽间距', value: 46, min: 24, max: 72, step: 2},
      {key: 'stroke', label: '带宽', value: 7, min: 3, max: 10, step: 1},
      {
        key: 'weave',
        label: '压挑规则',
        value: 'alternate',
        options: [
          {value: 'alternate', label: '交替压挑'},
          {value: 'off', label: '不压挑'},
        ],
      },
      {key: 'tilt', label: '斜织倾角', value: 0, min: -45, max: 45, step: 5},
    ],
    info: (v) =>
      v.weave === 'off'
        ? `关掉压挑：剩下的只是两族 90° 相交的平行线（间距 ${v.gap}、带宽 ${v.stroke}）——绳结感全部来自那个“谁在上”的规则，而不是几何本身`
        : `斜线夹角 90°，交叉点按棋盘奇偶交替压挑；断口半径 = 带宽/2 + 2.6，必须大于一道 halo 的半宽，否则上下两层都会被切断（当前间距/带宽 = ${n(
            v.gap / v.stroke,
          )}）；倾角 ${v.tilt}° 只是把画框转过去，压挑规则一条没变——织物里的「斜织」就是它`,
    render: renderInterlace,
  },
};
