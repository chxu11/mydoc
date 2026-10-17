import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
    {
        title: '🌐 前端学习',
        Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
        // 卡片直达前端主线首页
        to: '/docs/react/1',
        description: (
            <>
                从 HTML/CSS/JavaScript 打底，到 React 组件化与 Hooks，再到 TypeScript、Vite 与工程化。
                已有 8 篇 React 系列教程，循序渐进，附完整实战 TodoList。
            </>
        ),
    },
    {
        title: '🦀 Rust 学习',
        Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
        to: '/docs/rust/1',
        description: (
            <>
                用"严格的空管"比喻理解所有权、借用与生命周期；覆盖 trait、并发、异步与实战。
                写得出 CLI 工具，也hold得住 axum Web 服务。
            </>
        ),
    },
    {
        title: '🐍 Python 学习',
        Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
        to: '/docs/python/1',
        description: (
            <>
                语法 → 数据结构 → 装饰器/生成器三件套 → 标准库与 requests / pandas / FastAPI。
                从"批量重命名文件"到"训练一个模型"，Python 都能兜底。
            </>
        ),
    },
];

function Feature({Svg, title, description, to}) {
    return (
        <div className={clsx('col col--4')}>
            <div className="text--center">
                <Svg className={styles.featureSvg} role="img"/>
            </div>
            <div className="text--center padding-horiz--md">
                <Heading as="h3">{title}</Heading>
                <p>{description}</p>
                {to && (
                    <p>
                        <Link className="button button--outline button--sm" to={to}>
                            查看教程 →
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
}

export default function HomepageFeatures() {
    return (
        <section className={styles.features}>
            <div className="container">
                <div className="row">
                    {FeatureList.map((props, idx) => (
                        <Feature key={idx} {...props} />
                    ))}
                </div>
            </div>
        </section>
    );
}
