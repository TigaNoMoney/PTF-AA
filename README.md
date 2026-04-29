# PTF-AA

Program Transfer Form（PTF）填表与 **Word 导出**：Vue 3 前端 + Express 后端；母版使用 [docxtemplater](https://docxtemplater.com/) 占位符生成 `.docx`，可选打包为含 **change ticket** 目录结构的 `.zip`。

---

## 技术栈

|        | 说明                                      |
| ------ | ----------------------------------------- |
| 前端   | Vue 3、Vite、Ant Design Vue               |
| 后端   | Express、`docxtemplater`、ZIP（`archiver`） |
| 母版   | `server/template/template.docx`           |

---

## 本地运行

**环境**：Node.js 18+（建议 LTS）。

```bash
cd <仓库根目录>
npm install
npm run dev
```

- **前端**：<http://localhost:5173>（Vite）
- **后端**：<http://localhost:3001>，`/api/*` 由 Vite **代理**到该端口（见 `client/vite.config.js`）

等价于并行执行 `npm run dev -w client` 与 `npm run dev -w server`。

**健康检查**：`GET http://localhost:3001/api/health`

**常见问题**：根目录需安装 `concurrently`；若端口被占用，可 `PORT=3002 npm run dev -w server` 并重配 Vite proxy 中 `target`。

---

## 生产部署

1. **构建前端**（输出到 `client/dist`）：

   ```bash
   npm run build
   ```

2. **启动服务**：见下方 **[PM2（推荐）](#生产环境推荐的运行方式)**，或直接使用 Node：
   **`npm run start`**（等价于在工作区根目录拉起 `server`）。

   存在 `client/dist` 时，Express **同机托管**静态资源并 `index.html` fallback；API 仍为 `POST /api/generate` 等。

3. **端口**：默认 `PORT=3001`，生产可改环境变量或通过 PM2 `env`。

4. **前后端不同域时**：构建前端前设置 `VITE_API_BASE` 为后端完整源（如 `https://api.example.com`），详见 `client/src/api.js`。服务器已 `cors({ origin: true })`。

5. **母版文件**：部署机上必须有可读 `server/template/template.docx`，否则会生成失败。

### 生产环境推荐的运行方式：PM2

先执行 **`npm run build`** 生成 `client/dist`，并确认 **`server/template/template.docx`** 已部署。

在项目**根目录**（与本文档、`ecosystem.config.cjs` 同级）：

```bash
npm install -g pm2   # 或按团队规范本地安装 pm2-cli
npm run build
npm run pm2:start      # 等价于 pm2 start ecosystem.config.cjs；未装 pm2-cli 时可用 npx pm2 start ecosystem.config.cjs
```

常用运维命令：

```bash
pm2 status              # 状态
pm2 logs ptf-aa          # 日志
pm2 restart ptf-aa       # 重启（改代码或换母版后）
pm2 save                 # 保存进程列表（配合开机自启）
pm2 startup              # 按提示写入 systemd / launchd
```

按需改端口可执行 `PORT=8080 pm2 start ecosystem.config.cjs`（或编辑 `ecosystem.config.cjs` 内 `env.PORT`）。

配置见根目录 **`ecosystem.config.cjs`**：`cwd` 指向仓库根，以便程序找到 `client/dist` 与 `server/template`。

---

## Word 母版与占位符

占位符为**半角单花括号** `{变量名}`；表格多行用 `{#rows}…{/rows}` 包住**整行**。变量名与表单 JSON 对齐。

**完整说明与字段列表**（标量、循环、实施步骤 `deploymentRows` 等）→ 见：

**[`server/template/PLACEHOLDERS.txt`](server/template/PLACEHOLDERS.txt)**

Word 常把占位符拆成多个 XML 文本段，项目在 `server/src/normalizeDocxXml.js` 中合并后再交给 docxtemplater，一般无需改代码。

---

## 下载行为摘要

| 操作           | 说明 |
| -------------- | ---- |
| 默认           | 浏览器下载 `PROD-PTF-AA-<后缀>.docx` |
| 勾选「创建 change ticket 文件夹」 | 下载 `.zip`：内含 `PTF/<docx>`；`change ticket/<CHG ID>/` 下为各阶段文件夹（CHG ID 取自 **ITSR / PRB** 表单项 `chgId`，去重）；无 CHG 时用占位名 `NO_CHG_ID` |

---

## 仓库结构（简要）

```
ecosystem.config.cjs   # PM2（生产常驻）
client/          # Vue 应用与 Vite 配置
server/
  src/           # Express、`generatePtf.js`、`normalizeDocxXml.js`、`zipChangeTicketBundle.js`
  template/      # template.docx、PLACEHOLDERS.txt
```

---

## 与子文档的关系

- **`client/README.md`**：仅存 Vue/Vite 脚手架入口说明；**本仓库业务以本文档为准**。
- **`.claude/skills/**`**：与编辑器技能相关，**不属于**本应用运行/部署文档。
