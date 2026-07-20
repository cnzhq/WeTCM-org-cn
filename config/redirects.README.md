# 域名跳转配置

所有跳转关系都维护在 `config/redirects.json`。该文件合并到 `main` 后，
GitHub Actions 会自动校验、生成并部署 Nginx 配置；也可以在 Actions 页面
手动运行 `Deploy managed redirects`。

## 整站跳转

`default` 控制没有命中单独路由时的行为：

```json
{
  "domain": "zhq.info",
  "aliases": [],
  "default": {
    "target": "https://wetcm.org.cn",
    "status": 302,
    "preservePath": true,
    "preserveQuery": true
  },
  "routes": []
}
```

上述配置会将 `/docs?a=1` 跳转到
`https://wetcm.org.cn/docs?a=1`。如果不想保留原路径或查询参数，将对应值改为
`false`。

## 精确短链接

在 `routes` 中增加规则：

```json
{
  "path": "/wiki",
  "target": "https://wiki.wetcm.org.cn",
  "status": 302,
  "preserveQuery": true
}
```

这样 `/wiki?from=zhq` 会跳转到
`https://wiki.wetcm.org.cn/?from=zhq`。路由只做精确匹配，`/wiki/other`
仍然使用 `default`。

新增域名时，在 `sites` 数组中增加一个站点，并提前把该域名的 A 记录指向
当前服务器。`aliases` 中的域名也必须完成 DNS 解析。部署流程会通过 Certbot
签发或扩展证书。

状态码只允许 `301`、`302`、`307` 和 `308`。建议先使用 `302`，确认稳定后
再改成永久跳转。

本地校验和预览生成结果：

```bash
npm run redirects:build
```

## 服务器首次授权

部署流程需要修改 Nginx 配置和签发证书。为了避免把 sudo 密码放进 GitHub
Secrets，服务器只对一个固定的部署程序授予免密权限。首次部署时 SSH 登录服务器
执行一次：

```bash
sudo bash /tmp/managed-redirects/install-redirect-deployer.sh
```

安装器优先读取工作流写入的 `/tmp/managed-redirects/ssh-user`，因此即使使用
另一个管理员账户执行 sudo，也会授权给 GitHub Actions 实际使用的 SSH 用户。
必要时可以明确指定用户：

```bash
sudo bash /tmp/managed-redirects/install-redirect-deployer.sh <SERVER_USER>
```

之后重新运行 GitHub Actions 即可。该授权只允许执行
`/usr/local/sbin/deploy-managed-redirects`，不会授予任意免密 sudo 权限。
