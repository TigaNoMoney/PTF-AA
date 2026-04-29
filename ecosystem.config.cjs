/** PM2 进程配置 — 请将服务跑在仓库根目录，以保证能正确解析 `client/dist` 与 `server/template`。 */
const path = require("path");

module.exports = {
  apps: [
    {
      name: "ptf-aa",
      cwd: __dirname,
      script: path.join(__dirname, "server", "src", "index.js"),
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: "3001",
      },
    },
  ],
};
