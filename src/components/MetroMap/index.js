import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {tracks} from '@site/src/data/tracks';
import {useProgress} from '@site/src/hooks/useProgress';

import styles from './styles.module.css';

/* 地铁图坐标布局：三条水平线，前两站纵向对齐作为「换乘」 */
const LINE_Y = {react: 80, rust: 230, python: 380};
const START_X = 180;
const GAP = 88;
const RADIUS = 10;
const labelY = (y) => y + 30;

export default function MetroMap() {
  const done = useProgress();
  const base = useBaseUrl('/');
  const maxStations = Math.max(...tracks.map((t) => t.stations.length));
  const width = START_X + GAP * (maxStations - 1) + 120;
  const height = 450;

  const transferX = [START_X, START_X + GAP];

  return (
    <div className={styles.wrap}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={styles.svg}
        role="img"
        aria-label="三条学习主线构成的知识地铁图，圆圈为教程站点，可点击进入">
        {/* 换乘连线：介绍 / 环境 三条线共有 */}
        {transferX.map((x) => (
          <line
            key={x}
            x1={x}
            y1={LINE_Y.react}
            x2={x}
            y2={LINE_Y.python}
            className={styles.transfer}
          />
        ))}

        {tracks.map((track) => {
          const y = LINE_Y[track.id];
          const lastX = START_X + GAP * (track.stations.length - 1);
          return (
            <g key={track.id}>
              {/* 线路主线 */}
              <line
                x1={START_X - 34}
                y1={y}
                x2={lastX}
                y2={y}
                stroke={track.color}
                strokeWidth="7"
                strokeLinecap="round"
                opacity="0.28"
              />
              {/* 线路名 */}
              <text x="18" y={y + 6} className={styles.lineName} fill={track.color}>
                {track.name}
              </text>

              {track.stations.map((s, i) => {
                const x = START_X + GAP * i;
                const visited = done.has(`${track.id}/${s.pos}`);
                return (
                  <a
                    key={s.pos}
                    href={`${base}${s.to.replace(/^\//, '')}`}
                    className={styles.station}>
                    <circle
                      cx={x}
                      cy={y}
                      r={RADIUS}
                      fill={visited ? track.color : 'var(--ifm-background-surface-color)'}
                      stroke={track.color}
                      strokeWidth="3.5"
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
