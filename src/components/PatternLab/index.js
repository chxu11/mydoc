import React from 'react';

import ParamLab from '../ParamLab';
import {PATTERNS} from './generators';

/**
 * 纹样参数化生成器（供 patterns 栏目 MDX 使用）。
 *
 * 用法：
 *   import PatternLab from '@site/src/components/PatternLab';
 *   <PatternLab kind="seigaiha" />
 *   kind 取 seigaiha | meander | leiwen | asanoha | ichimatsu | rosette | interlace
 *   （母题定义见 ./generators.js，交互外壳见 ../ParamLab）
 */
export default function PatternLab(props) {
  return <ParamLab registry={PATTERNS} {...props} />;
}
