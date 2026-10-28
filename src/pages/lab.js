import React, {useEffect, useState} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import Layout from '@theme/Layout';
import useBrokenLinks from '@docusaurus/useBrokenLinks';

import ParamLab from '@site/src/components/ParamLab';
import {
  PATTERN_ORDER,
  PATTERNS,
} from '@site/src/components/PatternLab/generators';

import styles from './lab.module.css';

/** 先按正文顺序，再补上 PATTERN_ORDER 里漏登记的母题（不会默默弄丢一个新纹样） */
const KINDS = [
  ...PATTERN_ORDER.filter((k) => PATTERNS[k]),
  ...Object.keys(PATTERNS).filter((k) => !PATTERN_ORDER.includes(k)),
];
const FIRST = KINDS[0];

/** 每个母题都回到正文里的那一节：实验室不该变成信息孤岛 */
const DOCS = {
  seigaiha: {to: '/docs/patterns/4/', label: '日本纹样 · 青海波'},
  meander: {to: '/docs/patterns/3/', label: 'Greek Key 希腊回纹'},
  leiwen: {to: '/docs/patterns/2/', label: '云雷纹 · 商周青铜'},
  asanoha: {to: '/docs/patterns/4/', label: '日本纹样 · 麻叶'},
  ichimatsu: {to: '/docs/patterns/4/', label: '日本纹样 · 市松'},
  rosette: {to: '/docs/patterns/5/', label: 'Girih · 十重星盘'},
  interlace: {to: '/docs/patterns/6/', label: '凯尔特 · 交织绳结'},
};

/** 支持 /lab#leiwen 深链：锚点在手写 JSX 里，必须显式登记，否则构建期算断锚点 */
function hashKind() {
  if (typeof window === 'undefined') return null;
  const id = decodeURIComponent(window.location.hash.replace(/^#/, ''));
  return PATTERNS[id] ? id : null;
}

export default function LabPage() {
  const brokenLinks = useBrokenLinks();
  KINDS.forEach((k) => brokenLinks.collectAnchor(k));

  const [kind, setKind] = useState(FIRST);

  useEffect(() => {
    setKind(hashKind() ?? FIRST);
    const onHash = () => {
      const next = hashKind();
      if (next) setKind(next);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const pick = (id) => {
    setKind(id);
    window.history.replaceState(null, '', `#${id}`);
  };

  const active = PATTERNS[kind] ? kind : FIRST;
  // 新加母题却忘了登记正文时，兜底回总览，不让页面崩
  const doc = DOCS[active] ?? {to: '/docs/patterns/1/', label: '纹样总览'};

  return (
    <Layout
      title="纹样实验室"
      description="把七个经典母题变成可以拖的参数：云雷、回纹、麻叶、市松、青海波、Girih 星盘、凯尔特交织，实时重画并导出 SVG。">
      <main className={styles.page}>
        <div className="container">
          <Heading as="h1" className={styles.title}>
            纹样实验室
          </Heading>
          <p className={styles.subtitle}>
            同一件纹样，本质上是几个数。挑一个母题，拖动滑杆看它当场重画——
            下面那行小字会实时告诉你现在这套参数意味着什么。
          </p>

          <div className={styles.tabs} role="tablist" aria-label="母题">
            {KINDS.map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={id === active}
                className={clsx(styles.tab, id === active && styles.tabOn)}
                title={PATTERNS[id].hint}
                onClick={() => pick(id)}>
                {PATTERNS[id].label}
              </button>
            ))}
          </div>

          {/* key={active} 让每个母题重新挂载，参数各自归零，不会串台 */}
          <div className={styles.stage}>
            <ParamLab registry={PATTERNS} kind={active} key={active}>
              导出的是矢量 SVG：图形只用 currentColor 描边，除了根节点那一行颜色声明，
              没有任何外部样式——放进任何编辑器都能接着改色、缩放、拼花。
              想回到来龙去脉，看 <Link to={doc.to}>{doc.label}</Link>；
              想看横向关系，去 <Link to="/concepts">概念坐标</Link> 或 <Link to="/map">知识地图</Link>。
            </ParamLab>
          </div>

          <p className={styles.footnote}>
            七件母题来自 <Link to="/docs/patterns/1/">纹样总览</Link>，参数清单在那页最后一节；
            同一套外壳（母题 → 参数 → 图形）也用在数学栏目：
            <Link to="/docs/math/7/">分形</Link>、
            <Link to="/docs/math/8/">傅里叶</Link>、
            <Link to="/docs/math/9/">螺线与贝塞尔</Link>。
          </p>
        </div>
      </main>
    </Layout>
  );
}
