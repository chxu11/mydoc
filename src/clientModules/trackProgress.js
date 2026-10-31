/**
 * 进度追踪：访问某篇教程时，把该「站点」记入 localStorage。
 * 花园式首页据此让植物生长，知识地图据此点亮站点。
 */

import {markRead} from '@site/src/utils/progress';
import {tracks} from '@site/src/data/tracks';

// 线路 id 从 tracks 派生：新增/删除栏目时进度追踪自动跟随，
// 不再维护一份手写目录清单（历史上漏过 java，导致该线永远点不亮）。
const STATION_RE = new RegExp(
  `/docs/(?:${tracks.map((t) => t.id).join('|')})/(\\d+)`,
);

export function onRouteDidUpdate({location}) {
  if (!location?.pathname) {
    return;
  }

  const match = location.pathname.match(STATION_RE);
  if (!match) {
    return;
  }

  markRead(`${match[1]}/${match[2]}`);
}
