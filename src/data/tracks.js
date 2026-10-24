/**
 * 知识地图数据（shim）。
 * 真正的事实源是 docs/ 各篇 frontmatter（slug / mapShort / title / 文件名前缀），
 * 由 scripts/gen-tracks.js 扫描生成 src/data/tracks.json（dev 重编译时自动重算，
 * 已接入 plugins；手动重算可跑 npm run gen-tracks）。
 * 新增文档不需要改本文件 —— 重新生成即自动上图、计入篇数、参与进度点亮。
 */
import tracksData from './tracks.json';

export const tracks = tracksData;

export const totalStations = tracks.reduce((n, t) => n + t.stations.length, 0);

/** 按 track id 取篇数（stations 长度）；id 不存在时返回 0。 */
export const countOf = (id) => tracks.find((t) => t.id === id)?.stations.length ?? 0;
