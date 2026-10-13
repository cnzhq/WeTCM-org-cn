# 关于WeTCM
该网站基于Meta公司的开源项目[Docusaurus](https://docusaurus.io/)项目开发而来。用于分享个人的各种知识/内容，旨在于练习和实践。

这是一个**新手项目**。这是本人的第一次尝试网站开发。

## 实现原理
Markdown文本->GitHub Pull->GitHub Actions->中国大陆服务器部署

## 组成人员
本网站并非我一人开发。由多位好友共同建设而成。特别感谢Amadues在文学方面的贡献。

## 开发与维护

使用 Node.js >=20 与 npm；Windows PowerShell 下可运行 `npm.cmd start`、`npm.cmd run build`。构建前会自动生成搜索日期索引。

- [项目结构与验证命令](./ops/project-guide.md)
- [ICP 备案变更、临时隐藏与恢复](./ops/icp-change-log.md)
- [ICP 内容核查与待确认事项](./ops/icp-review.md)
- [部署流程](./ops/deployment.md)
- [Codex 协作规则](./AGENTS.md) 与 [执行计划约定](./.agents/PLANS.md)

备案相关页面改动构建后运行 `node scripts/verify-icp-homepage.cjs`。以上为仓库内部文档，不作为公开网站栏目发布。

## 许可证

本仓库中的源代码采用 GNU Affero 通用公共许可证第 3 版或更高版本（AGPL v3.0 or later）进行授权。详见[许可证](./LICENSE)。

除非另有说明，本网站上的文本/内容仍按 CC BY-SA 4.0 许可提供，具体以网站声明为准。
