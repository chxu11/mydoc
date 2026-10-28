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
import {
  MATH_ORDER,
  MATH_PATTERNS,
} from '@site/src/components/MathLab/generators';

import styles from './lab.module.css';

/** 先按各自登记的顺序，再补上顺序表里漏登记的项（新增一件不会默默消失） */
function ordered(order, registry) {
  return [
    ...order.filter((k) => registry[k]),
    ...Object.keys(registry).filter((k) => !order.includes(k)),
  ];
}

/**
 * 两组共用同一个外壳（母题 → 参数 → 图形），所以做成一页两级切换，
 * 而不是复制出一个 /math-lab —— 「它们是同一套机制」这件事本身就是页面要讲的内容。
 *
 * kind 约定：全页唯一。深链 /lab#<kind> 会跨组按 key 查找，
 * 以后新增分组时若可能撞名（如 wave），请带组前缀（phys-wave）。
 */
const GROUPS = [
  {
    id: 'pattern',
    label: '纹样',
    subtitle:
      '同一件纹样，本质上是几个数。挑一个母题，拖动滑杆看它当场重画——下面那行小字会实时告诉你现在这套参数意味着什么。',
    registry: PATTERNS,
    kinds: ordered(PATTERN_ORDER, PATTERNS),
    docs: {
      seigaiha: {to: '/docs/patterns/4/', label: '日本纹样 · 青海波'},
      meander: {to: '/docs/patterns/3/', label: 'Greek Key 希腊回纹'},
      leiwen: {to: '/docs/patterns/2/', label: '云雷纹 · 商周青铜'},
      asanoha: {to: '/docs/patterns/4/', label: '日本纹样 · 麻叶'},
      ichimatsu: {to: '/docs/patterns/4/', label: '日本纹样 · 市松'},
      rosette: {to: '/docs/patterns/5/', label: 'Girih · 十重星盘'},
      interlace: {to: '/docs/patterns/6/', label: '凯尔特 · 交织绳结'},
    },
    // 新加母题却忘了登记正文时兜回总览，不让页面崩
    fallbackDoc: {to: '/docs/patterns/1/', label: '纹样总览'},
    noteSvg:
      '图形只用 currentColor 描边，除了根节点那一行颜色声明，没有任何外部样式——放进任何编辑器都能接着改色、缩放、拼花。',
    noteCanvas: '这一件按逐像素绘制，放大不保留细节。',
    footnote: (
      <>
        七件母题来自 <Link to="/docs/patterns/1/">纹样总览</Link>，参数清单在那页最后一节；
        它们和上面的「数学」组用的是同一个外壳——密铺规则与迭代规则是同一种东西。
      </>
    ),
  },
  {
    id: 'math',
    label: '数学',
    subtitle:
      '分形、螺线、波形、Julia 集也是「几个数 + 一条规则」。这一组下面那行小字报的是维数、周长倍数与谐波幅度，全部按当前参数实时算出来——不是写死的教科书数字。注意深度与迭代上限是指数代价：Koch 每加深一层，段数就 ×4。',
    registry: MATH_PATTERNS,
    kinds: ordered(MATH_ORDER, MATH_PATTERNS),
    docs: {
      koch: {to: '/docs/math/7/', label: '分形 · 维数怎么算'},
      sierpinski: {to: '/docs/math/7/', label: '分形 · 自相似'},
      tree: {to: '/docs/math/7/', label: '分形 · 自相似与迭代'},
      julia: {to: '/docs/math/7/', label: '分形 · Mandelbrot 与 Julia'},
      spiral: {to: '/docs/math/9/', label: '经典几何 · 螺线'},
      bezier: {to: '/docs/math/9/', label: '经典几何 · 贝塞尔'},
      fourier: {to: '/docs/math/8/', label: '傅里叶级数 · 逐项叠加'},
    },
    fallbackDoc: {to: '/docs/math/7/', label: '分形'},
    noteSvg:
      '折线与网格同样只用 currentColor 描边；深度、项数、阶数都只是参数，导出的文件放进编辑器还能接着拆。',
    noteCanvas: (
      <>
        Julia 集按逐像素迭代逃逸时间算出来，颜色本身就代表迭代次数，放大不保留细节；
        迭代上限拉到 400，一帧约 80 ms。
      </>
    ),
    footnote: (
      <>
        七个图形来自 <Link to="/docs/math/7/">分形</Link>、
        <Link to="/docs/math/8/">傅里叶分析</Link>、
        <Link to="/docs/math/9/">经典几何</Link> 三篇的「动手」小节；
        上面每行小字里的维数都是现场解出来的，正文里给了推导。
      </>
    ),
  },
];

