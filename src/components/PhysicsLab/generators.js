import React from 'react';

import {H, W, n, polylinePath, strokeProps} from '../ParamLab/geometry';
import {
  beatEnvelope,
  beatFreq,
  beatY,
  maxwellF,
  oscDampedOmega,
  oscHalfLife,
  oscQ,
  oscRegime,
  oscX,
  planckB,
  planckPeakLambda,
  rayleighJeans,
  SIGMA_SB,
  tunnelDecayLength,
  tunnelResonantWidths,
  tunnelT,
  vMean,
  vMostProbable,
  vRms,
  WIEN_B,
} from './formulas.mjs';

/**
 * 物理参数化生成器：阻尼振动 / 拍频 / 麦克斯韦速率分布 / 黑体谱 / 势垒穿透。
 *
 * 契约与纹样、数学完全一致（见 ../ParamLab/index.js）：母题 → 参数 → 图形 + 一句
 * 「参数背后的物理」。这一组多一条规矩：**所有数值都从 ./formulas.mjs 现场算**，
 * 生成器里不写任何"教科书常数"。formulas.mjs 同时被 scripts/check-lab.mjs 用
 * 解析性质对撞（ζ=0 必须恒等 cos ωt、λmax·T 必须给出维恩常数、k′a=nπ 必须 T=1…），
 * 所以滑杆下面那行小字里的数字出错，构建期就会红，而不是线上看着像个摆设。
 *
 * 坐标约定沿用 ParamLab：画布 480×320，只用 currentColor 描边（跟随明暗主题）。
 */

/* ---------------- 绘图区与坐标映射 ---------------- */

const X0 = 42; // 左边留出 y 轴标签
const X1 = W - 12;
const Y0 = 14;
const Y1 = H - 28; // 底边留出 x 轴标签

/** u ∈ [0,1] → 画布横坐标 */
const px = (u) => X0 + (X1 - X0) * u;
/** v ∈ [0,1] → 画布纵坐标（0 在轴线上） */
const py = (v) => Y1 - (Y1 - Y0) * v;

/** 上下对称的图（振动、波）：v ∈ [−1,1]，中线在画布竖直中心 */
const MID = (Y0 + Y1) / 2;
const AMP = ((Y1 - Y0) / 2) * 0.94;
const pm = (v) => MID - v * AMP;

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

/**
 * 坐标框：轴线 + 刻度文字。
 * 文字用 var(--ifm-font-color-base) 而不是 --ifm-heading-color —— 后者在 SVG 里
 * 解析成 inherit（等于黑），深色主题下直接隐身（MetroMap 踩过）。
 */
function Frame({xTicks = [], yTicks = [], mid = false, xLabel, yLabel}) {
  const zero = mid ? MID : Y1;
  const map = mid ? pm : py;
  return (
    <g>
      <path
        d={`M ${X0} ${n(zero)} L ${X1} ${n(zero)}`}
        {...strokeProps(1, {opacity: 0.3})}
      />
      <path
        d={`M ${n(X0)} ${n(Y0)} L ${n(X0)} ${n(Y1)}`}
        {...strokeProps(1, {opacity: 0.3})}
      />
      {xTicks.map((t) => (
        <g key={`x-${t.text}`}>
          <path
            d={`M ${n(px(t.u))} ${n(zero)} l 0 ${t.below === false ? -4 : 4}`}
            {...strokeProps(1, {opacity: 0.45})}
          />
          <text
            x={n(px(t.u))}
            y={n(zero + (t.below === false ? -8 : 13))}
            fontSize={9}
            textAnchor={t.anchor ?? 'middle'}
            fill="var(--ifm-font-color-base)"
            stroke="none">
            {t.text}
          </text>
        </g>
      ))}
      {yTicks.map((t) => (
        <text
          key={`y-${t.text}`}
          x={n(X0 - 6)}
          y={n(map(t.v) + 3)}
          fontSize={9}
          textAnchor="end"
          fill="var(--ifm-font-color-base)"
          stroke="none">
          {t.text}
        </text>
      ))}
      {xLabel ? (
        <text
          x={n(X1)}
          y={n(Y1 + 24)}
          fontSize={9}
          textAnchor="end"
          fill="var(--ifm-font-color-base)"
          stroke="none"
          opacity={0.7}>
          {xLabel}
        </text>
      ) : null}
      {yLabel ? (
        <text
          x={n(X0 + 4)}
          y={n(Y0 + 8)}
          fontSize={9}
          fill="var(--ifm-font-color-base)"
          stroke="none"
          opacity={0.7}>
          {yLabel}
        </text>
      ) : null}
    </g>
  );
}

