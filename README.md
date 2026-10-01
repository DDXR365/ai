# 人工智能发展史 · 静态网站

一个介绍 AI 发展史的纯静态科普站点。**无任何外部依赖**（不含 CDN、字体、图片资源），
直接用浏览器打开 `index.html` 即可浏览，也可部署到任意静态托管服务。

当前状态：**🚀 已正式上线 → https://ai-history-guide.pages.dev**（国内可直连，无需代理）

---

## 一、站点结构

| 文件 | 内容 |
| --- | --- |
| `index.html` | 首页：AI 的三种定义视角、八个发展阶段、算法/算力/数据三大驱动力（含算力量级条形图）、三大流派对比 |
| `timeline.html` | 发展时间轴：1943–2025 共 **67 个节点**，9 个分类，16 个节点带可展开细节，支持筛选与搜索 |
| `pioneers.html` | 关键人物：21 位研究者卡片；技术谱系 G1–G8；十篇里程碑文献表 |
| `future.html` | 当下与未来：能力边界、六个挑战、五条技术走向、AGI 三种立场、延伸阅读 |
| `404.html` | 自定义错误页（Cloudflare Pages 会自动使用根目录的 `404.html`） |
| `robots.txt` | 搜索引擎抓取规则 + sitemap 声明 |
| `sitemap.xml` | 站点地图（4 个页面） |
| `_headers` | Cloudflare Pages 自定义响应头：安全头、缓存策略、预览域名禁收录 |
| `assets/css/style.css` | 全部样式（设计令牌 + 组件 + 响应式 + 打印 + 无障碍） |
| `assets/js/main.js` | 全部脚本，原生 JS，无依赖 |
| `assets/og-cover.png` | 社交分享缩略图（1200×630），被 `og:image` / `twitter:image` 引用 |
| `assets/og-card.html` | **工具页**：同款分享图的 HTML 版本，改动设计后可重新导出 |

## 二、占位域名替换（✅ 已完成）

上线前站点用 IANA 保留域名 `ai-history.example` 作占位符。**上线时已全部替换为
`ai-history-guide.pages.dev`，共 34 处**，替换脚本见 `ai-history-tools/set-domain.js`：

| 文件 | 处数 | 位置 |
| --- | ---: | --- |
| `index.html` | 6 | canonical / og:url / og:image / twitter:image / JSON-LD url |
| `timeline.html` | 7 | 同上 + JSON-LD `isPartOf.url` |
| `pioneers.html` | 7 | 同上 |
| `future.html` | 7 | 同上 |
| `sitemap.xml` | 5 | 4 个 `<loc>` + 注释 |
| `robots.txt` | 2 | `Sitemap:` 行 + 注释 |
| **合计** | **34** | |

> **站点内置部署自检**：若 `canonical` 仍含保留顶级域 `.example`，页面底部会弹出红色警告条。
> 现已确认不再触发 —— `assets/js/main.js` 里的判断在换成真实域名后自动失效，不需要改代码。
> 这套机制的价值在于：把「忘了改域名」这种静默的 SEO 事故，变成一个看得见的错误。

**社交分享图已生成**：`assets/og-cover.png`（1200×630，124 KB），无需再手动导出。
日后若修改品牌名或配色，可重新生成：

```bash
python ai-history-tools/make_og_cover.py
```

（也可以改 `assets/og-card.html` 后按顶部注释用浏览器截图导出，两条路等价。）

仍需你决策的一件事：

- **重命名品牌**：站点当前品牌名是「人工智能发展史」。若官网另有正式名称，
  需统一替换 5 个页面的 `<title>`、`og:site_name`、页脚与导航中的站点名。

## 三、部署现状与更新方式（✅ 已上线）

**正式地址：<https://ai-history-guide.pages.dev>**

| 项目 | 现状 |
| --- | --- |
| 托管 | Cloudflare Pages，项目名 `ai-history-guide` |
| 部署方式 | **Direct Upload（直接上传）**，未使用 Git 集成 |
| 部署源目录 | `ai-history-tools/dist/`（由 `make-dist.ps1` 生成，已剔除 `.git`） |
| 认证方式 | Cloudflare API 令牌，权限 `帐户 : Cloudflare Pages : 编辑` |
| 安全响应头 | ✅ 5 项全部生效（配置见 `_headers`） |
| 国内可访问性 | ✅ 实测 HTTP 200，响应 200–1400ms |
| 备案 | **不需要**（`pages.dev` 域名，托管在境外） |
| 成本 | 域名 ¥0（用平台域名）+ 托管 ¥0 = **¥0/年** |

### 为什么没用 GitHub

