/**
 * 学习进度工具：读写 localStorage，跨组件以事件广播。
 */

export const STORAGE_KEY = 'mydoc:progress';
export const PROGRESS_EVENT = 'mydoc:progress';

export function readProgress() {
  if (typeof window === 'undefined') {
    return new Set();
  }
  try {
    return new Set(JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]'));
  } catch (err) {
    return new Set();
  }
}

export function markRead(id) {
  if (typeof window === 'undefined') {
    return;
  }
  const done = readProgress();
  if (done.has(id)) {
    return;
  }
  done.add(id);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...done]));
    window.dispatchEvent(new Event(PROGRESS_EVENT));
  } catch (err) {
    // 忽略隐私模式等 localStorage 不可用的情况
  }
}
