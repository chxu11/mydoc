/**
 * 参数化图形的公共几何工具（纹样 / 数学共用）。
 *
 * 统一约定：
 *   · 画布固定 480×320（3:2），所有坐标都在这个 viewBox 内；
 *   · 只用 currentColor 描边、fill=none → 跟随明暗主题，导出的 SVG 也是黑线；
 *   · 需要「遮住下层」的地方（压挑断口、浪的扇面底）一律用 CANVAS_BG，
 *     它的值由外壳挂在画布容器上（--lab-canvas-bg），必须与画布底色一致。
 */

export const W = 480;
export const H = 320;

/** 坐标取两位小数：导出的 SVG 更干净 */
export const n = (v) => Math.round(v * 100) / 100;

export const CANVAS_BG = 'var(--lab-canvas-bg, #f6f7f8)';

/** 折线 → path。corner > 0 时把每个拐角换成二次贝塞尔圆角，
 *  同一个点集既能画方折的「雷」（corner=0），也能画卷曲的「云」（corner>0）。 */
export function polylinePath(points, corner = 0) {
  if (points.length === 0) return '';
  let d = `M ${n(points[0].x)} ${n(points[0].y)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const v1 = {x: p0.x - p1.x, y: p0.y - p1.y};
    const v2 = {x: p2.x - p1.x, y: p2.y - p1.y};
    const l1 = Math.hypot(v1.x, v1.y);
    const l2 = Math.hypot(v2.x, v2.y);
    const r = Math.min(corner, l1 / 2, l2 / 2);
    if (r < 0.5) {
      d += ` L ${n(p1.x)} ${n(p1.y)}`;
      continue;
    }
    const a = {x: p1.x + (v1.x / l1) * r, y: p1.y + (v1.y / l1) * r};
    const b = {x: p1.x + (v2.x / l2) * r, y: p1.y + (v2.y / l2) * r};
    d += ` L ${n(a.x)} ${n(a.y)} Q ${n(p1.x)} ${n(p1.y)} ${n(b.x)} ${n(b.y)}`;
  }
  const last = points[points.length - 1];
  return `${d} L ${n(last.x)} ${n(last.y)}`;
}

/** 折线的外接框，用于把图形挪回画布中央 */
export function bbox(points) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  return {
    x0: Math.min(...xs),
    x1: Math.max(...xs),
    y0: Math.min(...ys),
    y1: Math.max(...ys),
  };
}

/** 把点集平移缩放后铺满画布（留 margin 边距），返回 [变换函数, 说明] */
export function fitToCanvas(points, margin = 30) {
  const box = bbox(points);
  const bw = box.x1 - box.x0 || 1;
  const bh = box.y1 - box.y0 || 1;
  const k = Math.min((W - margin * 2) / bw, (H - margin * 2) / bh);
  const ox = W / 2 - (box.x0 + box.x1) / 2 * k;
  const oy = H / 2 - (box.y0 + box.y1) / 2 * k;
  return (p) => ({x: p.x * k + ox, y: p.y * k + oy});
}

export const strokeProps = (stroke, extra = {}) => ({
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: stroke,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  ...extra,
});

/** 同一条线先铺一道底色描边：后画的带子靠它把下层「顶开」，压挑才看得出来 */
export const haloProps = (stroke) => ({
  fill: 'none',
  style: {stroke: CANVAS_BG},
  strokeWidth: stroke + 3.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
});

/** 最大公约数：决定星形能不能一笔连完，也决定叶序/密铺的周期性 */
export function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}
