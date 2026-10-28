import React from 'react';
import Footer from '@theme-original/DocItem/Footer';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import ConceptLinks from '@site/src/components/ConceptLinks';

/**
 * 包一层主题的 DocItem/Footer：保留原生页脚（标签 / 编辑信息 / 最后更新），
 * 在其下方追加「换乘出口」——概念读自当前文档 frontmatter 的 concepts 字段。
 */
export default function DocItemFooterWrapper(props) {
  const {frontMatter} = useDoc();
  return (
    <>
      <Footer {...props} />
      <ConceptLinks ids={frontMatter?.concepts} />
    </>
  );
}
