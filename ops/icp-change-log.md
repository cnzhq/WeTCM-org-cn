# ICP 备案变更与恢复记录

记录日期：2026-10-13（Asia/Hong_Kong）。依据：用户转述的服务商反馈与本次截图要求。当前是本地工作区状态，未上线；不要把该记录理解为审核已经通过。

## 第一轮：站名与编号

| 文件 | 原值 | 当前值 / 动作 |
| --- | --- | --- |
| `docusaurus.config.js` 的 `title`、`themeConfig.navbar.title` | 皇家太医院 | 苏州知轶互联网工作室 |
| `src/pages/index.js` 的首页 h1、description | 旧站名 | 工作室全称；描述其余内容保留 |
| `src/components/HomepageFeatures/index.js` | 三处旧站名 | 工作室全称（备用组件） |
| `config/search/zh-user-dict.txt` | 旧站名词条 | 工作室全称 |
| `src/theme/Footer/index.js` | 苏ICP备2024061225号-2 | 苏ICP备2024061225号；查询链接保留，注释内示例同步 |
| `src/pages/index.module.css` | h1 `clamp(3.4rem, 9vw, 7.5rem)`；手机 `clamp(3rem, 15vw, 4.5rem)` | `clamp(2rem, 6vw, 5rem)`；手机 `clamp(1.5rem, 6vw, 2.4rem)`，容纳更长名称 |

编号格式修改是本次服务商反馈的执行，不声称全国所有备案号都禁止网站序号。主体、域名与实际编号归属尚须用户在工信部系统核对；不能为了恢复样式自行更改备案号码。

## 第二轮：截图内容临时隐藏、介绍删除

新增 `config/homepage-visibility.js`，默认 `showStatement: false`、`showProducts: false`。`src/pages/index.js` 通过条件渲染，不把相关区块输出到首页 HTML；原组件、文字和样式保留，便于恢复。

截图全部区块的对应关系：

- `showStatement` 控制“传承精华 守正创新”标题及其下整段介绍。
- `showProducts` 控制整个产品区：Knowledge、文档大标题及介绍、两个入口按钮、十列中医文字视觉，以及下方文档、博客、文学、百科四张卡片的标题、介绍与按钮。

首页顶部工作室名称、WeTCM、阅读和博客入口、医/文/理装饰，以及全站导航和页脚保留；这些不在用户截图范围内。栏目本身、评论和百科服务未停用；本次不是全站内容下线。

从首页删除句子：“不仅是一个安静、清晰、可持续整理的中医知识站。” 原位置在 h1 后、入口按钮前，是 `<p className={styles.heroSubtitle}>`。这项是删除，不随区块开关自动恢复。

页脚 `Copyright © {year} WeTCM.` 更新为 `Copyright © {year} 苏州知轶互联网工作室.`，依阿里云 [江苏备案规则](https://help.aliyun.com/zh/icp-filing/icp-filing-regulations-for-jiangsu/) 对版权主体与备案单位一致的要求；此项不是临时隐藏。

## 恢复操作

用户决定恢复展示后，将两个开关改为 `true`；也可以只恢复其中一个。然后执行：

```powershell
npm.cmd run build
node scripts/verify-icp-homepage.cjs
npm.cmd run serve
```

验证脚本会根据实际开关检查首页区块有无输出。检查手机与桌面页面，按 [部署说明](deployment.md) 发布并核实线上。恢复前先复核 [内容风险](icp-review.md)，使实际服务与备案申报一致，不把审核完成视为恢复未经授权内容的许可。

如确需恢复被删除的介绍，按上方原句和原位置新增段落，并同步修改验证脚本的“介绍删除”断言。恢复旧品牌要明确取得用户决定并核实名称/商标与备案变更要求；按表逐项恢复引用和字号，更新验证脚本中的当前名称。页脚主体和编号按当时真实备案信息处理，不机械回退。

## 验证记录

第一轮 `npm.cmd run build` 成功，生成的 70 个含页脚页面显示新名称与无后缀编号。第二轮构建和验证脚本通过，70 个页面的站名、编号、版权主体及查询链接检查通过。两个开关同时打开后的恢复构建也验证通过，随后重新关闭并构建，最终产物保持隐藏状态。8 篇草稿的 URL、日期/本地搜索索引及页面链接检查通过，内部文档未进入公开构建。未做浏览器视觉验证。

构建存在 25 个路径的内容 HTML 格式警告，以及 Browserslist / 更新检查提示；未将构建成功视为合规通过证明。详细过程见 `.agents/plans/2026-10-13-icp-preparation.md`。
