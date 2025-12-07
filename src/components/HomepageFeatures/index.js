import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
    {
        title: '全栈学习',
        Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
        description: (
            <>
                掌握前端和后端开发技能，学习HTML、CSS、JavaScript、数据库等全套技术栈，成为能够独立完成整个项目开发的全栈工程师。
            </>
        ),
    },
    {
        title: '桌面端学习',
        Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
        description: (
            <>
                深入学习WPF/Avalonia等桌面应用程序开发，掌握XAML界面设计、数据绑定、MVVM模式等核心技术，构建功能丰富的桌面应用。
            </>
        ),
    },
    {
        title: 'AI学习',
        Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
        description: (
            <>
                探索人工智能领域，学习机器学习、深度学习、自然语言处理等前沿技术，掌握Python/Java在AI开发中的应用，开启智能时代的大门。
            </>
        ),
    },
];

function Feature({Svg, title, description}) {
    return (
        <div className={clsx('col col--4')}>
            <div className="text--center">
                <Svg className={styles.featureSvg} role="img"/>
            </div>
            <div className="text--center padding-horiz--md">
                <Heading as="h3">{title}</Heading>
                <p>{description}</p>
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
