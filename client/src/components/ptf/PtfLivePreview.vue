<script setup>
import { computed } from 'vue'
import { usePtfForm } from '../../composables/usePtfFormContext.js'

defineProps({
  compact: { type: Boolean, default: false },
})

const { form } = usePtfForm()

const fileName = computed(() => {
  const s = (form.fileNameSuffix || 'Wintel,DBA').replace(/[<>:"/\\|?*]/g, '-')
  return `PROD-PTF-AA-${s}.docx`
})

/** 与母版中 Expected Start/Completion 三列表一致：| 日期 | 时间 |，第三列在母版中多为空 */
function threeCols(s) {
  if (s == null || String(s).trim() === '') {
    return { c1: '—', c2: '—', c3: '—' }
  }
  const t = String(s).trim()
  const m = t.match(
    /^(\d{4}-\d{1,2}-\d{1,2})[ T](\d{1,2}:\d{2})$/,
  )
  if (m) {
    return { c1: m[1], c2: m[2], c3: '' }
  }
  return { c1: t, c2: '—', c3: '—' }
}

const start3 = computed(() => threeCols(form.expectedStart))
const end3 = computed(() => threeCols(form.expectedEnd))

const appVersionRow = computed(() => ({
  c1: 'Application & Version',
  c2: d(form.appName),
  c3: '',
}))

function d(v) {
  if (v == null) return '—'
  const s = String(v).trim()
  return s === '' ? '—' : s
}

function envRow() {
  const e = (form.environment || '').trim()
  const uat = e === 'UAT' ? '☑' : '☐'
  const reg = e === 'Regression' ? '☑' : '☐'
  const prd = e === 'Production' ? '☑' : '☐'
  return `${uat} UAT   ${reg} Regression   ${prd} Production`
}

const firstAppTeamLead = computed(() => {
  const r = form.itsrRows?.[0]
  return r ? d(r.teamLead) : '—'
})

const runAt1 = computed(() => {
  const t = (form.expectedStart || '').match(/\b(\d{1,2}:\d{2})\s*$/)
  return t ? t[1] : '—'
})

const runAt2 = computed(() => {
  const steps = form.implementationSteps
  if (steps?.[1]?.startTime) return d(steps[1].startTime)
  const t = (form.expectedEnd || '').match(/\b(\d{1,2}:\d{2})\s*$/)
  return t ? t[1] : '—'
})

/**
 * 将 Estimation 列内容解析为数字（取第一个连续数字，如 "3" "3h" "2.5 hours"）；
 * 无数字时计 0，供 Grand Total 与展示统一。
 */
function parseEstimationToNumber(v) {
  if (v == null) return 0
  const s = String(v).trim()
  if (s === '') return 0
  const m = s.match(/-?\d+(?:\.\d+)?/)
  return m ? Number(m[0]) : 0
}

const estimationGrandTotal = computed(() => {
  const steps = form.implementationSteps
  if (!Array.isArray(steps)) return 0
  return steps.reduce((s, row) => s + parseEstimationToNumber(row?.estimation), 0)
})

const estimationGrandTotalDisplay = computed(() => {
  const n = estimationGrandTotal.value
  if (!Number.isFinite(n)) return '0'
  return n % 1 === 0 ? String(n) : String(Math.round(n * 100) / 100)
})

function estimationCellDisplay(v) {
  if (v == null || String(v).trim() === '') return '—'
  const n = parseEstimationToNumber(v)
  const disp =
    Number.isFinite(n) && n % 1 !== 0 ? String(Math.round(n * 100) / 100) : String(n)
  return disp
}

const staticNote1 =
  'Note 1: If no Point of NO RETURN is specified, this PTF is considered fully revertable within the Expected Completion time window.（与母版说明一致，此处为摘要）'
</script>

<template>
  <div
    class="live-preview-root"
    :class="{ compact }"
    role="region"
    aria-label="按 PTF 母版结构的填表实时预览"
  >
    <div class="live-preview-paper ptf-tpl">
      <p class="ptf-kicker">（参考母版《Program Transfer Form》章节顺序，数据来自左侧表单）</p>
      <div class="ptf-hero-title">Program Transfer Form</div>
      <p class="ptf-mono ptf-mute">{{ fileName }}</p>

      <p class="ptf-p-sm">{{ envRow() }} &lt;Click one box only&gt;</p>

      <h2 class="ptf-h2">Application Migration Summary</h2>
      <table class="ptf-grid-4">
        <tbody>
          <tr>
            <th scope="row">Line of Business</th>
            <td colspan="3">Life HK</td>
          </tr>
          <tr>
            <th scope="row">{{ appVersionRow.c1 }}</th>
            <td>{{ appVersionRow.c2 }}</td>
            <td colspan="2" />
          </tr>
          <tr>
            <th scope="row">Expected Start Date &amp; Time</th>
            <td>{{ d(start3.c1) }}</td>
            <td>{{ d(start3.c2) }}</td>
            <td>{{ start3.c3 || ' ' }}</td>
          </tr>
          <tr>
            <th scope="row">Expected Completion Date &amp; Time</th>
            <td>{{ d(end3.c1) }}</td>
            <td>{{ d(end3.c2) }}</td>
            <td>{{ end3.c3 || ' ' }}</td>
          </tr>
        </tbody>
      </table>

      <div class="doc-table-wrap">
        <table class="ptf-grid-5 ptf-tbl">
          <thead>
            <tr>
              <th>ITSR#/INC</th>
              <th>CHG ID (For Production only)</th>
              <th>Project Title</th>
              <th>Prepared by</th>
              <th>Application Team Lead</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in form.itsrRows" :key="'i' + i">
              <td>{{ d(row.prb) }}</td>
              <td>{{ d(row.chgId) }}</td>
              <td class="cell-wrap">{{ d(row.title) }}</td>
              <td>{{ d(row.preparedBy) }}</td>
              <td>{{ d(row.teamLead) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="ptf-hint">&lt;Click in the bottom right of the table to insert additional ITSR/INC.&gt;</p>

      <h2 class="ptf-h2">Migration Approval</h2>
      <div class="doc-table-wrap">
        <table class="ptf-grid-3 ptf-tbl">
          <thead>
            <tr>
              <th>Approver</th>
              <th>Name</th>
              <th>Attachment*</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Application Team Lead</td>
              <td>{{ firstAppTeamLead }}</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="ptf-hint">
        &lt;*Email justification is needed for UAT and Regression Migration only, Production Migration
        approval can be referred to ServiceNow.&gt;
      </p>

      <h2 class="ptf-h2">Migration Details</h2>
      <div class="doc-table-wrap">
        <table class="ptf-grid-4 ptf-tbl ptf-tbl-tight">
          <tbody>
            <tr>
              <th class="p-left">Migrate Source From Server</th>
              <td />
              <th>Library / Directory</th>
              <td>IPD</td>
            </tr>
            <tr>
              <th class="p-left">To Server</th>
              <td />
              <th>Library / Directory</th>
              <td>IPD</td>
            </tr>
            <tr>
              <th class="p-left">Migrate Object From Server</th>
              <td />
              <th>Library / Directory</th>
              <td>IPD</td>
            </tr>
            <tr>
              <th class="p-left">To Server</th>
              <td />
              <th>Library / Directory</th>
              <td>IPD</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="ptf-checkline">
        Attached with: ☐ Source List ☐ Object List ☐ Database List ☐ Conversion Program List
      </p>
      <p class="ptf-hint ptf-italic">
        &lt; Note: Migration Details for LifeAsia System Migration only&gt;
      </p>

      <h2 class="ptf-h2">Implementation Plan</h2>
      <p class="ptf-h3-sub">Please complete the table by providing estimated breakdown of steps.</p>
      <h3 class="ptf-h3">Timing Summary</h3>
      <div class="doc-table-wrap">
        <table class="ptf-grid-5 ptf-tbl">
          <thead>
            <tr>
              <th>Deployment Steps</th>
              <th>Remarks</th>
              <th>Action By</th>
              <th>Start Time</th>
              <th>Estimation</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in form.implementationSteps" :key="'m' + i">
              <td class="cell-wrap">{{ d(row.step) }}</td>
              <td class="cell-wrap">{{ d(row.remarks) }}</td>
              <td>{{ d(row.actionBy) }}</td>
              <td class="p-nowrap">{{ d(row.startTime) }}</td>
              <td class="p-nowrap">{{ estimationCellDisplay(row.estimation) }}</td>
            </tr>
            <tr class="ptf-total">
              <td />
              <td />
              <td>Grand Total</td>
              <td />
              <td class="p-nowrap">{{ estimationGrandTotalDisplay }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="ptf-hint">{{ staticNote1 }}</p>

      <h2 class="ptf-h2 att">
        Attachment 1: Front End Web and API – Agent Assist (By Wintel) (Run at {{ runAt1 }})
      </h2>
      <p>Contact point:</p>
      <p class="p-indent">{{ d(form.contacts.wintel) }}</p>
      <p>Deploy by Azure Pipeline <span class="ptf-weak">（母版中拼写 Auzre 已更正为 Azure）</span></p>
      <p class="p-indent">(By Wintel / Kyndryl)</p>
      <p>Go Jira ticket:</p>
      <div class="doc-table-wrap ptf-mid-table">
        <table class="ptf-grid-4 ptf-tbl">
          <thead>
            <tr>
              <th>#</th>
              <th>Pipeline Name</th>
              <th>Link</th>
              <th>ITSR/INC/PRB</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in form.pipelines" :key="'p' + i">
              <td class="p-center">{{ row.seq ?? i + 1 }}</td>
              <td class="cell-wrap">{{ d(row.name) }}</td>
              <td class="cell-mono cell-wrap">{{ d(row.link) }}</td>
              <td class="cell-wrap">{{ d(row.itsrRef) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>Click on “Ready to Deploy PRD” =&gt; “Start Deploy”</p>
      <p>The status will change to “DEPLOYING” after a while.</p>
      <p>
        The status will change to “DEPLOY SUCCESS” once the deployment is successful, otherwise will
        change to “DEPLOY FAILED”.
      </p>

      <h2 class="ptf-h2 att">
        Attachment 2: Upload Static File (By Wintel) (Run at {{ runAt2 }})
      </h2>
      <p>Contact point:</p>
      <p class="p-indent">{{ d(form.contacts.wintel) }}</p>
      <p class="ptf-weak ptf-srv">（Server: 母版有 WHKEASE… 行；当前表单无独立字段，下载 Word 时由母版/手工维护）</p>
      <div class="doc-table-wrap">
        <table class="ptf-grid-4 ptf-tbl">
          <thead>
            <tr>
              <th>#</th>
              <th>Type</th>
              <th>Source Folder Path</th>
              <th>Destination Path</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in form.staticFiles" :key="'s' + i">
              <td class="p-center">{{ i + 1 }}</td>
              <td>{{ d(row.type) }}</td>
              <td class="cell-mono cell-wrap">{{ d(row.sourcePath) }}</td>
              <td class="cell-mono cell-wrap">{{ d(row.destPath) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 class="ptf-h2 att">Attachment 3: DB Script Deployment Plan (By DBA)</h2>
      <p>Execute below script files and save the result text.</p>
      <p>Contact point:</p>
      <p class="p-indent">{{ d(form.contacts.dba) }}</p>
      <p>Please run this step after Attachment 2 is completed.</p>
      <div class="doc-table-wrap">
        <table class="ptf-grid-7 ptf-tbl">
          <thead>
            <tr>
              <th>#</th>
              <th>Server</th>
              <th>Script location</th>
              <th>Script name</th>
              <th>Target Env</th>
              <th>Schema Change?</th>
              <th>Project Code</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in form.dbScripts" :key="'d' + i">
              <td class="p-center">{{ row.seq ?? i + 1 }}</td>
              <td class="cell-wrap">{{ d(row.server) }}</td>
              <td class="cell-mono cell-wrap">{{ d(row.location) }}</td>
              <td class="cell-mono">{{ d(row.scriptName) }}</td>
              <td>{{ d(row.env) }}</td>
              <td class="p-center">{{ d(row.schemaChange) }}</td>
              <td>{{ d(row.projectCode) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 class="ptf-h2">Post Implementation Checks <span class="ptf-weak">&lt;Checklist&gt;</span></h2>
      <p class="doc-p ptf-keep">{{ d(form.postChecks) }}</p>

      <h2 class="ptf-h2">Rollback Plan &amp; Checks <span class="ptf-weak">&lt;steps / attachment&gt;</span></h2>
      <p>Only if migration failed and instructed by AA IT, perform below roll back steps.</p>
      <p class="p-indent"><strong>For attachment 1: Front End Web and API</strong></p>
      <p class="p-indent">1. Migration Team to perform rollback using the previous Jira backup version.</p>
      <p class="p-sub">aa-web</p>
      <p>Go Jira ticket: <span class="cell-mono">{{ d(form.jira.aaWebRollback) }}</span></p>
      <p>Click on “Start Deploy” / status “DEPLOYING”…</p>
      <p class="p-sub">aa-api</p>
      <p>Go Jira ticket: <span class="cell-mono">{{ d(form.jira.aaApiRollback) }}</span></p>
      <p>Click on “Start Deploy” / status “DEPLOYING”…</p>
      <p>2. AA IT verify the related objects.</p>
      <p v-if="(form.rollback || '').trim()" class="doc-p ptf-blk">{{ form.rollback }}</p>

      <p class="ptf-end">&lt;End of document&gt;</p>
      <p class="ptf-foot">排版为网页预览，最终版式以 Word 母版为准。</p>
    </div>
  </div>
</template>

<style scoped>
.live-preview-root {
  --paper-pad: 20px 22px 18px;
  --paper-font: 11.5px;
  --ptf-border: #bfbfbf;
  --ptf-head: #e6e6e6;
  --ptf-ink: #1a1a1a;
  --ptf-mute: #595959;
}
.live-preview-root.compact {
  --paper-pad: 14px 14px 12px;
  --paper-font: 10.5px;
}

.live-preview-paper {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  padding: var(--paper-pad);
  font-size: var(--paper-font);
  line-height: 1.45;
  color: var(--ptf-ink);
  text-align: left;
  font-family: 'Calibri', 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.ptf-tpl p {
  margin: 0 0 0.25em;
}
.p-sub {
  margin: 0.4em 0 0.1em !important;
  font-weight: 600;
}
.p-indent {
  margin-left: 0.4em;
}

.ptf-kicker {
  font-size: 0.88em;
  color: #8c8c8c;
  text-align: center;
  margin-bottom: 0.5em;
}
.ptf-hero-title {
  text-align: center;
  font-size: 1.35em;
  font-weight: 700;
  margin: 0.2em 0 0.1em;
  letter-spacing: 0.01em;
}
.ptf-mono {
  text-align: center;
  font-size: 0.9em;
}
.ptf-mute {
  color: #1677ff;
  font-weight: 500;
  word-break: break-all;
  margin-bottom: 0.6em !important;
}
.ptf-p-sm {
  font-size: 0.95em;
  margin: 0.3em 0 0.8em;
  text-align: center;
}

.ptf-h2 {
  font-size: 1.05em;
  font-weight: 700;
  margin: 1em 0 0.45em;
  color: #000;
}
.ptf-h2.att {
  margin-top: 1.1em;
  border-top: 1px dashed #d9d9d9;
  padding-top: 0.6em;
}
.ptf-h3 {
  font-size: 1em;
  font-weight: 700;
  margin: 0.4em 0 0.35em;
  color: #000;
}
.ptf-h3-sub {
  font-size: 0.95em;
  color: #595959;
  margin: 0 0 0.3em;
}
.ptf-weak {
  font-weight: 400;
  color: #666;
  font-size: 0.9em;
}
.ptf-italic {
  font-style: italic;
}
.ptf-hint {
  font-size: 0.9em;
  color: #8c8c8c;
  margin: 0.35em 0 0.6em;
}
.ptf-srv {
  font-size: 0.9em;
  margin-bottom: 0.5em;
}
.ptf-checkline {
  font-size: 0.9em;
  margin: 0.4em 0 0.2em;
}
.ptf-keep {
  margin: 0.3em 0 0.6em;
  white-space: pre-wrap;
  word-break: break-word;
}
.ptf-blk {
  border-left: 2px solid #d9d9d9;
  padding-left: 0.5em;
  margin: 0.5em 0 0.8em;
  white-space: pre-wrap;
}
.ptf-total {
  font-weight: 600;
  background: #fafafa;
}
.ptf-total td {
  border-top: 2px solid #bfbfbf;
}

/* 母版式网格：等宽实线，仿 Word 表格 */
.doc-table-wrap {
  overflow-x: auto;
  max-width: 100%;
  margin: 0.2em 0 0.5em;
  -webkit-overflow-scrolling: touch;
}

.ptf-grid-4,
.ptf-grid-3,
.ptf-grid-5,
.ptf-grid-7 {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--ptf-border);
  margin: 0.3em 0 0.6em;
  table-layout: fixed;
}
.ptf-grid-4 th,
.ptf-grid-4 td,
.ptf-grid-3 th,
.ptf-grid-3 td,
.ptf-grid-5 th,
.ptf-grid-5 td,
.ptf-grid-7 th,
.ptf-grid-7 td {
  border: 1px solid var(--ptf-border);
  padding: 3px 5px;
  vertical-align: top;
  text-align: left;
}
.ptf-grid-4 th[scope='row'],
.ptf-tbl th {
  background: var(--ptf-head);
  font-weight: 600;
  color: #262626;
}
.ptf-grid-4 th[scope='row'] {
  width: 28%;
}
.p-left {
  text-align: left !important;
  font-weight: 600;
  background: #f0f0f0;
}
.ptf-tbl-tight th,
.ptf-tbl-tight td {
  font-size: 0.95em;
}

.p-center {
  text-align: center;
  width: 2.2em;
}
.p-nowrap {
  white-space: nowrap;
}
.ptf-mid-table {
  margin: 0.3em 0 0.5em;
}

.doc-p {
  color: #262626;
}
.ptf-end {
  text-align: center;
  margin: 1.2em 0 0.3em;
  color: #8c8c8c;
  font-size: 0.95em;
}
.ptf-foot {
  text-align: center;
  font-size: 0.88em;
  color: #bfbfbf;
  margin: 0;
}

.cell-wrap {
  word-break: break-word;
  overflow-wrap: anywhere;
  min-width: 0;
}
.cell-mono {
  font-family: 'Consolas', 'Courier New', ui-monospace, monospace;
  font-size: 0.92em;
}
</style>
