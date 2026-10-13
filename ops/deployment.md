# 部署与生产验证

更新：2026-10-13。根据仓库 `.github/workflows/deploy.yml` 记录，未登录服务器核实。

## 当前发布方式

推送到 `main` 触发 GitHub Actions：使用 Node 20、执行 `npm ci` 和 `npm run build`，再用 SCP 上传 `build/` 到阿里云服务器 `/var/www/html`，上传时去掉 `build/` 这一层目录。

工作流依赖 GitHub Secrets `SERVER_IP`、`SERVER_USER`、`SSH_PRIVATE_KEY`。不要把其值写入仓库或日志。`npm run deploy` 是 Docusaurus 的部署命令，本项目实际生产流程以上述工作流为准。

## 上线检查

1. 在本地构建并运行 `node scripts/verify-icp-homepage.cjs`；审查 `git diff`，只提交本次范围内的改动。
2. 确认任务已授权上线，再推送或合并到 `main`，检查 Actions 构建和 SCP 均成功。
3. 打开线上首页确认主体名、备案编号、版权主体、被隐藏区块和被删除句子；检查桌面和手机以及缓存/CDN。
4. 如停用栏目，核查旧 URL、搜索数据、RSS/Atom、站点地图和服务器上的旧 HTML。当前 SCP 配置未配置删除远端不再生成的文件；不能假定新版构建会自动清除旧路由。
5. 分别核查 `wiki.wetcm.org.cn`、`cal.wetcm.org.cn` 与 `zhq.info` 重定向。百科、日历不是本次主站构建控制的服务。

## 恢复

首页恢复使用 [备案变更记录](icp-change-log.md) 的开关并重新构建发布，不直接编辑 `build/index.html`。生产回退需定位已验证的版本重新构建并发布；涉及删掉的路由或静态文件时单独核实远端残留。记录版本、日期和验证结果。

截至本次任务，仅完成本地修改与验证，未提交、推送或部署。
