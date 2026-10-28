import React from 'react';

import ParamLab from '../ParamLab';
import {MATH_PATTERNS} from './generators';

/**
 * 数学参数化生成器（供 math 栏目 MDX 使用）。
 *
 * 用法：
 *   import MathLab from '@site/src/components/MathLab';
 *   <MathLab kind="koch" />
 *   kind 取 koch | sierpinski | tree | spiral | fourier | bezier | julia
 *   （生成器见 ./generators.js，交互外壳与纹样共用 ../ParamLab）
 *
 * 与纹样是同一套契约：母题 → 参数 → 图形 + 一句「参数背后的数学」。
 */
export default function MathLab(props) {
  return <ParamLab registry={MATH_PATTERNS} {...props} />;
}