/**
 * 采样 → 折线：x 由 index 均匀铺满绘图区，y 由调用方给映射。
 * ⚠️ mapY 必须返回**画布像素**（即内部再套一层 py / pm），不是 0–1 的归一化值 ——
 * 归一化值会被当成"距顶边 0.4 像素"画出来，曲线糊成天花板上一条直线。
 * check-lab 第 3 层的「最长曲线也必须铺开」就是专门拦这一类错的。
 */
function samplePath(count, mapY, xOf) {
  const pts = [];
  for (let i = 0; i <= count; i++) {
    const u = i / count;
    pts.push({x: n(xOf ? xOf(u) : px(u)), y: n(mapY(u))});
  }
  return polylinePath(pts);
}

/* ---------------- 1. 阻尼振动：一个参数决定三种命运 ---------------- */

function renderOsc({zeta, omega, cycles, envelope, stroke}) {
  const T = (cycles * 2 * Math.PI) / omega;
  const x = (t) => oscX(t, {zeta, omega});
  const env = (t) => Math.exp(-zeta * omega * t);
  return (
    <>
      <Frame
        mid
        xTicks={[
          {u: 0, text: '0'},
          {u: 0.5, text: `${(T / 2).toFixed(1)} s`},
          {u: 1, text: `${T.toFixed(1)} s`},
        ]}
        yTicks={[
          {v: 1, text: '+1'},
          {v: -1, text: '−1'},
        ]}
        xLabel="t"
        yLabel="x / x₀"
      />
      <path d={`M ${X0} ${n(MID)} L ${X1} ${n(MID)}`} {...strokeProps(1, {opacity: 0.18})} />
      {envelope && zeta > 0 ? (
        <>
          <path
            d={samplePath(200, (u) => pm(env(T * u)))}
            {...strokeProps(stroke * 0.6, {opacity: 0.3, strokeDasharray: '5 4'})}
          />
          <path
            d={samplePath(200, (u) => pm(-env(T * u)))}
            {...strokeProps(stroke * 0.6, {opacity: 0.3, strokeDasharray: '5 4'})}
          />
        </>
      ) : null}
      <path d={samplePath(400, (u) => pm(x(T * u)))} {...strokeProps(stroke)} />
    </>
  );
}

/* ---------------- 2. 拍频：两列波相加，多出一个慢频率 ---------------- */

function renderBeat({f1, f2, windowMs, envelope, stroke}) {
  const T = windowMs / 1000;
  const N = 1400; // 载波约 44 个周期 × 每周期 30 多点，再稀就会看成莫尔纹
  return (
    <>
      <Frame
        mid
        xTicks={[
          {u: 0, text: '0'},
          {u: 1, text: `${windowMs} ms`},
        ]}
        yTicks={[
          {v: 1, text: '+2'},
          {v: -1, text: '−2'},
        ]}
        xLabel="t"
        yLabel="x₁ + x₂"
      />
      <path d={`M ${X0} ${n(MID)} L ${X1} ${n(MID)}`} {...strokeProps(1, {opacity: 0.18})} />
      {envelope ? (
        <>
          <path
            d={samplePath(N, (u) => pm(beatEnvelope(T * u, f1, f2) / 2))}
            {...strokeProps(stroke * 0.6, {opacity: 0.35, strokeDasharray: '5 4'})}
          />
          <path
            d={samplePath(N, (u) => pm(-beatEnvelope(T * u, f1, f2) / 2))}
            {...strokeProps(stroke * 0.6, {opacity: 0.35, strokeDasharray: '5 4'})}
          />
        </>
      ) : null}
      <path d={samplePath(N, (u) => pm(beatY(T * u, f1, f2) / 2))} {...strokeProps(stroke)} />
    </>
  );
}

/* ---------------- 3. 麦克斯韦速率分布：温度只是把曲线摊平 ---------------- */

