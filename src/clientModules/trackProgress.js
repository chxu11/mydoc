/**
 * 进度追踪：访问某篇教程时，把该「站点」记入 localStorage。
 * 花园式首页据此让植物生长，知识地图据此点亮站点。
 */

import {markRead} from '@site/src/utils/progress';

const STATION_RE =
  /\/docs\/(react|rust|python|patterns|math|physics|education|poetry)\/(\d+)/;

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
