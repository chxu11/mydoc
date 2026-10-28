import React from 'react';
import Link from '@docusaurus/Link';
import {conceptById} from '@site/src/data/concepts';

import styles from './styles.module.css';

/**
 * 文档页底部的「换乘出口」：把 frontmatter concepts 里认领的概念渲染成芯片，
 * 点一下跳到 /concepts#<id>，看同一个概念在其他栏目里的讲法。
 * 没有认领概念的文档不渲染任何东西。
 */
export default function ConceptLinks({ids}) {
  const list = Array.isArray(ids) ? ids : ids ? [ids] : [];
  const concepts = list.map((id) => conceptById[id]).filter(Boolean);
  if (concepts.length === 0) {
    return null;
  }
  return (
    <aside className={styles.wrap} aria-label="换乘出口">
      <span className={styles.label}>换乘出口</span>
      {concepts.map((c) => (
        <Link key={c.id} to={`/concepts#${c.id}`} className={styles.chip}>
          {c.label}
        </Link>
      ))}
      <Link to="/concepts" className={styles.more}>
        全部概念 →
      </Link>
    </aside>
  );
}
