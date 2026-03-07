import twemoji from '@twemoji/api';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

// Docusaurus 的内置生命周期钩子：每次页面加载或路由切换完成后执行
export function onRouteDidUpdate() {
  // 确保这段代码只在浏览器端运行（因为 Node.js 服务端渲染时没有 DOM）
  if (ExecutionEnvironment.canUseDOM) {
    // 稍微延迟 100ms，等待 React 完全把新页面的 DOM 挂载完毕，防止冲突报错
    setTimeout(() => {
      twemoji.parse(document.body, {
        folder: 'svg',
        ext: '.svg',
        // 网工避坑指南：Twitter 官方的 MaxCDN 已经停服，这里必须使用社区接管的可靠 jsdelivr CDN 源
        base: 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/'
      });
    }, 100);
  }
}