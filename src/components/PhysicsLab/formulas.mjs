/**
 * 物理实验室的公式层（纯函数，不含 JSX）。
 *
 * 为什么单独一个文件：渲染器（generators.js 带 JSX，webpack 才吃得下）与
 * scripts/check-lab.mjs（node 直接 import）必须共用同一份公式实现。
 * 校验脚本不重复推导公式，而是拿**独立可验证的解析性质**去撞它：
 *   · ζ = 0 的解必须恒等于 cos(ωt)（不衰减、不过零错位）；
 *   · ζ ≥ 1 的解全程不得越过 0（非欠阻尼不振荡）；
 *   · 速率分布的数值峰值必须落在 √(2RT/M)，且 ∫f dv = 1；
 *   · 黑体辐射的数值峰必须给出维恩常数 b = 2.897771955e-3 m·K，
 *     总功率比必须等于 (T₂/T₁)⁴，长波极限必须回到 Rayleigh–Jeans 的 2ckT/λ⁴；
 *   · 势垒在 V₀ = 0、a → 0、k′a = nπ 三种情况下透射系数必须 = 1。
 * 单位错、少一项、符号写反，都会在这里被撞出来——Koch 那次就是因为
 * 只核对了公式、没核对产物，才让「周长比恒为 1 的雪花」混了过去。
 *
 * 常数取 CODATA 2018 定义值。
 */

/* ---------------- 常数 ---------------- */

export const PLANCK = 6.62607015e-34; // J·s
export const H_BAR = 1.054571817e-34; // J·s
export const C_LIGHT = 2.99792458e8; // m/s
export const K_B = 1.380649e-23; // J/K
export const R_GAS = 8.314462618; // J·mol⁻¹·K⁻¹
export const WIEN_B = 2.897771955e-3; // m·K
export const SIGMA_SB = 5.670374419e-8; // W·m⁻²·K⁻⁴
/** ħ² / (2mₑ) = 0.0381 eV·nm²，把电子的 k² 直接写成 (E[eV])/G */
export const G_EVNM2 = 0.0380998212;

/* ---------------- 1. 阻尼振动 ---------------- */

/**
 * m x″ + c x′ + k x = 0，写成 x″ + 2ζω₀ x′ + ω₀² x = 0。
 * 初值 x(0) = 1、x′(0) = 0（拉起一格松手）。
 */
export function oscX(t, {zeta, omega}) {
  if (zeta < 1 - 1e-9) {
    const wd = omega * Math.sqrt(1 - zeta * zeta);
    return (
      Math.exp(-zeta * omega * t) *
      (Math.cos(wd * t) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(wd * t))
    );
  }
  if (zeta <= 1 + 1e-9) {
    // 临界阻尼：最快回到零且不越过
    return (1 + omega * t) * Math.exp(-omega * t);
  }
  const s = omega * Math.sqrt(zeta * zeta - 1);
  return (
    Math.exp(-zeta * omega * t) *
    (Math.cosh(s * t) + (zeta / Math.sqrt(zeta * zeta - 1)) * Math.sinh(s * t))
  );
}

/** 欠阻尼时的振荡角频率（ζ ≥ 1 时没有频率可言，返回 0） */
export function oscDampedOmega({zeta, omega}) {
  return zeta < 1 ? omega * Math.sqrt(1 - zeta * zeta) : 0;
}

/** 包络降到一半所需时间：ζ = 0 时无穷大（不衰） */
export function oscHalfLife({zeta, omega}) {
  return zeta <= 0 ? Infinity : Math.LN2 / (zeta * omega);
}

/** 品质因数 Q = 1/(2ζ)；ζ ≥ 1/√2 时已经谈不上「共振尖锐」 */
export function oscQ({zeta}) {
  return zeta <= 0 ? Infinity : 1 / (2 * zeta);
}

export function oscRegime(zeta) {
  if (zeta < 1e-9) return '无阻尼：等幅振荡，能量守恒';
  if (zeta < 1) return '欠阻尼：振幅按 e^(−ζω₀t) 衰减，还会来回穿越零点';
  if (zeta <= 1 + 1e-9) return '临界阻尼：不越过零点、回得最快';
  return '过阻尼：像被蜜粘住，慢慢滑回零，永远不越过';
}

/* ---------------- 2. 拍频 ---------------- */

/** 两个同幅度简谐叠加（t = 0 时两者都为零，所以合成也为零） */
export function beatY(t, f1, f2) {
  return Math.sin(2 * Math.PI * f1 * t) + Math.sin(2 * Math.PI * f2 * t);
}

