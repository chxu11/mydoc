/**
 * 换乘枢纽数据（shim）。
 * 词表（id / 名称 / 一句话说明）在 src/data/concepts.cjs；
 * 「概念 → 站点」的归属由 scripts/gen-tracks.js 扫 docs frontmatter 生成
 * src/data/concepts.json（dev 重编译时自动重算，已接入 plugins）。
 * 文档里写 concepts: [infinity, wave] 即自动出现在换乘枢纽页与地图标记上。
 */
import trackData from './tracks.json';
import conceptIndex from './concepts.json';
import {concepts as vocab} from './concepts.cjs';

const trackById = Object.fromEntries(trackData.map((t) => [t.id, t]));

/** 只暴露真的有站点认领（且经构建校验跨栏目）的概念 */
export const concepts = vocab
  .map((c) => ({
    ...c,
    entries: (conceptIndex[c.id] ?? []).map((e) => ({
      ...e,
      trackName: trackById[e.track]?.name ?? e.track,
      color: trackById[e.track]?.color,
    })),
  }))
  .filter((c) => c.entries.length > 0);

export const conceptById = Object.fromEntries(concepts.map((c) => [c.id, c]));
