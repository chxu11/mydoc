import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import clsx from 'clsx';

import {H as DEFAULT_H, W as DEFAULT_W} from './geometry';
import styles from './styles.module.css';

/**
 * 参数化图形外壳：纹样（PatternLab）与数学（MathLab）共用。
 *
 * 一个 generator 的契约（纹样与数学各自的 generators.js 都要满足它）：
 *   {
 *     label, source, hint,            // 标题 / 出处徽章 / 一句话讲清母题
 *     params: [                       // range 滑杆，或带 options 的分段选择
 *       {key, label, value, min, max, step},
 *       {key, label, value, options: [{value, label}]},
 *     ],
 *     state?: {...},                  // 非滑杆的初始状态（如贝塞尔控制点）
 *     info(values) => string,         // 参数背后的数学（会随拖动更新）
 *     medium?: 'svg' | 'canvas',
 *     render(values, uid) => JSX,     // svg：画布内容（拖把手一类标 data-no-export）
 *     paint?(ctx, values, view),      // canvas：直接绘制
 *     view?: {w, h},                  // 覆盖默认 480×320
 *     hitTest?(point, values),        // svg：命中哪个可拖把手
 *     onDrag?(handle, point, values) => patch,
 *     onPoint?(point, values) => patch, // canvas：点/拖画布改参数
 *   }
 *
 * 交互：滑杆实时重画 → 「随机」试参数 → 导出 SVG（canvas 类导出 PNG）。
 * 带 data-no-export 的节点（拖把手 / 辅助线）不会进入导出文件。
 */
function defaultsOf(pattern) {
  const d = {...(pattern.state ?? {})};
  for (const p of pattern.params) {
    d[p.key] = p.value;
  }
  return d;
}

function randomValues(pattern) {
  const next = {};
  for (const p of pattern.params) {
    if (p.options) {
      const pick = p.options[Math.floor(Math.random() * p.options.length)];
      next[p.key] = pick.value;
      continue;
    }
    const steps = Math.round((p.max - p.min) / p.step);
    next[p.key] = Math.round((p.min + p.step * Math.round(Math.random() * steps)) * 100) / 100;
  }
  return next;
}

