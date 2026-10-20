import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import {tracks, countOf} from '@site/src/data/tracks';
import {columns} from '@site/src/data/columns.cjs';
import {useProgress} from '@site/src/hooks/useProgress';
import styles from './index.module.css';

/* 六大栏目，彼此并列：入口与文案来自 columns.cjs，篇数由 tracks.js 派生 */
const COLUMNS = [
  {emoji: '💻', name: '编程', to: '/docs/0', meta: '前端 · Rust · Python · Java'},
  ...columns
    .filter((c) => c.cardHint)
    .map((c) => ({
      emoji: c.emoji,
      name: c.name,
      to: c.to,
      meta: `${countOf(c.id)} 篇 · ${c.cardHint}`,
    })),
];

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  const done = useProgress();
  const codeTracks = tracks.filter((t) => t.kind === 'code');
  const total = codeTracks.reduce((n, t) => n + t.stations.length, 0);
  const read = codeTracks.reduce(
    (n, t) => n + t.stations.filter((s) => done.has(`${t.id}/${s.pos}`)).length,
    0,
  );

  return (
    <Layout
      title={siteConfig.title}
      description="跨学科学习目录：编程 / 纹样 / 数学 / 物理 / 教育 / 诗歌文章"
      noFooter>
      <div className={styles.page}>
        <div className={styles.grid}>
          {COLUMNS.map((c) => (
            <Link key={c.name} to={c.to} className={styles.card}>
              <span className={styles.cardEmoji} aria-hidden="true">
                {c.emoji}
              </span>
              <span className={styles.cardName}>{c.name}</span>
              <span className={styles.cardMeta}>
                {c.meta}
                {c.name === '编程' && read > 0 ? ` · 已读 ${read}/${total}` : ''}
              </span>
            </Link>
          ))}
        </div>

        <hr className={styles.rule} />

        <p className={styles.motto}>
          绵绵用力，久久为功
          <br />
          人生缓缓，徐徐图之
        </p>

        <p className={styles.signature}>比较笨，一直学习。</p>

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
