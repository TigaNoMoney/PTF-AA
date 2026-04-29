import archiver from "archiver";

/** 每个 CHG ID 文件夹下固定的子文件夹名称（阶段 sign off）。 */
export const CHANGE_TICKET_SUBFOLDERS = [
  "FDS & Sign off",
  "Regression & Sign off",
  "SIT & signoff",
  "TDS & TIS & Sign off",
  "UAT & Sign off",
  "UR & Sign off",
];

/**
 * ITSR/PRB（Section 2）里填写的 CHG ID：去重、保序、去空。
 * @param {unknown} itsrRows
 * @returns {string[]}
 */
export function uniqueChgIdsFromItsRows(itsrRows) {
  if (!Array.isArray(itsrRows)) return [];
  const seen = new Set();
  const out = [];
  for (const row of itsrRows) {
    const id =
      row && row.chgId != null ? String(row.chgId).trim() : "";
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

/** CHG ID → ZIP 内文件夹名（禁止路径分隔等字符） */
function safeChgFolderName(chgId) {
  const s = String(chgId || "")
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  return s || "NO_CHG_ID";
}

/**
 * 多个 CHG 经 sanitize 后重名时在 ZIP 中加后缀区分。
 */
function folderNamesForChgIds(uniqueRawIds, emptyFallbackFolder) {
  if (uniqueRawIds.length === 0) {
    return [emptyFallbackFolder];
  }
  const used = new Set();
  return uniqueRawIds.map((raw) => {
    const base = safeChgFolderName(raw);
    let name = base;
    let i = 2;
    while (used.has(name)) {
      name = `${base}_${i++}`;
    }
    used.add(name);
    return name;
  });
}

/**
 * ZIP 顶层根文件夹名中的一段 sanitize（与下载文件名后缀规则一致）。
 */
function safeSuffixSegment(segment) {
  return (
    String(segment || "")
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
      .replace(/[\s.]+$/g, "")
      .trim() || "export"
  );
}

/**
 * 打包：PTF／docx；change ticket／下每个 CHG ID 一节（来自 ITSR/PRB Section 2），节内各阶段子文件夹。
 *
 * @param {Buffer} docxBuffer 已生成的 PTF Word
 * @param {{ sanitizedSuffix?: string, fileNameSuffix?: string, itsrRows?: unknown }} [opts]
 */
export function buildChangeTicketZipBuffer(docxBuffer, opts = {}) {
  const suffixRaw = opts.fileNameSuffix ?? "Wintel,DBA";
  const suffix =
    opts.sanitizedSuffix != null && opts.sanitizedSuffix !== ""
      ? String(opts.sanitizedSuffix)
      : safeSuffixSegment(suffixRaw);
  const docxFileName = `PROD-PTF-AA-${suffix}.docx`;
  /** 解压后的「大文件夹」名称 */
  const rootFolder = `PROD-PTF-AA-${suffix}`;

  const rawChgIds = uniqueChgIdsFromItsRows(opts.itsrRows);
  /** 无任何 CHG 时仍生成一棵占位树，解压后改名即可 */
  const chgFolderNames = folderNamesForChgIds(rawChgIds, "NO_CHG_ID");

  return new Promise((resolve, reject) => {
    /** @type {Buffer[]} */
    const chunks = [];
    const archive = archiver("zip", { zlib: { level: 5 } });

    archive.on("data", (chunk) => chunks.push(chunk));
    archive.once("error", reject);
    archive.on("end", () => resolve(Buffer.concat(chunks)));

    archive.append(docxBuffer, {
      name: `${rootFolder}/PTF/${docxFileName}`,
    });

    for (const chgDir of chgFolderNames) {
      const ctPrefix = `${rootFolder}/change ticket/${chgDir}/`;
      for (const sub of CHANGE_TICKET_SUBFOLDERS) {
        archive.append(Buffer.alloc(0), { name: `${ctPrefix}${sub}/.keep` });
      }
    }

    archive.finalize().catch(reject);
  });
}