const GAS = {
  h2: {label: '氢气 H₂', M: 0.002},
  he: {label: '氦气 He', M: 0.004},
  n2: {label: '氮气 N₂', M: 0.028},
  co2: {label: '二氧化碳 CO₂', M: 0.044},
};

function renderMaxwell({temp, gas, marks, stroke}) {
  const M = GAS[gas].M;
  const vp = vMostProbable(temp, M);
  const vmaxAxis = 3.2 * vRms(temp, M);
  const peak = maxwellF(vp, temp, M);
  const line = (v, text) => (
    <g key={`v-${text}`}>
      <path
        d={`M ${n(px(v / vmaxAxis))} ${n(Y0)} L ${n(px(v / vmaxAxis))} ${n(Y1)}`}
        {...strokeProps(1, {opacity: 0.5, strokeDasharray: '4 4'})}
      />
      <text
        x={n(px(v / vmaxAxis) + 3)}
        y={n(Y0 + (text === '⟨v⟩' ? 22 : text === 'vᵣₘₛ' ? 34 : 10))}
        fontSize={9}
        fill="var(--ifm-font-color-base)"
        stroke="none">
        {`${text} ${Math.round(v)}`}
      </text>
    </g>
  );
  return (
    <>
      <Frame
        xTicks={[
          {u: 0, text: '0'},
          {u: 1, text: `${Math.round(vmaxAxis)} m/s`},
        ]}
        yTicks={[{v: 1, text: '峰'}]}
        xLabel="速率 v"
        yLabel="f(v)"
      />
      <path
        d={samplePath(320, (u) => {
          const v = u * vmaxAxis;
          return py(clamp(maxwellF(v, temp, M) / peak, 0, 1));
        })}
        {...strokeProps(stroke)}
      />
      {marks ? (
        <>
          {line(vp, 'vₚ')}
          {line(vMean(temp, M), '⟨v⟩')}
          {line(vRms(temp, M), 'vᵣₘₛ')}
        </>
      ) : null}
    </>
  );
}

/* ---------------- 4. 黑体谱：一条曲线压住"紫外灾难" ---------------- */

const BANDS = {
  wide: {label: '全谱 20 nm – 30 µm', lo: 2e-8, hi: 3e-5},
  visible: {label: '可见光 350 – 750 nm', lo: 3.5e-7, hi: 7.5e-7},
};

/** 对数横轴：波长跨六个数量级，线性轴会把峰挤成一根针 */
const logX = (band) => (lambda) =>
  px(Math.log(lambda / band.lo) / Math.log(band.hi / band.lo));

/** 波长读数：短的用 nm，长的用 µm */
const fmtLambda = (m) => (m < 1e-6 ? `${n(m * 1e9)} nm` : `${n(m * 1e6)} µm`);

function renderPlanck({temp, band, rj, stroke}) {
  const b = BANDS[band];
  const N = 260;
  const lambdaAt = (u) => b.lo * (b.hi / b.lo) ** u;
  let peak = 0;
  for (let i = 0; i <= N; i++) peak = Math.max(peak, planckB(lambdaAt(i / N), temp));
  const toX = logX(b);
  const inBand = (lo, hi) => {
    if (hi < b.lo || lo > b.hi) return null;
    const x0 = toX(Math.max(lo, b.lo));
    const x1 = toX(Math.min(hi, b.hi));
    return {x: n(x0), width: n(Math.max(1, x1 - x0))};
  };
  const vis = inBand(3.8e-7, 7.5e-7);
  return (
    <>
      <Frame
        xTicks={[
          {u: 0, text: fmtLambda(b.lo)},
          {u: 0.5, text: fmtLambda(Math.sqrt(b.lo * b.hi))},
          {u: 1, text: fmtLambda(b.hi)},
        ]}
        yTicks={[{v: 1, text: '峰值'}]}
        xLabel="波长 λ（对数轴）"
        yLabel="B(λ,T)"
      />
      {vis ? (
        <rect
          x={vis.x}
          y={n(Y0)}
          width={vis.width}
          height={n(Y1 - Y0)}
          fill="currentColor"
          stroke="none"
          opacity={0.07}
        />
      ) : null}
      {/* λ 已经按对数铺在 u 上，所以横坐标直接给 px(u)；toX 只用来把 λ 换算成像素画灰带 */}
      <path
        d={samplePath(N, (u) => py(clamp(planckB(lambdaAt(u), temp) / peak, 0, 1)))}
        {...strokeProps(stroke)}
      />
      {rj ? (
        // 故意允许顶出画布：那条线冲出发框，正是「紫外灾难」的样子
        <path
          d={samplePath(N, (u) => py(clamp(rayleighJeans(lambdaAt(u), temp) / peak, 0, 2)))}
          {...strokeProps(stroke * 0.65, {opacity: 0.55, strokeDasharray: '6 5'})}
        />
      ) : null}
    </>
  );
}

