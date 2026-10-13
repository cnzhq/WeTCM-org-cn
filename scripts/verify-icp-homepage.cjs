// 验证实际构建 HTML；隐藏内容仍保留在源码，不对打包 JS 做下线断言。
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const build = path.join(root, 'build');
const name = '苏州知轶互联网工作室';
const icp = '苏ICP备2024061225号';

async function main() {
  const source = fs.readFileSync(path.join(root, 'config/homepage-visibility.js'), 'utf8');
  const {default: visibility} = await import(`data:text/javascript,${encodeURIComponent(source)}`);
  const home = fs.readFileSync(path.join(build, 'index.html'), 'utf8');
  assert.equal(home.match(/<title[^>]*>(.*?)<\/title>/s)?.[1], `首页 | ${name}`);
  assert.ok(home.includes(`<h1>${name}</h1>`), '首页主标题应使用备案主体');
  assert.ok(!home.includes('不仅是一个安静、清晰、可持续整理的中医知识站。'), '删除的介绍不应输出');

  const sections = [
    ['showStatement', ['传承精华 守正创新', '加快推进中医药现代化、产业化']],
    ['showProducts', ['Knowledge', '把中医基础、大学资料与长期笔记放进一条清晰的阅读路线。',
      '阴阳者天地之道也', '法随证立方从法出', '从中医基础理论开始，整理可反复查阅的知识路径。',
      '记录学习、生活与中医相关的观察，保留思考的现场。',
      '把叙事、想象与日常经验放在同一个安静的书架上。',
      '连接到更开放的资料空间，作为延伸阅读的入口。']],
  ];
  for (const [flag, markers] of sections) {
    assert.equal(typeof visibility[flag], 'boolean', `${flag} 必须为布尔值`);
    for (const marker of markers) {
      assert.equal(home.includes(marker), visibility[flag], `${flag} 与首页 HTML 不一致：${marker}`);
    }
  }

  let pages = 0;
  function inspect(dir) {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) inspect(file);
      else if (entry.name.endsWith('.html')) {
        const html = fs.readFileSync(file, 'utf8');
        assert.ok(!html.includes('皇家太医院'), `残留旧站名：${file}`);
        assert.ok(!/ICP备\d+号-\d+/.test(html), `残留备案序号：${file}`);
        // 重定向页面没有主题页脚；其余页面逐一核对标识。
        if (html.includes('wetcmFooterLegal')) {
          pages++;
          assert.ok(html.includes(name) && html.includes(icp), `主体或编号缺失：${file}`);
          const text = html.replace(/<!--[\s\S]*?-->/g, '');
          assert.ok(new RegExp(`Copyright © \\d{4} ${name}`).test(text), `版权主体不一致：${file}`);
          assert.ok(html.includes('https://beian.miit.gov.cn/'), `备案查询链接缺失：${file}`);
        }
      }
    }
  }
  inspect(build);
  assert.ok(pages > 0, '没有找到含页脚的生产页面');
  console.log(`ICP 展示检查通过：${pages} 个页面；首页开关 ${JSON.stringify(visibility)}。`);
  console.log('此检查验证本地展示，不代表备案、授权或线上状态已核实。');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
