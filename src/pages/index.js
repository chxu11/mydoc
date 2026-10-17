import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Garden from '@site/src/components/Garden';

import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <p className={styles.kicker}>比较笨 · 一直学习</p>
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <button
            type="button"
            className="button button--secondary button--lg"
            onClick={() =>
              document.getElementById('garden')?.scrollIntoView({behavior: 'smooth'})
            }>
            进入苗圃
          </button>
          <Link
            className={clsx('button', 'button--lg', styles.heroGhost)}
            to="/map">
            知识地图
          </Link>
        </div>
        <p className={styles.poem}>直起腰来，我望见蓝色的大海和帆影。</p>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="胖头鱼学习网站 · 以花园的方式学编程，聚焦前端、Rust、Python 三条主线。">
      <HomepageHeader />
      <main>
        <Garden />
      </main>
    </Layout>
  );
}
