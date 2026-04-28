import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { generatePtf } from "./generatePtf.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.join(__dirname, "..", "..", "client", "dist");

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// 开发时 Vite(5173) 调本机 API；同域生产构建无预检。reflect origin 同时覆盖两种场景。
app.use(cors({ origin: true }));
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "ptf-aa-server" });
});

app.post("/api/generate", async (req, res) => {
  try {
    const buffer = await generatePtf(req.body);
    const suffix = (req.body?.fileNameSuffix || "Wintel,DBA").replace(/[<>:"/\\|?*]/g, "-");
    const fileName = `PROD-PTF-AA-${suffix}.docx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "生成失败" });
  }
});

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

const server = app.listen(PORT, () => {
  console.log(`PTF server http://localhost:${PORT}`);
  console.log(`  template: ${path.join(__dirname, "..", "template", "template.docx")}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `[ptf-server] 端口 ${PORT} 已被占用，无法启动。` +
        ` 可先执行: lsof -i :${PORT}  再结束对应进程(例如: kill <PID>)。` +
        ` 或换端口: PORT=3002 npm run dev -w server`
    );
  } else {
    console.error(err);
  }
  process.exit(1);
});
