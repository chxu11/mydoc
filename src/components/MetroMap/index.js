import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {tracks} from '@site/src/data/tracks';
import {useProgress} from '@site/src/hooks/useProgress';

import styles from './styles.module.css';

/* 布局参数：每条线一行，编程线与知识线之间留出分组间隔 */
const START_X = 150;
const GAP = 82;
const RADIUS = 9;
const LINE_SPACING = 82;
const GROUP_GAP = 46;
const FIRST_Y = 60;
const labelY = (y) => y + 27;

/** 依据轨道顺序计算每条线的 y 坐标，编程组与知识组之间加一段间隔。 */
function layoutLines(items) {
  const ys = {};
  let y = FIRST_Y;
  let prevKind = items[0]?.kind;
  for (const t of items) {
    if (t.kind !== prevKind) {
      y += GROUP_GAP;
      prevKind = t.kind;
    }
    ys[t.id] = y;
    y += LINE_SPACING;
  }
  return {ys, bottom: y - LINE_SPACING + 40};
}

export default function MetroMap() {
  const done = useProgress();
  const base = useBaseUrl('/');
  // 站点配置了 trailingSlash: true，而这里的 <a> 是手写 SVG 链接、不走 Docusaurus 的 <Link>，
  // 不会自动补尾斜杠。静态网关对「目录/index.html」不会补斜杠，缺斜杠即 404，故在此归一化。
  const stationHref = (to) => `${base}${String(to).replace(/^\//, '').replace(/\/$/, '')}/`;

  const ordered = [...tracks].sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'code' ? -1 : 1));
  const {ys, bottom} = layoutLines(ordered);

  const maxStations = Math.max(...tracks.map((t) => t.stations.length));
  const width = START_X + GAP * (maxStations - 1) + 120;

  const codeTracks = tracks.filter((t) => t.kind === 'code');
  const codeTop = Math.min(...codeTracks.map((t) => ys[t.id]));
  const codeBottom = Math.max(...codeTracks.map((t) => ys[t.id]));
  const transferX = [START_X, START_X + GAP];

  return (
    <div className={styles.wrap}>
      <svg
        viewBox={`0 0 ${width} ${bottom}`}
        className={styles.svg}
        role="img"
        aria-label="各学习主线构成的知识地铁图，圆圈为教程站点，可点击进入">
        {/* 换乘连线：介绍 / 环境 为三条编程线共有的入门站 */}
        {transferX.map((x) => (
          <line
            key={x}
            x1={x}
            y1={codeTop}
            x2={x}
            y2={codeBottom}
            className={styles.transfer}
          />
        ))}

        {tracks.map((track) => {
          const y = ys[track.id];
          const lastX = START_X + GAP * (track.stations.length - 1);
          return (
            <g key={track.id}>
              {/* 线路主线 */}
              <line
                x1={START_X - 30}
                y1={y}
                x2={lastX}
                y2={y}
                stroke={track.color}
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.28"
              />
              {/* 线路名 */}
              <text x="14" y={y + 5} className={styles.lineName} fill={track.color}>
                {track.name}
              </text>

              {track.stations.map((s, i) => {
                const x = START_X + GAP * i;
                const visited = done.has(`${track.id}/${s.pos}`);
                return (
                  <a
                    key={s.pos}
                    href={stationHref(s.to)}
                    className={styles.station}>
                    <circle
                      cx={x}
                      cy={y}
                      r={RADIUS}
                      fill={visited ? track.color : 'var(--ifm-background-surface-color)'}
                      stroke={track.color}
                      strokeWidth="3"
                    />
                    <text x={x} y={labelY(y)} className={styles.stationLabel} textAnchor="middle">
                      {s.short}
                    </text>
                    <title>{s.title}</title>
                  </a>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
