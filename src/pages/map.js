import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import MetroMap from '@site/src/components/MetroMap';

import styles from './map.module.css';

export default function MapPage() {
  return (
    <Layout
      title="知识地图"
      description="以地铁线路图的方式纵览胖头鱼学习网站的三条主线：前端、Rust、Python，点击站点直达教程。">
      <main className={styles.page}>
        <div className="container">
          <Heading as="h1" className={styles.title}>
            知识地图
          </Heading>
          <p className={styles.subtitle}>
            三条主线，站点即教程。圆圈为已读的会点亮试试 —— 点任意一站进入。
          </p>

          <MetroMap />

          <p className={styles.legend}>
            <span className={styles.dotOutline} /> 未读　
            <span className={styles.dotFilled} /> 已读　
            <span className={styles.transferHint} /> 换乘（各线共有的入门站）
          </p>

          <p className={styles.back}>
            也可以回到 <Link to="/">苗圃</Link> 里，按「养花」的方式阅读。
          </p>
        </div>
      </main>
    </Layout>
  );
}
