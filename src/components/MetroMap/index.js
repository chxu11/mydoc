import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {tracks} from '@site/src/data/tracks';
import {conceptById} from '@site/src/data/concepts';
import {useProgress} from '@site/src/hooks/useProgress';

import styles from './styles.module.css';

/* 布局参数：编程组在上，各栏目线在下；组内行距紧凑，组间留白加大 */
const START_X = 150;
const GAP = 82;
const RADIUS = 9;
const LINE_SPACING = 84;
const GROUP_GAP = 48;
const HEADER_OFFSET = 46; // 组标题基线高出首条线多少
const SUB_INDENT = 38; // 二级线路名的左缩进
const GUIDE_X = 21; // 组引导线
const FIRST_Y = 96;
// 站名基线：留出 32 单位，给换乘站的虚线圈（r = RADIUS + 4）留呼吸空间
const labelY = (y) => y + 32;

/** 依据轨道顺序计算每条线的 y 坐标，编程组与栏目组之间加一段间隔。 */
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
  return {ys, bottom: y - LINE_SPACING + 44};
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
  const codeYs = codeTracks.map((t) => ys[t.id]).sort((a, b) => a - b);
  const codeTop = codeYs[0];
  const codeBottom = codeYs[codeYs.length - 1];
  const transferX = [START_X, START_X + GAP];

  return (
    <div className={styles.wrap}>
      <svg
        viewBox={`0 0 ${width} ${bottom}`}
        className={styles.svg}
        role="img"
        aria-label="各学习主线构成的知识地铁图，圆圈为教程站点，可点击进入">
        {/* 换乘连线：介绍 / 环境 为四条编程线共有的入门站。
            只画在两行之间的空白段，否则竖线会从站点名中间穿过去 */}
        {codeYs.slice(0, -1).map((y, i) =>
          transferX.map((x) => (
            <line
              key={`${x}-${y}`}
              x1={x}
              y1={y + 40}
              x2={x}
              y2={codeYs[i + 1] - 14}
              className={styles.transfer}
            />
          )),
        )}

        {/* 「编程」组：标题 + 左侧引导线，下挂四条语言线（字号字重降一档并右缩进） */}
        {codeTracks.length > 1 && (
          <g>
            <text x="14" y={codeTop - HEADER_OFFSET} className={styles.groupName}>
              编程
            </text>
            <line
              x1={GUIDE_X}
              y1={codeTop - HEADER_OFFSET + 12}
              x2={GUIDE_X}
              y2={codeBottom}
              className={styles.groupGuide}
            />
          </g>
        )}

        {tracks.map((track) => {
          const y = ys[track.id];
          const isSub = track.kind === 'code' && codeTracks.length > 1;
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
              {/* 线路名：一级带栏目标题的字号，编程子线降一档并缩进 */}
              <text
                x={isSub ? SUB_INDENT : 14}
                y={y + (isSub ? 6 : 7)}
                className={isSub ? styles.lineNameSub : styles.lineName}
                fill={track.color}>
                {track.name}
              </text>

              {track.stations.map((s, i) => {
                const x = START_X + GAP * i;
                const visited = done.has(`${track.id}/${s.pos}`);
                // 换乘站：被一个或多个概念认领的站点，用虚线圈标出
                const hubs = (s.concepts ?? [])
                  .map((id) => conceptById[id]?.label)
                  .filter(Boolean);
                return (
                  <a
                    key={s.pos}
                    href={stationHref(s.to)}
                    className={styles.station}>
                    {hubs.length > 0 && (
                      <circle cx={x} cy={y} r={RADIUS + 4} className={styles.hub} />
                    )}
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
                    <title>
                      {hubs.length ? `${s.title}（换乘：${hubs.join('、')}）` : s.title}
                    </title>
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
