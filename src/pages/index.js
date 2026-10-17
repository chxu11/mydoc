import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import {tracks} from '@site/src/data/tracks';
import {useProgress} from '@site/src/hooks/useProgress';
import styles from './index.module.css';

/* 六大栏目，彼此并列 */
const COLUMNS = [
  {emoji: '💻', name: '编程', to: '/docs/0', meta: '前端 · Rust · Python · Java'},
  {emoji: '🎨', name: '纹样', to: '/docs/patterns/1', meta: '6 篇 · 世界经典图案'},
  {emoji: '📐', name: '数学', to: '/docs/math/1', meta: '11 篇 · 经典证明与可视化'},
  {emoji: '🔭', name: '物理', to: '/docs/physics/1', meta: '2 篇 · 从牛顿到波'},
  {emoji: '🎓', name: '教育', to: '/docs/education/1', meta: '2 篇 · 学习方法与记忆'},
  {emoji: '📖', name: '诗歌文章', to: '/docs/poetry/1', meta: '7 篇 · 唐宋诗词与散文'},
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
