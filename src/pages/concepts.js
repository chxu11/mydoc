import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import {concepts} from '@site/src/data/concepts';

import styles from './concepts.module.css';

/**
 * 概念坐标：把「换乘枢纽」摊开成一页。
 * 数据全部来自 frontmatter 的 concepts 字段（gen-tracks 生成 concepts.json），
 * 新增/调整概念只需改内容与 src/data/concepts.cjs 词表，本页无需改动。
 */
export default function ConceptsPage() {
  // 概念锚点是 JSX 手写的（不经过 Markdown 标题），需显式登记，
  // 否则构建期的断链检查会把文档页里的 /concepts#<id> 判为断锚点
  const brokenLinks = useBrokenLinks();
  concepts.forEach((c) => brokenLinks.collectAnchor(c.id));

  return (
    <Layout
      title="概念坐标"
      description="同一个概念在不同栏目里的不同讲法：对称 / 无穷 / 不确定性 / 维度 / 波与频率 / 秩序与混沌，点站直达。">
      <main className={styles.page}>
        <div className="container">
          <Heading as="h1" className={styles.title}>
            概念坐标
          </Heading>
          <p className={styles.subtitle}>
            同一个东西，六个栏目各讲一遍。地图上带虚线圈的站点就是这些换乘站 —— 点任一站进入。
          </p>

          {concepts.map((c) => (
            <section key={c.id} id={c.id} className={styles.concept}>
              <Heading as="h2" className={styles.conceptTitle}>
                {c.label}
                <span className={styles.count}>{c.entries.length} 站</span>
              </Heading>
              <p className={styles.blurb}>{c.blurb}</p>
              <ul className={styles.entries}>
                {c.entries.map((e) => (
                  <li key={`${e.track}-${e.pos}`}>
                    <Link to={e.to} className={styles.entry}>
                      <span
                        className={styles.dot}
                        style={{background: e.color}}
                        aria-hidden="true"
                      />
                      <span className={styles.track}>{e.trackName}</span>
                      <span className={styles.station}>{e.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <p className={styles.back}>
            回到 <Link to="/map">知识地图</Link> 按线路看，或去 <Link to="/">首页目录</Link> 按栏目浏览。
          </p>
        </div>
      </main>
    </Layout>
  );
}
