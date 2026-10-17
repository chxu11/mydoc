import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import MetroMap from '@site/src/components/MetroMap';

import styles from './map.module.css';

export default function MapPage() {
  return (
    <Layout
      title="知识地图"
      description="以地铁线路图的方式纵览胖头鱼学习网站的各条主线：编程（前端 / Rust / Python）与纹样 / 数学 / 物理 / 教育 / 诗歌文章，点击站点直达教程。">
      <main className={styles.page}>
        <div className="container">
          <Heading as="h1" className={styles.title}>
            知识地图
          </Heading>
          <p className={styles.subtitle}>
            每条主线是一列站点，站点即教程。空心为未读，读过会自动点亮 —— 点任意一站进入。
          </p>

          <MetroMap />

          <p className={styles.legend}>
            <span className={styles.dotOutline} /> 未读　
            <span className={styles.dotFilled} /> 已读　
            <span className={styles.transferHint} /> 换乘（编程三线共有的入门站）
          </p>

          <p className={styles.back}>
            也可以回到 <Link to="/">首页目录</Link>，按栏目浏览全部内容。
          </p>
        </div>
      </main>
    </Layout>
  );
}
