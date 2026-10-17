import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import {tracks} from '@site/src/data/tracks';
import {useProgress} from '@site/src/hooks/useProgress';
import styles from './index.module.css';

function Track({track, done}) {
  const read = track.stations.filter((s) => done.has(`${track.id}/${s.pos}`)).length;
  return (
    <section className={styles.track}>
      <h2 className={styles.trackHead}>
        <span className={styles.trackDot} style={{background: track.color}} aria-hidden="true" />
        <span className={styles.trackName}>{track.name}</span>
        <span className={styles.trackCount}>
          {read}/{track.stations.length}
        </span>
      </h2>
      <ul className={styles.list}>
        {track.stations.map((s) => {
          const isRead = done.has(`${track.id}/${s.pos}`);
          return (
            <li key={s.pos}>
              <Link to={s.to} className={clsx(styles.item, isRead && styles.itemRead)}>
                {s.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  const done = useProgress();

  return (
    <Layout
      title={siteConfig.title}
      description="学者 · 编程教程目录：前端 8 篇 · Rust 4 篇 · Python 4 篇"
      noFooter>
      <div className={styles.page}>
        <header className={styles.mast}>
          <Heading as="h1" className={styles.name}>
            学者
          </Heading>
          <p className={styles.motto}>比较笨，一直学习。</p>
        </header>

        <hr className={styles.rule} />

        <div className={styles.catalog}>
          {tracks.map((t) => (
            <Track key={t.id} track={t} done={done} />
          ))}
        </div>

        <hr className={styles.rule} />

        <nav className={styles.foot} aria-label="站点次要导航">
          <Link to="/about">关于</Link>
          <span className={styles.sep} aria-hidden="true">
            ·
          </span>
          <Link to="/map">知识地图</Link>
          <span className={styles.sep} aria-hidden="true">
            ·
          </span>
          <a href="https://github.com/chxu11/mydoc" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </nav>
      </div>
    </Layout>
  );
}
