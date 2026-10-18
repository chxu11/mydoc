import React from 'react';
import clsx from 'clsx';

import styles from './styles.module.css';

/**
 * 诗歌原文排版组件（供 poetry 栏目 MDX 使用）。
 *
 * 用法：
 *   import Poem from '@site/src/components/Poem';
 *   <Poem>{`第一行
 * 第二行
 *
 * 空行分段`}</Poem>
 *
 * - children 用模板字符串传入，按 \n 拆行，空行渲染为段间距
 * - align: 'center'（默认，适合格律诗）| 'left'（适合长短句 / 散文诗）
 */
export default function Poem({children, align = 'center', className}) {
  const lines = String(children ?? '').replace(/^\n+|\n+$/g, '').split('\n');
  return (
    <div className={clsx(styles.poem, className)} data-align={align}>
      {lines.map((ln, i) =>
        ln.trim() === '' ? (
          <span key={i} className={styles.gap} aria-hidden="true" />
        ) : (
          <p key={i} className={styles.line}>
            {ln}
          </p>
        ),
      )}
    </div>
  );
}
