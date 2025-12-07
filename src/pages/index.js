import clsx from 'clsx'; // 用于条件性地合并CSS类名的工具
import Link from '@docusaurus/Link'; // Docusaurus提供的链接组件，用于内部路由跳转
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'; // 获取Docusaurus站点配置的Hook
import Layout from '@theme/Layout'; // 页面布局组件
import HomepageFeatures from '@site/src/components/HomepageFeatures'; // 首页特性组件

import Heading from '@theme/Heading'; // 标题组件
import styles from './index.module.css'; // 导入CSS模块样式

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro/1">
              <a href="https://docker.aityp.com/">学习目标</a>
          </Link>
        </div>
      </div>
    </header>
  );
}

// 首页主组件
export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
