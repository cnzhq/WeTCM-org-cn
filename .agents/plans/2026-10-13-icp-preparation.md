# ICP 首页调整与项目文档补齐

本计划遵循 `.agents/PLANS.md`，记录 2026-10-13 的任务。

## Purpose / Big Picture

让用户截图中的所有首页区块临时不显示，删除指定介绍；保留恢复手段，记录此前的更名/编号调整，并补齐有来源与边界说明的 ICP 核查和 Codex 项目文档。

## Context

首页位于 `src/pages/index.js`，站名在 `docusaurus.config.js`，页脚为自定义主题。仓库原来缺少根 `AGENTS.md` 和执行计划说明。任务开始时已有依赖、`.gitignore` 和 `scripts/mediawiki/` 改动，保留这些用户改动。

## Progress

- [x] 2026-10-13：定位截图为声明区与整个产品区，添加两个默认关闭的配置开关；删除指定介绍。
- [x] 2026-10-13：记录此前站名、编号、字号变更和完整恢复操作；版权主体更新为工作室全称。
- [x] 2026-10-13：核查内容及发布入口，查询官方法规、江苏/接入指南和 OpenAI 文档。
- [x] 2026-10-13：补齐 `AGENTS.md`、`.agents/PLANS.md`、架构、部署、风险文档及 README 入口。
- [x] 2026-10-13：生产构建退出码 0；验证 70 个页面的备案标识及首页隐藏；8 篇文学草稿未进入生产 URL、日期/本地搜索索引或页面链接；内部文档未进入公开构建。
- [x] 2026-10-13：临时打开两个开关重新构建，恢复展示验证通过；随后关闭两个开关并重新构建，最终隐藏状态再次验证通过。

## Surprises & Discoveries

- 药品医疗器械信息服务在 2025 年有监管程序调整，不能直接照抄旧前置审批指南；依据和未确认事项见 `ops/icp-review.md`。
- 主站/百科/日历网页访问未成功，本轮只能核验本地代码和产物。
- 当前上传工作流没有远端旧文件清理设置，后续下线栏目需核查旧 URL。
- PowerShell 下 `npm` 会命中被执行策略阻止的脚本，使用 `npm.cmd`。将构建输出重定向时原生 stderr 警告可引发宿主失败状态，需直接执行确认真实退出结果。

## Decision Log

- 2026-10-13：条件渲染首页区块而非 CSS 隐藏，保留源码和样式；不改栏目路由，风险文档明确这一范围。
- 2026-10-13：内部文档放在 `ops/` / `.agents/`，不放公开内容目录。
- 2026-10-13：不替用户推定专项资质或授权，不自动删除医疗正文、评论或其他站点。

## Implementation & Validation

执行 `npm.cmd run build` 与 `node scripts/verify-icp-homepage.cjs`。验证首页指定介绍和两块内容不输出，生成页面的站名、备案编号、版权主体及查询链接一致。检查草稿不在生产文学路由与日期索引，内部文档不在构建站点中。运行 `git diff --check` 审查差异。

## Rollback

参见 `ops/icp-change-log.md`：调整 `config/homepage-visibility.js` 后重新构建、核查、发布。更名和编号不能机械回退；恢复正文仍需核实服务分类和授权。此次不提交或推送。

## Outcomes & Retrospective

本地修改和文档补齐完成。`npm.cmd run build`、`node scripts/verify-icp-homepage.cjs` 和 `git diff --check` 通过；构建有 25 个路径的既有 HTML 格式警告，另有 Browserslist 数据与 Docusaurus 更新检查提示。隐藏与恢复均经过实际构建验证，最终两个开关保持 false。未执行浏览器视觉检查、提交、推送或部署。

线上核验、备案材料、授权证明和评论后台检查仍是明确剩余事项，已列在 `ops/icp-review.md`，不包含在本次本地交付的“已验证”结论中。
