# 项目协作说明

本仓库是 Docusaurus 3 / React 18 静态网站，主体名称为“苏州知轶互联网工作室”。与用户沟通和项目维护记录使用中文。

## 工作约定

- 修改前查看 `git status --short`，保留用户已有改动，不顺手重置或提交其他任务的文件。
- 用户偏好约定式提交（Conventional Commits）。每次生成 commit message 必须使用 `type(scope): 描述` 格式，scope 可省略；描述和正文默认使用中文。根据实际变更选择 `feat`、`fix`、`docs`、`refactor`、`test`、`chore` 等类型，详情见 `ops/project-guide.md` 的提交约定。
- 网站展示代码在 `src/`，配置在 `docusaurus.config.js` 和 `config/`；项目内部文档放在 `ops/` 或 `.agents/`。`docs/` 是公开网站栏目，不存放内部审核材料。
- 涉及站名、页脚、首页可见性或备案时，先读 `ops/icp-change-log.md`；合规核查读 `ops/icp-review.md`。备案期间不要自行恢复旧站名或关闭临时隐藏开关。
- 首页区块由 `config/homepage-visibility.js` 控制。隐藏展示不等于停用路由、移除索引或停止外部站点；需要下线内容时检查直接 URL、搜索、RSS/Atom、站点地图和服务器旧文件。
- 不把法律猜测写成审核结论；查阅现行官方规定，区分用户提供的服务商反馈、源码事实、推断和待确认事项。
- 不读取或输出凭据、私有环境变量、SSH 密钥、DPAPI 密文和机器本地 Codex 配置；只记录变量名与用途。
- 源文件保存为 UTF-8。PowerShell 读取中文用 `Get-Content -Encoding UTF8`；执行 npm 用 `npm.cmd`，避免本机脚本策略问题。

## 验证与交付

- 页面、配置或内容变更后运行 `npm.cmd run build`；备案相关修改再运行 `node scripts/verify-icp-homepage.cjs`。只改内部文档时检查路径、来源和内容即可。
- 当前没有 `npm test` 或 lint 脚本，不编造检查结果。构建会更新 `static/search/date-index.json`，审查其差异；不手改 `build/`、`.docusaurus/` 或 `node_modules/`。
- 汇报修改、验证、警告及是否部署。`main` 的推送会自动部署，需把提交与上线区别开；只有任务明确授权上线时才推送触发发布。
- 多文件复杂功能或长时间任务使用 `.agents/PLANS.md` 的执行计划；简单修正不额外制造流程。维护架构或部署时分别参考 `ops/project-guide.md`、`ops/deployment.md`。

## 代码审查关注点

- 临时隐藏的区块不得通过 CSS 隐藏后继续输出到首页 HTML。
- 标题、导航、元数据与备案主体保持一致，备案编号和查询链接不丢失。
- 内容授权不能靠 CC 声明、转载标记或免责声明代替；草稿不得出现在生产路由和搜索数据中。
- 不覆盖用户已有依赖或 MediaWiki 连接器改动，不将内部文档接入公开站点。

依据：[OpenAI AGENTS.md 指南](https://developers.openai.com/codex/guides/agents-md)。此文件放在仓库根目录供 Codex 发现；`.agents/` 中的辅助文档由这里按任务引用。
