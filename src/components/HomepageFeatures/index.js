import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
    {
        emoji: '🌐',
        title: '前端学习',
        meta: '已有 8 篇 · 主线连载中',
        to: '/docs/react/1',
        accent: '#2e8555',
        description: (
            <>
                8 篇 React 入门：组件与 Props · State · 事件 · 渲染 · TodoList 实战。
                学习方向（后续会覆盖）：JavaScript 基础、TypeScript、HTML/CSS、工程化。
            </>
        ),
    },
    {
        emoji: '🦀',
        title: 'Rust 学习',
        meta: '4 篇 · 主线连载中',
        to: '/docs/rust/1',
        accent: '#b7410e',
        description: (
            <>
                4 篇基础：介绍 · 环境搭建 · 变量与类型 · ⭐ 所有权。
                学习方向（后续会覆盖）：借用与生命周期、trait / enum、错误处理、并发与实战。
            </>
        ),
    },
    {
        emoji: '🐍',
        title: 'Python 学习',
        meta: '4 篇 · 广度冠军',
        to: '/docs/python/1',
        accent: '#3776ab',
        description: (
            <>
                4 篇基础：介绍 · 环境搭建 · 变量与控制流 · 数据结构与推导式。
                学习方向（后续会覆盖）：面向对象、装饰器与生成器、标准库与常用三方。
            </>
        ),
    },
];

function Feature({emoji, title, description, to, meta, accent}) {
    return (
        <div className={clsx('col', 'col--4')}>
            <div className={styles.featureCard}>
                <div
                    className={styles.featureBadge}
                    style={{background: accent}}
                    aria-hidden="true">
                    {emoji}
                </div>
                <Heading as="h3" className={styles.featureTitle}>{title}</Heading>
                <p className={styles.featureMeta}>{meta}</p>
                <p className={styles.featureDesc}>{description}</p>
                <Link
                    className={clsx('button', 'button--outline', 'button--sm', styles.featureBtn)}
                    to={to}>
                    查看教程 →
                </Link>
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
