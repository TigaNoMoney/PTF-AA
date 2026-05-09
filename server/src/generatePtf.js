import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { normalizeDocumentXmlForDocxtemplater } from "./normalizeDocxXml.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = path.join(__dirname, "..", "template", "template.docx");

/**
 * 使用 docx 母版 + docxtemplater 占位符生成文档。
 * 若母版中没有任何 {…} 占位符，输出与母版相同——必须在 Word 里填写 docxtemplater 单花括号占位符。
 * 详见 server/template/PLACEHOLDERS.txt
 */
export async function generatePtf(payload) {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    const hint =
      "未找到母版: server/template/template.docx。请将你现有的 PROD-PTF-AA-*.docx 复制为该路径，并在 Word 中把可变内容改为 docxtemplater 占位符。";
    throw new Error(hint);
  }

  const content = fs.readFileSync(TEMPLATE_PATH);
  const zip = new PizZip(content);
  const pathDoc = "word/document.xml";
  if (zip.files[pathDoc]) {
    const raw = zip.files[pathDoc].asText();
    zip.file(pathDoc, normalizeDocumentXmlForDocxtemplater(raw));
  }
  // 默认定界符为单花括号 {varName}，与母版、docxtemplater 默认一致
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  const data = buildTemplateData(payload);
  doc.render(data);

  return doc.getZip().generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  });
}

/** 与母版「三选一复选」一致：选中为 ☒，未选为 ☐ */
function buildEnvironmentLine(env) {
  const e = (env || "").trim();
  const mark = (v) => (e === v ? "☒" : "☐");
  return `${mark("UAT")} UAT   ${mark("Regression")} Regression   ${mark("Production")} Production`;
}

/**
 * 与母版「Expected Start/Completion | 日期 | 时间 |」三列一致。
 * 网页存的是 "YYYY-MM-DD HH:mm"（与 Ant Design 日期时间选择器一致）。
 */
function splitDateTime(s) {
  if (s == null || String(s).trim() === "") {
    return { date: "", time: "" };
  }
  const t = String(s).trim();
  const m = t.match(/^(\d{4}-\d{1,2}-\d{1,2})[ T](\d{1,2}:\d{2})$/);
  if (m) {
    return { date: m[1], time: m[2] };
  }
  return { date: t, time: "" };
}

/**
 * 与母版 Timing / Deployment 表「Deployment Steps」列固定那几行一致；
 * 与网页 implementationSteps[0]…[4] 按行对齐：Remarks / Action by / Start Time / Estimation 来自对应行。
 * 第 1 列 step 不读表单里的 step 字段，始终用下面固定文案（便于 Word 用 {#deploymentRows}{step}{/} 循环）。
 */
const FIXED_DEPLOYMENT_STEPS = [
  "DB Script Deployment Plan",
  "File Transfer/Setup",
  "Critical Milestone(s)",
  "Post Implementation Checks",
  "Rollback Plan & Checks",
];

function buildDeploymentRows(userSteps) {
  const rows = Array.isArray(userSteps) ? userSteps : [];
  const merged = FIXED_DEPLOYMENT_STEPS.map((step, i) => {
    const u = rows[i] || {};
    return {
      step,
      remarks: (u.remarks != null && String(u.remarks).trim() !== "" ? u.remarks : u.step) || "",
      actionBy: u.actionBy != null ? String(u.actionBy) : "",
      startTime: u.startTime != null ? String(u.startTime) : "",
      estimation: u.estimation != null ? String(u.estimation) : "",
    };
  });
  const extra = rows.slice(FIXED_DEPLOYMENT_STEPS.length).map((u, j) => ({
    step: (u.step && String(u.step).trim()) || `Other (${j + 1})`,
    remarks: (u.remarks != null && String(u.remarks).trim() !== "" ? u.remarks : "") || "",
    actionBy: u.actionBy != null ? String(u.actionBy) : "",
    startTime: u.startTime != null ? String(u.startTime) : "",
    estimation: u.estimation != null ? String(u.estimation) : "",
  }));
  return merged.concat(extra);
}

