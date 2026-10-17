import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
    {
        emoji: '🌐',
        title: '前端学习',
        to: '/docs/react/1',
        description: (
            <>
                8 篇 React 入门：组件与 Props、State、事件、渲染与 TodoList 实战。
            </>
        ),
    },
    {
        emoji: '🦀',
        title: 'Rust 学习',
        to: '/docs/rust/1',
        description: (
            <>
                4 篇基础：介绍、环境搭建、变量与类型，以及核心的所有权系统。
            </>
        ),
    },
    {
        emoji: '🐍',
        title: 'Python 学习',
        to: '/docs/python/1',
        description: (
            <>
                4 篇基础：介绍、环境搭建、变量与控制流、数据结构与推导式。
            </>
        ),
    },
];

function Feature({emoji, title, description, to}) {
    return (
        <div className={clsx('col', 'col--4')}>
            <div className={styles.featureCard}>
                <span className={styles.featureEmoji} aria-hidden="true">{emoji}</span>
                <Heading as="h3" className={styles.featureTitle}>{title}</Heading>
                <p className={styles.featureDesc}>{description}</p>
                <Link className={styles.featureLink} to={to}>
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
                <Heading as="h2" className={styles.sectionTitle}>
                    学习主线
                </Heading>
                <p className={styles.sectionSubtitle}>
                    三条主线，从入门到实战，循序渐进
                </p>
                <div className="row">
                    {FeatureList.map((props, idx) => (
                        <Feature key={idx} {...props} />
                    ))}
                </div>
            </div>
        </section>
    );
}
