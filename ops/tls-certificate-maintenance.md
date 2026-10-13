# HTTPS 证书维护与 2026-10-13 排查记录

所有用户可读时间均为 Asia/Hong_Kong。此次通过公开 TLS 握手、DNS 与用户提供的 `admin@47.116.214.51` SSH 入口核查；未修改源服务器、DNS 或 CDN 配置。

## 当前事实

| 入口 | 观察到的证书截止时间 | 状态 |
| --- | --- | --- |
| `wetcm.org.cn` 按公网 DNS 访问 | 2026-09-25 06:27:23 | 过期，TLS 校验报告 `CERT_HAS_EXPIRED` |
| `wetcm.org.cn` 直接连接 `47.116.214.51`，保留 SNI | 2026-11-25 18:48:10 | 有效 |
| `www.wetcm.org.cn` | 2026-11-25 18:48:10 | 有效，与源服务器证书指纹相同 |
| `wiki.wetcm.org.cn` | 2026-11-25 18:48:30 | 有效 |
| `cal.wetcm.org.cn` | 2026-12-18 03:38:08 | 有效 |

主站 CNAME 为 `wetcm.org.cn.w.kunlunaq.com.`，公网响应包含 `Tengine` 和 CDN 缓存节点标识，表明主站流量经过阿里云 CDN。`www` 当时解析到源服务器。实际访问到的公网节点提供旧证书，源服务器却有新证书；需要更新 CDN 侧部署，不能靠重复续签源站证书解决。

源服务器上 Certbot 的 `wetcm.org.cn` 证书覆盖主域名和 `www`，续期配置使用 `nginx` 验证与安装插件，`certbot.timer` 存在并有下次执行时间。`nginx -t` 成功，但 `/etc/nginx/sites-enabled/default:147` 有 IPv6 443 协议选项重复定义警告，本次未改动该配置。未执行完整续期模拟，不能仅凭定时器存在保证未来续期成功。

## 修复位置与操作

