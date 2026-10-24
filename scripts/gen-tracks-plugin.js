/**
 * 本地 Docusaurus 插件：把 scripts/gen-tracks.js 接入 dev/build 生命周期。
 *
 * 机制（不依赖 Docusaurus 内部 API）：
 *  · 站点启动时同步生成一次（tracks.json 缺失时 webpack 会解析失败，必须先有文件）
 *  · dev watch 下每次编译前重扫 docs/ frontmatter；tracks.json 变化会触发
 *    再编译一次并自然收敛 → 新增/修改文档后知识地图与篇数即时更新，无需重启
 *  · 契约校验失败（缺 slug/mapShort）时抛出，dev 终端可见、CI 构建失败
 */
const path = require('path');
const {execFileSync} = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const GEN = path.join(ROOT, 'scripts/gen-tracks.js');

function runGen() {
  execFileSync(process.execPath, [GEN], {cwd: ROOT, stdio: 'inherit'});
}

/** 极简 webpack 插件：compile 前重算地图数据 */
class GenTracksWebpackPlugin {
  apply(compiler) {
    compiler.hooks.compile.tap('GenTracksWebpackPlugin', () => {
      try {
        runGen();
      } catch (e) {
        compiler.hooks.done.tap('GenTracksWebpackPluginError', () => {
          compiler.watchMode &&
            console.error('[gen-tracks-plugin] 生成失败：', e.message);
        });
        if (!compiler.watchMode) throw e; // 生产构建：直接失败
      }
    });
  }
}

/** @type {() => import('@docusaurus/types').DocusaurusPlugin} */
module.exports = function genTracksPlugin() {
  return {
    name: 'gen-tracks-plugin',
    configureWebpack(_config, _isServer) {
      // 立即生成一次，保证本次编译能 import 到 tracks.json
      runGen();
      return {
        plugins: [new GenTracksWebpackPlugin()],
      };
    },
  };
};
