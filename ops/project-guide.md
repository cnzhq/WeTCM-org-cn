# 项目维护指南

更新：2026-10-13（Asia/Hong_Kong）。这是内部文档，不加入 Docusaurus 的公开 `docs/`。

## 架构与文件

网站使用 Docusaurus 3.10 系列、React 18，Node 要求 >=20。以 `package.json` 和锁文件为实际依赖依据。

| 位置 | 职责 |
| --- | --- |
| `docusaurus.config.js` | 站名、域名、导航、内容插件、搜索与主题配置 |
| `config/homepage-visibility.js` | ICP 期间首页两个区块的开关 |
| `src/pages/index.js`、`index.module.css` | 首页内容和样式 |
| `src/theme/Navbar/Content/`、`src/theme/Footer/` | 自定义导航、页脚与备案信息 |
| `src/theme/BlogPostItem/`、`src/components/Comment/` | 博客详情页与 Giscus 评论 |
| `docs/`、`blog/`、`literature/`、`book/`、`endfield/` | 五个公开内容来源；文学草稿有 `draft: true` |
| `config/sidebars/` | 文档栏目的侧边栏 |
| `plugins/literature-authors/`、`plugins/content-metrics.cjs` | 文学作者信息、阅读时间和字数 |
| `scripts/build-search-date-index.cjs` | 构建前生成高级搜索日期数据，跳过草稿 |
| `config/search/zh-user-dict.txt` | 中文搜索词典 |
| `static/` | 原样发布的图片、字体、CSV、搜索数据，不放内部材料 |
| `scripts/mediawiki/` | 用户已有本地百科 MCP 连接器，详情见该目录 README |
| `ops/`、`.agents/` | 运维、审核、协作和计划文档，不发布为网站栏目 |

## 开发和验证

```powershell
npm.cmd ci
npm.cmd start
npm.cmd run build
node scripts/verify-icp-homepage.cjs
npm.cmd run serve
```

已有依赖可直接构建，不必每次重装。`prestart` / `prebuild` 自动重建日期索引。首页调整检查桌面和移动端；栏目调整检查直接链接、导航、搜索、订阅与站点地图。构建成功不等于内容合法或审核通过。

2026-10-13 的构建存在部分内容嵌套 `<p>` 引起的 HTML 压缩警告，以及 Browserslist 数据过旧提示；应另行整理内容标记，不能将成功退出误写为无警告。

## 提交约定

用户喜欢使用约定式提交（Conventional Commits）。今后为本项目生成 commit message 时必须遵循这一偏好，标题格式为：

```text
type(scope): 简明描述

可选正文：说明修改原因、主要变化和验证结果。
```

`scope` 可省略；标题描述与正文默认使用中文。新增功能使用 `feat`，修复问题使用 `fix`，仅文档变更使用 `docs`，不改变行为的重构使用 `refactor`，测试使用 `test`，维护事项使用 `chore`。真实存在不兼容变更时才使用 `!` 或 `BREAKING CHANGE:` 标识，不因改名或临时隐藏而自动标记。

提交信息应覆盖本次实际提交的内容；无关改动分开提交。生成消息不代表已经提交或推送，`main` 推送会触发部署。

示例：`fix(icp): 调整备案标识并临时隐藏首页展示区块`。

## 文档入口

- [备案变更与恢复](icp-change-log.md)
- [备案核查与待确认事项](icp-review.md)
- [部署与生产验证](deployment.md)
- [Agent 协作说明](../AGENTS.md)
- [执行计划约定](../.agents/PLANS.md)
