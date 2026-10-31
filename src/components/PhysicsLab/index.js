import React from 'react';

import ParamLab from '../ParamLab';
import {PHYSICS_PATTERNS} from './generators';

/**
 * 物理参数化生成器（供 physics 栏目 MDX 使用）。
 *
 * 用法：
 *   import PhysicsLab from '@site/src/components/PhysicsLab';
 *   <PhysicsLab kind="osc" />
 *   kind 取 osc | beat | maxwell | planck | tunnel
 *   （生成器见 ./generators.js，交互外壳与纹样、数学共用 ../ParamLab）
 *
 * 三组里只有这一组下面那行小字带单位（rad/s、m/s、nm、W/m²），因为物理的
 * 教训恰恰是单位：所有数字都现场调用 ./formulas.mjs，而 formulas.mjs 被
 * scripts/check-lab.mjs 拿解析性质对撞过 —— 少一个 4π、把 nm 当成 m，
 * 构建期就会红，不会等到肉眼看图觉得"好像也还行"。
 */
export default function PhysicsLab(props) {
  return <ParamLab registry={PHYSICS_PATTERNS} {...props} />;
}
