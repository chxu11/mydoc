import {useEffect, useState} from 'react';
import {readProgress, PROGRESS_EVENT} from '@site/src/utils/progress';

/**
 * 读取学习进度（已读站点 id 集合），并在进度变化时自动刷新。
 * 服务端渲染时返回空集合。
 */
export function useProgress() {
  // 初始为空集，保证服务端与首次客户端渲染一致（避免 hydration 不匹配），
  // 真实进度在挂载后从 localStorage 读取，并带来「植物生长」的动效。
  const [done, setDone] = useState(() => new Set());

  useEffect(() => {
    const sync = () => setDone(readProgress());
    sync();
    window.addEventListener(PROGRESS_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(PROGRESS_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return done;
}