| 障碍 | 实测结果 |
| --- | --- |
| GitHub 网页在国内 | ❌ HTTPS 15 秒无响应，无法在浏览器里登录、加 SSH 密钥或建仓库 |
| 本机 SSH 密钥 | ❌ 未注册到任何 GitHub 账号，推送必然 `Permission denied (publickey)` |
| wrangler OAuth 授权 | ❌ 授权窗口硬性只有 120 秒（日志实测 `durationMs: 120058`），两次均超时 |

### 更新站点的完整流程

```powershell
# 1) 编辑 ai-history/ 下的文件
# 2) 重新生成干净部署目录（自动剔除 .git，并做安全检查）
powershell -File ai-history-tools\make-dist.ps1
# 3) 部署
$env:CLOUDFLARE_API_TOKEN  = "<你的令牌>"
$env:CLOUDFLARE_ACCOUNT_ID = "0965b1a2dc6b9275bf67fd9a99531d02"
cd ai-history-tools
.\wrangler-env\node_modules\.bin\wrangler.CMD pages deploy dist --project-name=ai-history-guide --branch=main
```

> 令牌可在 <https://dash.cloudflare.com/profile/api-tokens> 随时删除，删除后立即失效。
> 若不想保留自动部署能力，也可以在控制台手动上传 `AI历史网站-上传用.zip`。

### 源码云端备份（GitHub）

| 项目 | 值 |
| --- | --- |
| 仓库 | <https://github.com/DDXR365/ai>（公开） |
| 分支 | `main`，1 条干净的初始提交（作者 `DDXR365`，noreply 邮箱） |
| 认证 | Fine-grained PAT，需要 `Contents: Read and write` 权限 |

**为什么不用 `git push`**：`github.com` 的网页与 HTTPS 推送通道在国内**时通时断**
（实测同一分钟内既有 15 秒超时，也有 300ms 正常），而 `api.github.com` 一直稳定在 250–350ms。
因此推送改为走 **Git Data API**，工具是 `ai-history-tools/gh-sync.js`：

```powershell
$env:GH_TOKEN = "<你的 GitHub 令牌>"
node ai-history-tools\gh-sync.js DDXR365 ai ai-history "本次更新的说明"
```

该脚本以远端 `main` 为父提交做**增量**提交，内容无变化时自动跳过，并能识别本地已删除的文件。

> 本地 git 仓库的 `origin` 已指向同一地址，两边内容一致。若日后 GitHub 通道恢复稳定，
> 直接 `git push` 也可以。

### 重要：`workers.dev` 在国内被封，必须用 `pages.dev`

上线过程中实测确认（这决定了几次返工）：

| 域名 | DNS 解析 | TLS 握手 | 结论 |
| --- | --- | --- | --- |
| `*.workers.dev` | ❌ 四个 DNS 返回四个不同 IP（含 Facebook IP 段） | ❌ 连可用 Cloudflare IP 也被 `ECONNRESET` | **DNS 污染 + SNI 阻断，国内完全不可用** |
| `*.pages.dev` | ✅ 各 DNS 一致 | ✅ 握手成功 | **国内可正常访问** |
| `cloudflare.com` | ✅ 一致 | ✅ 成功 | Cloudflare 本身未被封 |

**结论：部署到 Cloudflare 时，必须选 Pages（`pages.dev`），不要选 Workers（`workers.dev`），
否则会得到一个自己都打不开的网站。**

---

## 附：备选部署方案（GitHub + Cloudflare Pages 自动部署，当前未采用）

### 1) 版本管理（✅ 已完成）

Git 已安装（Git for Windows **2.55.0.5**，路径 `C:\Program Files\Git\cmd\git.exe`），
仓库已初始化于 `ai-history/`，分支 `main`，首次提交包含 15 个文件、3061 行。

> 仓库**刻意建在 `ai-history/` 内部**，而不是工作区根目录 —— 根目录还有 `bench`、`cg_bench`、
> `github-fix`、`log-inspect`、`scripts`、`ollama-deployment-notes.md` 等无关项目，
> 在根目录建仓会把它们一起卷进站点仓库。

Windows 上 git 默认 `core.autocrlf=true`（检出时转 CRLF），而本站部署在 Linux 环境，
因此通过 `.gitattributes` 强制 LF 换行。全部文件经确认为纯 LF。

**⚠️ 待办：提交作者身份仍是临时值。** 首次提交用的是 `Administrator <administrator@localhost>`，
推送前应改成你自己的（该提交尚未推送，改动无副作用）：

```bash
cd ai-history
git -c user.name="你的名字" -c user.email="你的邮箱" commit --amend --reset-author --no-edit
```

### 2) 推送到 GitHub

在 GitHub 新建一个仓库（Public / Private 均可，Cloudflare Pages 两者都支持），然后：