/** 叠加后的包络：|2cos(π(f₁−f₂)t)|，拍频就是 Δf 而不是 2Δf */
export function beatEnvelope(t, f1, f2) {
  return Math.abs(2 * Math.cos(Math.PI * (f1 - f2) * t));
}

export const beatFreq = (f1, f2) => Math.abs(f1 - f2);

/* ---------------- 3. 麦克斯韦速率分布 ---------------- */

/** 最概然速率 √(2RT/M)：分布曲线的峰就在此处 */
export const vMostProbable = (T, M) => Math.sqrt((2 * R_GAS * T) / M);
/** 方均根速率 √(3RT/M)：对应平均动能 ½m⟨v²⟩ = 3/2 kT */
export const vRms = (T, M) => Math.sqrt((3 * R_GAS * T) / M);
/** 平均速率 √(8RT/πM)，比最概然速率大约 13% */
export const vMean = (T, M) => Math.sqrt((8 * R_GAS * T) / (Math.PI * M));

/**
 * 速率分布 f(v)（归一化：∫₀^∞ f dv = 1）。
 * M 用 kg/mol，例如 N₂ = 0.028。
 */
export function maxwellF(v, T, M) {
  const a = M / (2 * R_GAS * T);
  return 4 * Math.PI * Math.pow(a / Math.PI, 1.5) * v * v * Math.exp(-a * v * v);
}

/* ---------------- 4. 黑体辐射 ---------------- */

/**
 * Planck 谱辐射出度 B(λ,T)，λ 用米。
 * 短波（hc ≫ λkT）指数项把一切压死 → 不会「紫外灾难」；
 * 长波展开 eˣ−1 ≈ x，回到 Rayleigh–Jeans 的 2ckT/λ⁴。
 */
export function planckB(lambda, T) {
  const c1 = 2 * PLANCK * C_LIGHT * C_LIGHT;
  const c2 = (PLANCK * C_LIGHT) / K_B;
  const x = c2 / (lambda * T);
  return c1 / Math.pow(lambda, 5) / (Math.exp(x) - 1);
}

/** 对数扫描求数值峰值波长（不直接用维恩常数，才能拿它来对照） */
export function planckPeakLambda(T) {
  let lo = 5e-8;
  let hi = 5e-2;
  for (let i = 0; i < 400; i++) {
    const m1 = lo * (hi / lo) ** (1 / 3);
    const m2 = lo * (hi / lo) ** (2 / 3);
    if (planckB(m1, T) < planckB(m2, T)) lo = m1;
    else hi = m2;
  }
  return (lo + hi) / 2;
}

/** 长波近似（Rayleigh–Jeans），用来撞 Planck 实现是否正确 */
export const rayleighJeans = (lambda, T) =>
  (2 * C_LIGHT * K_B * T) / Math.pow(lambda, 4);

/* ---------------- 5. 矩形势垒隧穿 ---------------- */

/**
 * 宽 a、高 V₀ 的矩形势垒，电子能量 E（都用 eV / nm）。
 * E < V₀：κ = √((V₀−E)/G)， sinh 项；
 * E > V₀：k′ = √((E−V₀)/G)， sin 项 —— 同一个式子解析延拓；
 * E = V₀：极限给出 T = [1 + V₀a²/(4G)]⁻¹。
 */
export function tunnelT({E, V0, a}) {
  if (E <= 0) return 0;
  if (V0 <= 0 || a <= 0) return 1;
  const d = E - V0;
  if (Math.abs(d) < 1e-12) return 1 / (1 + (V0 * a * a) / (4 * G_EVNM2));
  if (d < 0) {
    const kappa = Math.sqrt(-d / G_EVNM2);
    const s = Math.sinh(kappa * a);
    return 1 / (1 + (V0 * V0 * s * s) / (4 * E * -d));
  }
  const kp = Math.sqrt(d / G_EVNM2);
  const s = Math.sin(kp * a);
  return 1 / (1 + (V0 * V0 * s * s) / (4 * E * d));
}

/** 势垒内的衰减长度 1/κ（nm）：E ≥ V₀ 时不存在衰减，返回 0 */
export const tunnelDecayLength = ({E, V0}) =>
  E < V0 ? 1 / Math.sqrt((V0 - E) / G_EVNM2) : 0;

/** E > V₀ 时的共振宽度：k′a = nπ → T = 1，一个不漏 */
export const tunnelResonantWidths = ({E, V0}, maxN = 4) => {
  if (E <= V0) return [];
  const kp = Math.sqrt((E - V0) / G_EVNM2);
  return Array.from({length: maxN}, (_, i) => ((i + 1) * Math.PI) / kp);
};