const ALL_KINDS = GROUPS.flatMap((g) => g.kinds);
const FIRST = ALL_KINDS[0];

const groupOf = (kind) =>
  GROUPS.find((g) => g.registry[kind]) ?? GROUPS[0];

/** 支持 /lab#leiwen 与 /lab#koch 深链：锚点在手写 JSX 里，必须显式登记，否则构建期算断锚点 */
function hashKind() {
  if (typeof window === 'undefined') return null;
  const id = decodeURIComponent(window.location.hash.replace(/^#/, ''));
  return ALL_KINDS.includes(id) ? id : null;
}

export default function LabPage() {
  const brokenLinks = useBrokenLinks();
  ALL_KINDS.forEach((k) => brokenLinks.collectAnchor(k));

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

  const group = groupOf(kind);
  const active = group.registry[kind] ? kind : group.kinds[0];
  const gen = group.registry[active];
  const doc = group.docs[active] ?? group.fallbackDoc;
  const isCanvas = gen.medium === 'canvas';

  return (
    <Layout
      title="参数化实验室"
      description="十四件图形做成可以拖的参数：纹样七母题（云雷、回纹、麻叶、市松、青海波、Girih 星盘、凯尔特交织）与数学七件（Koch、Sierpinski、分形树、Julia 集、螺线、贝塞尔、傅里叶级数），实时重画并导出。">
      <main className={styles.page}>
        <div className="container">
          <Heading as="h1" className={styles.title}>
            参数化实验室
          </Heading>
          <p className={styles.kicker}>
            纹样七件 + 数学七件 · 同一套外壳（母题 → 参数 → 图形）
          </p>

          <div className={styles.groups} role="group" aria-label="实验室分组">
            {GROUPS.map((g) => (
              <button
                key={g.id}
                type="button"
                className={clsx(
                  styles.groupTab,
                  g.id === group.id && styles.groupTabOn,
                )}
                aria-pressed={g.id === group.id}
                onClick={() => pick(g.kinds[0])}>
                {g.label}
                <b className={styles.groupCount}>{g.kinds.length}</b>
              </button>
            ))}
          </div>

          <p className={styles.subtitle}>{group.subtitle}</p>

          <div
            className={styles.tabs}
            role="tablist"
            aria-label={`${group.label}母题`}>
            {group.kinds.map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={id === active}
                className={clsx(styles.tab, id === active && styles.tabOn)}
                title={group.registry[id].hint}
                onClick={() => pick(id)}>
                {group.registry[id].label}
              </button>
            ))}
          </div>

          {/* key={active} 让每件图形重新挂载，参数各自归零，不会串台 */}
          <div className={styles.stage}>
            <ParamLab registry={group.registry} kind={active} key={active}>
              <strong>
                {isCanvas ? '导出的是 PNG 位图：' : '导出的是矢量 SVG：'}
              </strong>
              {isCanvas ? group.noteCanvas : group.noteSvg} 想回到来龙去脉，看{' '}
              <Link to={doc.to}>{doc.label}</Link>；想看横向关系，去{' '}
              <Link to="/concepts">概念坐标</Link> 或 <Link to="/map">知识地图</Link>。
            </ParamLab>
          </div>

          <p className={styles.footnote}>{group.footnote}</p>
        </div>
      </main>
    </Layout>
  );
}