```bash
git remote add origin <仓库地址>
git push -u origin main
```

> **⚠️ 认证方式（本机实测结论）**：`~/.ssh/id_ed25519` 这个密钥**尚未注册到任何 GitHub 账号**，
> 直接走 SSH 推送会报 `Permission denied (publickey)`。三选一：
> 1. **把公钥加到 GitHub**（推荐，一次配置长期免密）—— 公钥可用下面命令随时打印，
>    不要把它写进本文件（README 会随站点公开部署）：
>    ```powershell
>    Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub
>    ```
> 2. **HTTPS + Personal Access Token** —— 仓库地址用 `https://github.com/...`，密码处填 token
> 3. **GitHub Desktop** —— 用浏览器登录，自动处理认证
>
> 另注：`~/.ssh/config` 已把 `github.com` 指向 `ssh.github.com:443`。这是之前诊断出
> HTTPS 存在间歇性干扰后写入的配置，**建议保留**。

> **重要**：请让**仓库根目录就是站点根目录**（即 `index.html` 直接位于仓库根）。
> 如果站点被放在子目录里，下面第 3 步的「构建输出目录」要相应填写子目录名。

### 3) 连接 Cloudflare Pages

1. 登录 Cloudflare → 左侧 **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. 授权 GitHub，选择刚才的仓库
3. 构建设置（本项目无构建步骤，按下面填）：
   - **Framework preset**：`None`
   - **Build command**：留空
   - **Build output directory**：`/`
4. **Save and Deploy**
5. 部署完成后会得到一个 `https://<项目名>.pages.dev` 地址 —— **此时网站已经可以公开访问了**

### 4) 绑定自己的域名

1. 购买域名（Cloudflare Registrar 按成本价销售、无加价；Namecheap / 阿里云等亦可）
2. 在 Cloudflare **添加站点**，按提示把域名的 NS 记录改到 Cloudflare
3. 回到 Pages 项目 → **Custom domains** → 添加你的域名（建议同时加 `www` 与裸域）
4. HTTPS 证书由 Cloudflare 自动签发，无需操作

### 5) 替换占位域名并重新部署

按第二节的清单替换全部 28 处 `ai-history.example`，然后：

```bash
git add -A
git commit -m "替换为正式域名"
git push
```

Cloudflare Pages 会自动重新部署。部署完成后刷新页面，**底部的红色警告条应当消失**。

### 6) 提交给搜索引擎