export default function ParamLab({registry, kind, title, children}) {
  const pattern = registry[kind] ?? registry[Object.keys(registry)[0]];
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const view = useMemo(
    () => pattern.view ?? {w: DEFAULT_W, h: DEFAULT_H},
    [pattern],
  );
  const isCanvas = pattern.medium === 'canvas';
  const svgRef = useRef(null);
  const canvasRef = useRef(null);
  const dragRef = useRef(null);

  const defaults = useMemo(() => defaultsOf(pattern), [pattern]);
  const [values, setValues] = useState(defaults);

  const patch = (next) => setValues((prev) => ({...prev, ...next}));
  const setValue = (key, value) => patch({[key]: value});
  const reset = () => setValues(defaults);
  const shuffle = () => patch(randomValues(pattern));

  /** 屏幕坐标 → viewBox 用户坐标（按元素实际渲染宽度等比换算） */
  const toUser = (e, el) => {
    if (!el) return {x: 0, y: 0};
    const rect = el.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * view.w,
      y: ((e.clientY - rect.top) / rect.height) * view.h,
    };
  };

  /* ---- svg 介质：拖把手（贝塞尔控制点一类） ---- */
  const onPointerDown = (e) => {
    if (!pattern.onDrag || !pattern.hitTest) return;
    const handle = pattern.hitTest(toUser(e, svgRef.current), values);
    if (!handle) return;
    dragRef.current = handle;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    patch(pattern.onDrag(handle, toUser(e, svgRef.current), values));
  };
  const onPointerMove = (e) => {
    if (!pattern.onDrag || !dragRef.current) return;
    patch(pattern.onDrag(dragRef.current, toUser(e, svgRef.current), values));
  };
  const endDrag = () => {
    dragRef.current = null;
  };

  /* ---- canvas 介质：参数一变就重画（合并到一帧，滑杆连拖不卡） ---- */
  useEffect(() => {
    if (!isCanvas) return;
    const cv = canvasRef.current;
    if (!cv) return;
    const raf = requestAnimationFrame(() => {
      const ctx = cv.getContext('2d');
      if (ctx) pattern.paint(ctx, values, view);
    });
    return () => cancelAnimationFrame(raf);
  }, [isCanvas, pattern, values, view]);

  const onCanvasPoint = (e) => {
    if (!pattern.onPoint) return;
    const cv = canvasRef.current;
    if (!cv) return;
    const rect = cv.getBoundingClientRect();
    const next = pattern.onPoint(
      {
        u: (e.clientX - rect.left) / rect.width,
        v: (e.clientY - rect.top) / rect.height,
      },
      values,
    );
    if (next) patch(next);
  };

  const download = () => {
    if (isCanvas) {
      const cv = canvasRef.current;
      if (!cv) return;
      cv.toBlob((blob) => {
        if (!blob) return;
        triggerDownload(URL.createObjectURL(blob), `${kind}.png`);
      }, 'image/png');
      return;
    }
    const svg = svgRef.current;
    if (!svg) return;
    const clone = svg.cloneNode(true);
    // 拖把手、作图辅助线只是交互用的，不该混进成品图
    clone.querySelectorAll('[data-no-export]').forEach((el) => el.remove());
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', String(view.w));
    clone.setAttribute('height', String(view.h));
    // CSS module 的样式带不出去，把颜色落到行内，导出的文件才是可见的黑线；
    // --lab-canvas-bg 也必须一并写进去：青海波的扇面底、绳带的 halo 靠它遮下层，
    // 不落在导出文件里就会退成兼容的浅灰，白底上变成一片灰补丁
    clone.setAttribute(
      'style',
      'color:#1c1e21;background:#fff;--lab-canvas-bg:#fff',
    );
    const text = new XMLSerializer().serializeToString(clone);
    triggerDownload(
      URL.createObjectURL(new Blob([text], {type: 'image/svg+xml;charset=utf-8'})),
      `${kind}.svg`,
    );
  };

  return (
    <section className={styles.lab} aria-label={`${pattern.label}参数化生成器`}>
      <header className={styles.head}>
        <div>
          <h3 className={styles.title}>{title ?? `${pattern.label} · 参数化生成`}</h3>
          <p className={styles.hint}>{pattern.hint}</p>
        </div>
        {pattern.source ? <span className={styles.source}>{pattern.source}</span> : null}
      </header>

      <div className={styles.body}>
        <div className={styles.controls}>
          {pattern.params.map((p) => (
            <div key={p.key} className={styles.control}>
              <span className={styles.controlLabel}>
                {p.label}
                {p.options ? null : <b className={styles.value}>{values[p.key]}</b>}
              </span>
              {p.options ? (
                <span className={styles.seg} role="group" aria-label={p.label}>
                  {p.options.map((opt) => (
                    <button
                      key={String(opt.value)}
                      type="button"
                      className={clsx(styles.segItem, values[p.key] === opt.value && styles.segOn)}
                      aria-pressed={values[p.key] === opt.value}
                      onClick={() => setValue(p.key, opt.value)}>
                      {opt.label}
                    </button>
                  ))}
                </span>
              ) : (
                <input
                  type="range"
                  min={p.min}
                  max={p.max}
                  step={p.step}
                  value={values[p.key]}
                  onChange={(e) => setValue(p.key, Number(e.target.value))}
                  aria-label={p.label}
                />
              )}
            </div>
          ))}

          <div className={styles.actions}>
            <button type="button" className={styles.button} onClick={shuffle}>
              随机
            </button>
            <button type="button" className={styles.button} onClick={reset}>
              重置
            </button>
            <button
              type="button"
              className={clsx(styles.button, styles.primary)}
              onClick={download}>
              {isCanvas ? '下载 PNG' : '下载 SVG'}
            </button>
          </div>

          <p className={styles.info}>{pattern.info(values)}</p>
        </div>

        <figure className={styles.canvasWrap}>
          {isCanvas ? (
            <canvas
              ref={canvasRef}
              className={styles.painting}
              width={view.w}
              height={view.h}
              role="img"
              aria-label={`${pattern.label}，由当前参数生成`}
              onPointerDown={pattern.onPoint ? onCanvasPoint : undefined}
              onPointerMove={(e) => {
                if (e.buttons === 1) onCanvasPoint(e);
              }}
            />
          ) : (
            <svg
              ref={svgRef}
              className={clsx(
                styles.canvas,
                (pattern.onDrag || pattern.onPoint) && styles.canvasInteractive,
              )}
              viewBox={`0 0 ${view.w} ${view.h}`}
              role="img"
              aria-label={`${pattern.label}，由当前参数生成`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}>
              <title>{`${pattern.label}（参数化生成）`}</title>
              {pattern.render(values, uid)}
            </svg>
          )}
        </figure>
      </div>

      {children ? <div className={styles.note}>{children}</div> : null}
    </section>
  );
}

function triggerDownload(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
