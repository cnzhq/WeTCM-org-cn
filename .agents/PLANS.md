# 执行计划约定

复杂功能、跨栏目行为调整或部署改造时，在 `.agents/plans/` 新建有日期的 Markdown 计划。小型文字修正不需要计划。计划应让未读过聊天的人能凭仓库继续工作，写明路径、操作、验证和恢复方法，不写密钥或虚构已完成事项。

建议结构：

1. **Purpose / Big Picture**：用户目标、完成后的可观察行为、范围。
2. **Context**：相关文件、现状、依赖及限制。
3. **Progress**：带日期的完成与未完成项。
4. **Surprises & Discoveries**：实际发现和证据，包括警告、访问失败。
5. **Decision Log**：选择、原因、日期。
6. **Implementation & Validation**：具体修改与验证命令、预期结果。
7. **Rollback**：如何恢复；是否涉及生产路由、搜索、服务器残留文件。
8. **Outcomes & Retrospective**：结果、实际检查、剩余事项及是否上线。

执行中持续更新，停止时记录明确进度。外部权限不足或事实未确认时写明限制，不把待确认事项标成已完成。

参考：[OpenAI 执行计划指南](https://developers.openai.com/cookbook/articles/codex_exec_plans)。这里是针对本项目的简化约定。