/* ---------------- 5. 势垒穿透：厚度多 0.1 nm，透射掉一个数量级 ---------------- */

function renderTunnel({V0, a, E, marker, stroke}) {
  const Emax = 2 * V0;
  const t = (e) => tunnelT({E: e, V0, a});
  const at = (u) => t(u * Emax);
  return (
    <>
      <Frame
        xTicks={[
          {u: 0, text: '0'},
          {u: 0.5, text: `V₀ = ${V0} eV`},
          {u: 1, text: `${n(Emax)} eV`},
        ]}
        yTicks={[
          {v: 1, text: 'T = 1'},
          {v: 0.5, text: '0.5'},
        ]}
        xLabel="粒子能量 E"
        yLabel="透射系数 T"
      />
      {/* 左半是经典禁区：E < V₀，牛顿力学说 T 恒为 0 */}
      <rect
        x={n(X0)}
        y={n(Y0)}
        width={n((X1 - X0) / 2)}
        height={n(Y1 - Y0)}
        fill="currentColor"
        stroke="none"
        opacity={0.06}
      />
      <path d={samplePath(320, (u) => py(clamp(at(u), 0, 1)))} {...strokeProps(stroke)} />
      {marker ? (
        <>
          <path
            d={`M ${n(px(E / Emax))} ${n(Y0)} L ${n(px(E / Emax))} ${n(Y1)}`}
            {...strokeProps(1, {opacity: 0.5, strokeDasharray: '4 4'})}
          />
          <circle
            cx={n(px(E / Emax))}
            cy={n(py(clamp(at(E / Emax), 0, 1)))}
            r={4}
            fill="currentColor"
            stroke="none"
          />
          <text
            x={n(clamp(px(E / Emax) + 7, X0, X1 - 60))}
            y={n(Y0 + 10)}
            fontSize={9}
            fill="var(--ifm-font-color-base)"
            stroke="none">
            {`E = ${E} eV`}
          </text>
        </>
      ) : null}
    </>
  );
}

/* ---------------- 注册表 ---------------- */

/**
 * 展示顺序按正文的线路走：力学（振动）→ 波（拍频）→ 热（速率分布、黑体谱）→ 量子（隧穿）。
 * 忘了登记也不会消失，只是排在最后（见 src/pages/lab.js 的 ordered()）。
 */
export const PHYSICS_ORDER = ['osc', 'beat', 'maxwell', 'planck', 'tunnel'];