/**
 * 将 Estimation 字段提取为数字（取第一个连续数字，如 "3" "3h" "2.5 hours"）。
 * 无数字则计 0，用于 Grand Total 统计（与前端预览逻辑保持一致）。
 */
function parseEstimationToNumber(v) {
  if (v == null) return 0;
  const s = String(v).trim();
  if (s === "") return 0;
  const m = s.match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : 0;
}

function buildTemplateData(body) {
  const contacts = body.contacts || {};
  const jira = body.jira || {};
  const environment = (body.environment || "").trim();
  const startSplit = splitDateTime(body.expectedStart);
  const endSplit = splitDateTime(body.expectedEnd);
  const deploymentRows = buildDeploymentRows(body.implementationSteps);
  const estimationGrandTotal = deploymentRows.reduce(
    (sum, row) => sum + parseEstimationToNumber(row && row.estimation),
    0
  );
  const estimationGrandTotalDisplay = Number.isFinite(estimationGrandTotal)
    ? estimationGrandTotal % 1 === 0
      ? String(estimationGrandTotal)
      : String(Math.round(estimationGrandTotal * 100) / 100)
    : "0";

  return {
    // 标量：在 Word 里写 {{environment}}、{{appName}} 等
    environment,
    // 复选行：在 Word 里整行只放一个 {{environmentLine}} 即可（或见下方 envUat 等条件）
    environmentLine: buildEnvironmentLine(environment),
    envUat: environment === "UAT",
    envRegression: environment === "Regression",
    envProduction: environment === "Production",
    appName: body.appName || "",
    /** 整段仍可用；表格拆开请用 date / time 四个字段 */
    expectedStart: body.expectedStart || "",
    expectedEnd: body.expectedEnd || "",
    expectedStartDate: startSplit.date,
    expectedStartTime: startSplit.time,
    expectedEndDate: endSplit.date,
    expectedEndTime: endSplit.time,
    fileNameSuffix: body.fileNameSuffix || "",
    postChecks: body.postChecks || "",
    rollback: body.rollback || "",

    // 扁平化，避免在 Word 里写带点的变量名（部分环境更稳）
    contactsWintel: contacts.wintel || "",
    contactsDba: contacts.dba || "",
    jiraAaWeb: jira.aaWebRollback || "",
    jiraAaApi: jira.aaApiRollback || "",
    // 与部分母版中拼写一致（RollBack 驼峰）
    jiraAaWebRollBack: jira.aaWebRollback || "",
    jiraAaApiRollBack: jira.aaApiRollback || "",

    // 仍保留对象，便于进阶或自定义母版用 {{contacts.xxx}}（若你启用了相应解析器）
    contacts: { ...contacts },
    jira: { ...jira },

    // 数组：配合循环，见 PLACEHOLDERS.txt
    itsrRows: Array.isArray(body.itsrRows) ? body.itsrRows : [],
    pipelines: Array.isArray(body.pipelines) ? body.pipelines : [],
    staticFiles: Array.isArray(body.staticFiles) ? body.staticFiles : [],
    dbScripts: Array.isArray(body.dbScripts)
      ? body.dbScripts.map((row, i) => ({ ...row, seq: i + 1 }))
      : [],
    /** 原始 5+ 行，step 为表单填写；若母版要固定第 1 列，请用 deploymentRows 循环，不要用本数组 */
    implementationSteps: Array.isArray(body.implementationSteps)
      ? body.implementationSteps
      : [],
    /** 固定 Deployment Step 列 + 与表单行顺序对齐的数据；Word 用 {#deploymentRows}…{/deploymentRows} */
    deploymentRows,

    // Estimation 统计：Word 可直接用 {{estimationGrandTotalDisplay}} 或 {{estimationGrandTotal}}
    estimationGrandTotal,
    estimationGrandTotalDisplay,
  };
}