1. [Google Search Console](https://search.google.com/search-console) → 添加资源 → 用 DNS TXT 或 HTML 文件验证
2. 提交 `https://你的域名/sitemap.xml`
3. 同样操作 [Bing Webmaster Tools](https://www.bing.com/webmasters)（Bing 可直接从 GSC 导入）
4. 分享图更新后，用 [Facebook 调试工具](https://developers.facebook.com/tools/debug/) 刷新缓存，
   否则平台可能仍显示无图卡片

**成本汇总：域名约 ¥60–100/年，托管、HTTPS、CDN 全部 ¥0。**

## 四、上线后验证清单

### A. 浏览器验收

**已由我实测完成**（Edge 154 无头浏览器，截图存档在 `ai-history-tools/screenshots/`）：

- [x] 5 个页面全部实际渲染成功，无空白页、无脚本报错
      （JS 注入的 `aria-current="page"` 与页脚年份均正确写入 —— 若脚本中途抛错，这两项会缺失）
- [x] 1440px 桌面端：首页、时间轴、人物、未来、404 五页布局全部正常
- [x] 375px 手机端（用 iframe 构造真实媒体查询视口）：时间轴正确切换为单侧布局、
      筛选条折成 4 行、搜索框占满宽度、汉堡菜单出现
- [x] **各断点无横向溢出**：脚本遍历整棵 DOM 检测越界元素，330 / 492 / 796 / 1256px 四档均为 0 处
- [x] 时间轴左右交替、中线、按分类着色的节点全部正常
- [x] 跳过导航链接聚焦后可见
- [x] 「减少动效」偏好下动画关闭，统计数字直接显示终值（`80+`）

> 过程中修掉一个真实缺陷：窄屏下主标题会折出孤字「型」，已调整 `clamp()` 参数修正。

**仍需你用真实设备复核**（无头浏览器覆盖不到的部分）：

- [ ] **Firefox 与 Safari** —— 尤其 Safari，`backdrop-filter` 与 `:focus-visible` 的实现有差异
- [ ] **真实手机**上打开一次（iframe 只能模拟视口宽度，不能模拟触控与真实 GPU）
- [ ] 时间轴交互：逐个点击 9 个筛选标签，核对条目数是否为
      **全部 67 / 思想奠基 7 / 诞生与探索 13 / 寒冬 5 / 专家系统 6 / 统计学习 6 / 深度学习 10 / 大模型 6 / 推理时代 8 / 中国线 6**
- [ ] 时间轴搜索：分别搜 `寒冬`、`Transformer`、`中国`；按 `Esc` 能否清空
- [ ] 键盘 `Tab` 走一遍完整路径，确认每个可聚焦元素焦点框清晰
- [ ] 把链接发到微信 / X / LinkedIn，确认卡片标题、描述、缩略图正确

### B. 部署后验证

- [ ] 访问一个不存在的路径（如 `/abc`），确认显示自定义 404 页面而非平台默认页
- [ ] 访问 `/robots.txt` 与 `/sitemap.xml`，确认内容正确、域名已替换
- [ ] 查看响应头，确认 `Content-Security-Policy` 等已生效（配置见 `_headers`）
- [ ] **若页面出现样式错乱或脚本失效，多半是 CSP 过严** —— 把 `_headers` 重命名为 `_headers.off`
      重新部署即可临时关闭，再逐条排查
- [ ] 把链接发到微信 / X / LinkedIn，确认卡片标题、描述、缩略图正确
- [ ] 确认 `xxx.pages.dev` 预览域名未被搜索引擎收录（`_headers` 已配置，需绑定自定义域名后生效）

## 五、已内置的工程项

- **SEO**：canonical、og / twitter 卡片、JSON-LD 结构化数据（`WebSite` / `WebPage`）、sitemap、robots
- **无障碍**：跳转主内容链接、高对比 `:focus-visible` 焦点样式、`aria-current` 当前页标记、
  时间轴计数 `aria-live` 播报、`aria-controls` 抽屉关联、适配 `prefers-reduced-motion`
- **安全与性能**：CSP、`X-Content-Type-Options`、`Referrer-Policy`、`X-Frame-Options`、`Permissions-Policy`；
  静态资源一年强缓存 + HTML 不缓存
- **防错**：域名占位符自检警告条（已在 HTTP 环境下实测确认会触发）
- **自动化校验 0 错误**：`ai-history-tools/verify.py` 会检查内部链接、本地资源、重复 `id`、
  每页 `h1` 数量、sitemap 可解析性、时间轴分类与筛选按钮一致性、年份单调性、
  `_headers` 缓存规则冲突、无障碍元素是否齐全。报告见 `ai-history-tools/verify-report.txt`。

## 六、开发与验收工具（位于站点目录之外，不参与部署）

`../ai-history-tools/` 不属于站点，不会被推送到 GitHub、也不会被部署。上线后仍然有用：

| 文件 | 用途 |
| --- | --- |
| `verify.py` | 静态校验脚本。**每次改完内容跑一次**：`python verify.py`（退出码非 0 即有错误），结果写入 `verify-report.txt` |
| `make_og_cover.py` | 重新生成 `assets/og-cover.png` 分享图（改品牌名或配色后需要） |
| `frame.html` | 窄屏验收容器：Windows 无头浏览器最小视口约 492px，把页面放进 iframe 才能拿到真实的 375px 布局 |
| `diag.js` | 布局尺寸与横向溢出探测脚本，配合上面的容器使用 |
| `screenshots/` | 各断点验收截图存档 |

## 七、内容与二次修改

- 改颜色：编辑 `assets/css/style.css` 顶部 `:root` 中的设计令牌
- 加时间轴条目：在 `timeline.html` 的 `<ol id="timeline">` 中追加 `<li class="tl-item" data-cat="分类">`；
  `data-cat` 取值需与筛选按钮一致（可选项：`seed` `birth` `winter` `boom` `stat` `dl` `llm` `now` `china`）；
  左右交替由脚本自动分配，无需手动指定
- 加分类：在筛选栏添加 `<button class="chip" data-cat="新分类">`，并在 `style.css` 中按需定义颜色
- **年份口径**：统一采用「对公众与学界影响最大的那一年」，奖项按公布年份标注
- **算力条形图**为量级估算（对数刻度），用于展示增长趋势，不同机构口径差异很大，不宜作为精确数值引用

## 八、技术演进触发条件（现在不要提前做）

| 触发条件 | 才做的事 |
| --- | --- |
| 时间轴 > 150 条 | 引入 SSG（Astro / Eleventy），Markdown 写内容，产物仍是纯静态 |
| 有第二个人要改内容 | Git-based CMS（Decap CMS，无需后端） |
| 出现账号 / 评论 / 站内检索需求 | 才考虑后端 |

**不要为了「看起来现代」引入服务器或框架。** 纯静态当前的价值是：零运维、零攻击面、成本上限约 ¥100/年。