export const PHYSICS_PATTERNS = {
  osc: {
    label: '阻尼振动',
    source: 'x″ + 2ζω₀x′ + ω₀²x = 0',
    hint: '拉起一格松手，只看它怎么回来。阻尼比 ζ 是唯一的主角：ζ=0 永远回不到零，ζ=1 回得最快且越过不了零，ζ>1 像被蜜粘住。',
    params: [
      {key: 'zeta', label: '阻尼比 ζ', value: 0.15, min: 0, max: 2, step: 0.01},
      {key: 'omega', label: '固有角频率 ω₀', value: 6, min: 1, max: 12, step: 0.5},
      {key: 'cycles', label: '看几个周期', value: 5, min: 2, max: 10, step: 1},
      {
        key: 'envelope',
        label: '衰减包络',
        value: true,
        options: [
          {value: true, label: '画出 e^(−ζω₀t)'},
          {value: false, label: '只看曲线'},
        ],
      },
      {key: 'stroke', label: '线宽', value: 2.5, min: 1, max: 4, step: 0.5},
    ],
    info: (v) => {
      const wd = oscDampedOmega(v);
      const q = oscQ(v);
      const hl = oscHalfLife(v);
      return `${oscRegime(v.zeta)}；ω₀=${v.omega.toFixed(1)} rad/s，${
        wd > 0
          ? `振荡频率降到 ωd=${wd.toFixed(2)} rad/s（周期 ${(2 * Math.PI / wd).toFixed(2)} s），Q=${q.toFixed(1)}，包络减半 ${hl.toFixed(2)} s`
          : 'ζ ≥ 1 已经没有振荡频率可言，也就谈不上 Q 与半衰'
      }`
    },
    render: renderOsc,
  },
  beat: {
    label: '拍频',
    source: 'sin 2πf₁t + sin 2πf₂t',
    hint: '两个近乎相同的音一起响，音量会慢慢起伏。起伏的快慢只由差值 Δf 决定，与绝对音高无关；这一组把 f₁ 压到百 Hz 量级，就是为了让包络在几格画布里数得清。',
    params: [
      {key: 'f1', label: 'f₁ (Hz)', value: 110, min: 20, max: 120, step: 1},
      {key: 'f2', label: 'f₂ (Hz)', value: 114, min: 20, max: 120, step: 1},
      {key: 'windowMs', label: '观察窗口 (ms)', value: 400, min: 50, max: 600, step: 10},
      {
        key: 'envelope',
        label: '包络',
        value: true,
        options: [
          {value: true, label: '画出 |2cos πΔf·t|'},
          {value: false, label: '只看合成'},
        ],
      },
      {key: 'stroke', label: '线宽', value: 1.4, min: 1, max: 3, step: 0.2},
    ],
    info: (v) => {
      const df = beatFreq(v.f1, v.f2);
      const beatMs = df > 0 ? 1000 / df : Infinity;
      return `Δf = ${df} Hz → 拍频就是 ${df} Hz（不是 2Δf），每 ${
        df > 0 ? beatMs.toFixed(0) : '∞'
      } ms 起伏一次，${v.windowMs} ms 窗口里数得到 ${
        df > 0 ? (v.windowMs / beatMs).toFixed(2) : '0'
      } 个来回${
        df > 0 && v.windowMs / beatMs < 1 ? '——不到 1 次，把窗口拉长才能看清包络' : ''
      }；载波走了 ${(v.f1 * v.windowMs / 1000).toFixed(0)} 个周期，说明"快慢"是被折进振幅里的。${
        df === 0 ? '两音相同时包络摊平，合成只是同一个音、幅度 ×2' : '调音师把音叉贴上琴弦，听的就是这个起伏慢不慢'
      }`;
    },
    render: renderBeat,
  },
  maxwell: {
    label: '麦克斯韦速率分布',
    source: '1860 · J. C. Maxwell',
    hint: '同一壶气体里，分子跑得有多快并不一致。换气体、升温，看峰往哪走、尾巴怎么摊开——温度就是这样在曲线上留下的指纹。',
    params: [
      {key: 'temp', label: '温度 T (K)', value: 300, min: 100, max: 3000, step: 50},
      {
        key: 'gas',
        label: '气体',
        value: 'n2',
        options: [
          {value: 'h2', label: 'H₂'},
          {value: 'he', label: 'He'},
          {value: 'n2', label: 'N₂'},
          {value: 'co2', label: 'CO₂'},
        ],
      },
      {
        key: 'marks',
        label: '三个特征速率',
        value: true,
        options: [
          {value: true, label: '标出 vₚ / ⟨v⟩ / vᵣₘₛ'},
          {value: false, label: '只画分布'},
        ],
      },
      {key: 'stroke', label: '线宽', value: 2.5, min: 1, max: 4, step: 0.5},
    ],
    info: (v) => {
      const M = GAS[v.gas].M;
      const vp = vMostProbable(v.temp, M);
      const vm = vMean(v.temp, M);
      const vr = vRms(v.temp, M);
      return `${GAS[v.gas].label} @ ${v.temp} K：最概然 ${Math.round(vp)} / 平均 ${Math.round(
        vm,
      )} / 方均根 ${Math.round(vr)} m/s，比值 1 : ${(vm / vp).toFixed(3)} : ${(
        vr / vp
      ).toFixed(3)}（解析值 1 : 1.128 : 1.225）；升温到 ${v.temp * 4} K 峰才会右移到 ${Math.round(
        vp * 2,
      )} m/s（√(2RT/M) 里的 T 翻 4 倍 → 速率只翻 2 倍），曲线同时摊平——曲线下面积恒为 1`;
    },
    render: renderMaxwell,
  },
  planck: {
    label: '黑体辐射谱',
    source: '1900 · M. Planck',
    hint: '把物体当理想黑体，只给它温度。实线是 Planck 谱，虚线是经典理论的 Rayleigh–Jeans——短波端它冲上天，那就是「紫外灾难」。',
    params: [
      {key: 'temp', label: '温度 T (K)', value: 5800, min: 2000, max: 12000, step: 100},
      {
        key: 'band',
        label: '波长窗口',
        value: 'wide',
        options: [
          {value: 'wide', label: '全谱（对数轴）'},
          {value: 'visible', label: '只看可见光'},
        ],
      },
      {
        key: 'rj',
        label: '经典对照',
        value: true,
        options: [
          {value: true, label: '画 Rayleigh–Jeans'},
          {value: false, label: '只看 Planck'},
        ],
      },
      {key: 'stroke', label: '线宽', value: 2.5, min: 1, max: 4, step: 0.5},
    ],
    info: (v) => {
      const lm = planckPeakLambda(v.temp);
      const total = SIGMA_SB * v.temp ** 4;
      return `T = ${v.temp} K：数值峰 λmax = ${fmtLambda(
        lm,
      )}，λmax·T = ${(lm * v.temp).toExponential(4)} m·K（维恩常数 b = ${WIEN_B.toExponential(
        4,
      )}，两者必须吻合）；总功率 σT⁴ = ${total.toExponential(
        3,
      )} W/m²——温度翻倍就 ×16；${
        lm > 7.5e-7
          ? '峰在红外，肉眼看不见它发光，只在"发热"'
          : lm < 3.8e-7
            ? '峰已进紫外，可见光只是它的长波尾巴'
            : '峰正落在可见光窗口内（这就是太阳）'
      }；灰带是 380–750 nm 的人眼响应区`;
    },
    render: renderPlanck,
  },
  tunnel: {
    label: '矩形势垒穿透',
    source: 'T = [1 + V₀²sinh²(κa)/4E(V₀−E)]⁻¹',
    hint: '粒子撞上宽 a、高 V₀ 的墙。横轴是它的能量：左半边（E<V₀）按牛顿力学必须全反射，量子力学却给了一个 nonzero 的透射。',
    params: [
      {key: 'V0', label: '势垒高 V₀ (eV)', value: 5, min: 0.5, max: 10, step: 0.5},
      {key: 'a', label: '势垒宽 a (nm)', value: 0.3, min: 0.05, max: 1.5, step: 0.05},
      {key: 'E', label: '当前能量 E (eV)', value: 3, min: 0.1, max: 20, step: 0.1},
      {
        key: 'marker',
        label: '能量游标',
        value: true,
        options: [
          {value: true, label: '画出 E 与 T(E)'},
          {value: false, label: '只看曲线'},
        ],
      },
      {key: 'stroke', label: '线宽', value: 2.5, min: 1, max: 4, step: 0.5},
    ],
    info: (v) => {
      const E = Math.min(v.E, 2 * v.V0);
      const t = tunnelT({E, V0: v.V0, a: v.a});
      const decay = tunnelDecayLength({E, V0: v.V0});
      const fmt = t < 0.001 ? t.toExponential(2) : `${(t * 100).toFixed(2)}%`;
      return `E=${E} eV、V₀=${v.V0} eV、a=${v.a} nm → T = ${fmt}。${
        E < v.V0
          ? `势垒内衰减长度 1/κ = ${decay.toFixed(3)} nm，垒厚是它的 ${(
              v.a / decay
            ).toFixed(1)} 倍——T 大致按 e^(−2κa) 掉，a 每多 0.1 nm 就掉一个量级，这是隧道二极管与扫描隧道显微镜的命门`
          : `E>V₀ 时曲线开始振荡（势垒里的驻波），${(() => {
              const w = tunnelResonantWidths({E, V0: v.V0}, 1)[0];
              return w ? `垒宽恰为共振宽度 ${w.toFixed(2)} nm 的整数倍时 T=1，一个不漏` : '';
            })()}`
      }`;
    },
    render: renderTunnel,
  },
};
