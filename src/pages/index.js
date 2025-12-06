import clsx from 'clsx'; // 用于条件性地合并CSS类名的工具
import Link from '@docusaurus/Link'; // Docusaurus提供的链接组件，用于内部路由跳转
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'; // 获取Docusaurus站点配置的Hook
import Layout from '@theme/Layout'; // 页面布局组件
import HomepageFeatures from '@site/src/components/HomepageFeatures'; // 首页特性组件

import Heading from '@theme/Heading'; // 标题组件
import styles from './index.module.css'; // 导入CSS模块样式

// 首页头部组件 - 展示站点标题和副标题
function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext(); // 获取站点配置信息
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}> // 使用CSS类名组合
      <div className="container"> // 容器元素
        <Heading as="h1" className="hero__title"> // 主标题
          {siteConfig.title} // 显示站点标题
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p> // 副标题
        <div className={styles.buttons}> // 按钮容器
          <Link
            className="button button--secondary button--lg" // 按钮样式类
            to="/docs/intro"> // 跳转路径
              <a href="https://docker.aityp.com/">渡渡鸟镜像同步</a>
          </Link>
        </div>
      </div>
    </header>
  );
}

// 首页主组件
export default function Home() {
  const {siteConfig} = useDocusaurusContext(); // 获取站点配置信息
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`} // 页面标题
      description="Description will go into a meta tag in <head />"> // 页面描述（meta标签）
      <HomepageHeader /> // 渲染首页头部
      <main>
        <HomepageFeatures /> // 渲染首页特性组件
      </main>
    </Layout>
  );
}
