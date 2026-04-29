/**
 * Word 常在 {#name }、{/name } 的循环名前、后留空格，解析后变成 "name " 与 "name"，
 * docxtemplater 报 Closing tag does not match opening tag。
 */
function trimLoopTagInnerNames(xml) {
  return xml
    .replace(/\{#([^}]*)\}/g, (_, inner) => `{#${inner.trim()}}`)
    .replace(/\{\/([^}]*)\}/g, (_, inner) => `{/${inner.trim()}}`)
    .replace(/\{\^([^}]*)\}/g, (_, inner) => `{^${inner.trim()}}`);
}

/** 母版中常见笔误：第二列写成 {#pipelines} {name}，应仅为 {name}，否则 loops 不匹配 */
function dropDuplicatePipelineLoopOpen(xml) {
  return xml.replace(/\{#pipelines\}\s+\{name\}/g, "{name}");
}

/**
 * Word 常把 docxtemplater 占位符 {name} 或 {{name}} 拆成多个 w:t，导致无法解析；合并为单段 w:t。
 * 在内存中把「仅含文本 run」的 w:p 合并为单段 w:t，便于 docxtemplater 解析。
 * 不处理含 w:drawing 等图形的段落，避免误伤。
 */
export function normalizeDocumentXmlForDocxtemplater(xml) {
  let s = xml.replace(/enviromentLine/g, "environmentLine");
  s = s.replace(/<w:p\b[^>]*>[\s\S]*?<\/w:p>/g, (pBlock) => {
    if (/<w:drawing/.test(pBlock)) return pBlock;
    const open = pBlock.match(/^<w:p(\s[^>]*)?>/)?.[0] ?? "<w:p>";
    const pPr = (pBlock.match(/<w:pPr>[\s\S]*?<\/w:pPr>/) ?? [""])[0];
    const texts = [];
    const re = /<w:t[^>]*>([^<]*)<\/w:t>/g;
    let m;
    while ((m = re.exec(pBlock)) !== null) {
      texts.push(m[1]);
    }
    if (texts.length < 2) return pBlock;
    const joined = texts.join("");
    // 双花括号 或 单花括号 {var}、循环 {#rows}、{/rows} 等，被拆成 { | appName | } 时也要合并
    const hasDocxtemplater =
      joined.includes("{{") ||
      /\{[#\/^]/.test(joined) ||
      /\{[a-zA-Z_][\w.]*\}/.test(joined);
    if (!hasDocxtemplater) return pBlock;
    const rPrM = pBlock.match(/<w:r[^>]*>(<w:rPr>[\s\S]*?<\/w:rPr>)/);
    const rPr = rPrM ? rPrM[1] : "<w:rPr><w:sz w:val=\"24\"/></w:rPr>";
    return `${open}${pPr}<w:r>${rPr}<w:t xml:space="preserve">${joined}</w:t></w:r></w:p>`;
  });
  return dropDuplicatePipelineLoopOpen(trimLoopTagInnerNames(s));
}
