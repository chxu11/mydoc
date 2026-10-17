import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import {tracks} from '@site/src/data/tracks';
import {useProgress} from '@site/src/hooks/useProgress';

import styles from './styles.module.css';

function Sprout({bloom, color}) {
  return (
    <svg viewBox="0 0 48 60" className={styles.sprout} aria-hidden="true">
      {/* 土壤 */}
      <ellipse cx="24" cy="55" rx="16" ry="4" fill="currentColor" opacity="0.18" />
      {/* 茎 */}
      <path
        d={bloom ? 'M24 55 C24 40, 24 26, 24 16' : 'M24 55 C24 48, 24 45, 24 40'}
        stroke={color}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      {bloom ? (
        <>
          {/* 叶片 */}
          <path d="M24 40 C13 37, 11 29, 18 30 C23 30.5, 24 35, 24 40Z" fill={color} opacity="0.8" />
          <path d="M24 34 C35 31, 37 23, 30 24 C25 24.5, 24 29, 24 34Z" fill={color} opacity="0.8" />
          {/* 花 */}
          <circle cx="24" cy="14" r="6.5" fill={color} />
          <circle cx="24" cy="14" r="2.5" fill="#fff" opacity="0.65" />
        </>
      ) : (
        /* 嫩芽 */
        <path
          d="M24 40 C18 38, 17 33, 21 34"
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

function Bed({track, done}) {
  const total = track.stations.length;
  const readCount = track.stations.filter((s) => done.has(`${track.id}/${s.pos}`)).length;
  const ratio = total === 0 ? 0 : readCount / total;

  return (
    <div className={styles.bed} style={{'--track-color': track.color}}>
      <div className={styles.bedHead}>
        <span className={styles.bedName}>
          <span className={styles.bedEmoji} aria-hidden="true">{track.emoji}</span>
          {track.name}
        </span>
        <span className={styles.bedProgress}>
          {readCount}/{total}
        </span>
      </div>

      <div className={styles.soil}>
        <div className={styles.plants}>
          {track.stations.map((s) => {
            const isRead = done.has(`${track.id}/${s.pos}`);
            return (
              <Link
                key={s.pos}
                to={s.to}
                title={s.title}
                className={clsx(styles.plant, isRead && styles.plantRead)}>
                <Sprout bloom={isRead} color={track.color} />
                <span className={styles.plantLabel}>{s.short}</span>
              </Link>
            );
          })}
        </div>
        <div className={styles.growthBar} aria-hidden="true">
          <span className={styles.growthFill} style={{width: `${ratio * 100}%`}} />
        </div>
      </div>
    </div>
  );
}

export default function Garden() {
  const done = useProgress();

  return (
    <section id="garden" className={styles.garden}>
      <div className="container">
        <Heading as="h2" className={styles.title}>
          我的苗圃
        </Heading>
        <p className={styles.subtitle}>
          三条主线，每篇教程是一株植物。读过的会开花 🌸 —— 点一下就走进去。
        </p>
        <div className={styles.beds}>
          {tracks.map((track) => (
            <Bed key={track.id} track={track} done={done} />
          ))}
        </div>
      </div>
    </section>
  );
}