在阿里云 CDN 控制台的域名列表选择 `wetcm.org.cn`，进入 HTTPS 配置并更新证书。具体入口以当前控制台和[官方配置说明](https://help.aliyun.com/zh/cdn/user-guide/configure-an-ssl-certificate)为准。

1. 若同账户已有已签发、覆盖 `wetcm.org.cn` 的有效证书，选用它并部署到该 CDN 域名。
2. 若只有旧证书，申请覆盖该域名的新证书，完成域名验证并部署；或在受控环境中上传合适的自有证书。私钥不能发送到聊天、GitHub 或提交进仓库。
3. 等待配置下发后，验证公网节点证书日期、主域名匹配和 HTTPS 正常。多个 CDN 节点可能不同时生效，应从浏览器、IPv4/IPv6 或另一网络复核。

源站上的新证书不会自动同步到 CDN，这是阿里云[HTTPS 排障指南](https://help.aliyun.com/zh/cdn/user-guide/https-troubleshooting-guide)明确说明的行为。此次没有阿里云账户/API 管理入口，CDN 更新尚待完成；源站无需为本次故障重复签发或重启。

## 本次自定义上传的填写方式

用户截图确认当前 HTTPS 设置选择“自定义上传（证书+私钥）”，证书名称为 `wetcm-org-cn-letsencrypt`。保留 HTTPS 开关，使用源服务器当前有效证书及其匹配私钥替换两个字段，不能只替换证书或保留旧证书。

在用户本机 PowerShell 中依次执行以下步骤。命令只把对应内容送入本机剪贴板，不写入仓库或打印到聊天；不要由 Agent 执行并捕获私钥。

先复制证书链，成功后粘贴到“证书（公钥）”，覆盖原内容：

```powershell
$tlsCertificate = ssh -T admin@47.116.214.51 "sudo -n cat /etc/letsencrypt/live/wetcm.org.cn/fullchain.pem"
if ($LASTEXITCODE -eq 0) { Set-Clipboard -Value ($tlsCertificate -join "`n") }
Remove-Variable tlsCertificate
```

再复制匹配私钥，成功后粘贴到“私钥”：

```powershell
$tlsPrivateKey = ssh -T admin@47.116.214.51 "sudo -n openssl ec -in /etc/letsencrypt/live/wetcm.org.cn/privkey.pem"
if ($LASTEXITCODE -eq 0) { Set-Clipboard -Value ($tlsPrivateKey -join "`n") }
Remove-Variable tlsPrivateKey
```

如果 SSH 或 sudo 报错，不粘贴或提交，先解决访问问题；失败时剪贴板可能仍含上次内容。确认字段替换完成后点击“确定”，不要发送包含私钥的截图。完成后用 `Set-Clipboard -Value ''` 清空当前剪贴板；如启用了剪贴板历史或跨设备同步，还需移除相应历史条目。

后续用户收到 `SSLPri.MissingParameter`（私钥字段未提交）和 `Certificate.MissMatch` 错误。服务器核查确认当前证书与私钥的公钥 SHA-256 摘要一致，密钥有效，但原私钥为 PKCS#8 的 `BEGIN PRIVATE KEY` 格式。按[阿里云官方格式要求](https://help.aliyun.com/zh/cdn/user-guide/https-troubleshooting-guide)，本证书的 ECC 私钥上传前应转换为 `BEGIN EC PRIVATE KEY` 格式；上述命令已修正为内存中转换，不修改服务器文件。重新上传时应完整替换证书和私钥两个框，避免失败后弹窗恢复旧证书内容。

用户随后遇到 `CertNameAlreadyExists`，已建议改用新名称 `wetcm-org-cn-letsencrypt-20261013`；名称为控制台标签，不改变证书域名。最终公网更新已通过下面的复核，不从控制台名称推定成功。

这些是填写操作说明，是否部署成功以公网证书与浏览器复核结果为准。

## 防止再次过期

区分两个独立层面：

- 源站：Certbot 负责自动续期，成功后让 Nginx 重新加载证书；确认定时任务、验证插件和续期日志，必要时在维护期间执行 `sudo certbot renew --cert-name wetcm.org.cn --dry-run`。
- CDN：需要同步部署新的边缘证书，或选择适用的自动托管方案；[证书自动托管](https://help.aliyun.com/zh/ssl-certificate/enable-certificate-hosting)与自动续费不是同一件事。先核实证书类型、域名验证、关联 CDN 产品、支持范围与费用，再决定开通。

源站续期参考 [Certbot 官方说明](https://eff-certbot.readthedocs.io/en/stable/using.html#renewing-certificates)。不能把更新网站静态文件、清缓存或 GitHub 构建当成证书续期操作，也不要以关闭 TLS 验证作为修复。

## 本地复核

```powershell
node scripts/check-tls-certificates.cjs
node scripts/check-tls-certificates.cjs --origin
```

脚本读取公开证书以显示错误，仍以证书链、主机名和有效期校验作为通过条件；任一失败或不足 14 天即非零退出。默认检测访问到的公网入口，`--origin` 检测当前源服务器，二者不可混用来证明公网正常。脚本不会请求页面内容、输出密钥或修改安全设置。

## 当前处理状态

2026-10-13 后续复核确认：访问到的主站 CDN IPv6 节点 `2409:8c20:b281:16:3::19` 已提供新证书，截止时间为 2026-11-25 18:48:10，信任校验通过；主站、www、百科和日历的证书脚本检查均 PASS。这是对实际访问节点的检测，不能替代全球全部 CDN 节点验证。

用户浏览器仍显示“不安全”，同时详情显示“证书有效”。使用独立临时配置的 Edge 实际加载公网首页，安全状态为 `secure`，TLS 1.3，证书问题列表为空，页面 `isSecureContext=true`，观察到 34 个资源响应，无 HTTP 请求、HTTP 嵌入资源或加载失败。此次未发现首页混合内容问题；未修改用户日常浏览器资料、证书信任设置或网站代码。

用户随后确认并提供截图：新的 Edge InPrivate 窗口显示“连接安全”。结合公网证书校验与独立浏览器结果，CDN 过期证书故障在检测节点已修复，用户的新会话也已验证正常。普通窗口的提示与其会话或配置状态有关，具体原因未直接检查，不能将其归因于某一项缓存或扩展。

建议先关闭该站点旧标签页，完全退出 Edge 后重新访问。若普通窗口仍显示异常，可只清理该站点 Cookie/缓存等站点数据后复测；仍无法解决时通过 Security 面板核实原因，参考[微软官方指南](https://learn.microsoft.com/en-us/microsoft-edge/devtools/security/)。不需要再次续签或替换已验证有效的证书，也不更改证书校验与安全策略。
