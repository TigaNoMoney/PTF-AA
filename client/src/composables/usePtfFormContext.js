import { provide, inject, reactive } from 'vue'
import { createDefaultImplementationSteps } from '../constants/deploymentSteps.js'

const PTF_KEY = Symbol('ptfForm')

/** 为 pipelines、dbScripts 行维护从 1 开始的序号（staticFiles 不含 seq） */
function renumberSeqForRows(arr) {
  if (!arr?.length) return
  const r0 = arr[0]
  const isPipeline =
    r0 &&
    'name' in r0 &&
    'link' in r0 &&
    'itsrRef' in r0
  const isDbScript =
    r0 &&
    'scriptName' in r0 &&
    'schemaChange' in r0 &&
    'projectCode' in r0
  if (!isPipeline && !isDbScript) return
  arr.forEach((row, idx) => {
    row.seq = idx + 1
  })
}

const initialState = () => ({
  environment: 'Production',
  fileNameSuffix: 'Wintel,DBA',
  appName: 'AA',
  expectedStart: '',
  expectedEnd: '',
  itsrRows: [
    { prb: 'ITSR', prbId: '', chgId: '', title: '', preparedBy: '', teamLead: '' },
  ],
  pipelines: [{ seq: 1, name: '', link: '', itsrRef: '' }],
  staticFiles: [{ type: 'Folder', sourcePath: '', destPath: '' }],
  dbScripts: [
    {
      seq: 1,
      server: '',
      location: '',
      scriptName: '',
      env: 'PRD',
      schemaChange: 'N',
      projectCode: '',
    },
  ],
  implementationSteps: createDefaultImplementationSteps(),
  contacts: { wintel: 'Leo Lin, Kin Wong', dba: 'Leo Lin, Kin Wong' },
  jira: {
    aaWebRollback: 'https://fwdhk.atlassian.net/browse/DEVOPS-',
    aaApiRollback: 'https://fwdhk.atlassian.net/browse/DEVOPS-',
  },
  postChecks: 'AA routine health check including common functions by IT development team',
  rollback: '',
  /** 勾选时下载 ZIP：含 PTF/ 与 change ticket/ 子文件夹结构 */
  createChangeTicketFolders: false,
})

export function createPtfFormState() {
  return reactive(initialState())
}

export function providePtfFormContext(ctx) {
  provide(PTF_KEY, ctx)
}

export function usePtfForm() {
  const v = inject(PTF_KEY)
  if (!v) throw new Error('usePtfForm() 需在 providePtfFormContext 的子孙内使用')
  return v
}

/** 供 App 用：与原有 addRow 逻辑一致 */
export function addPtfRow(form, key) {
  if (key === 'itsrRows') {
    form.itsrRows.push({ prb: 'ITSR', prbId: '', chgId: '', title: '', preparedBy: '', teamLead: '' })
  } else if (key === 'pipelines') {
    form.pipelines.push({ name: '', link: '', itsrRef: '' })
    renumberSeqForRows(form.pipelines)
  } else if (key === 'staticFiles') {
    form.staticFiles.push({ type: 'Folder', sourcePath: '', destPath: '' })
  } else if (key === 'dbScripts') {
    form.dbScripts.push({
      server: '',
      location: '',
      scriptName: '',
      env: 'PRD',
      schemaChange: 'N',
      projectCode: '',
    })
    renumberSeqForRows(form.dbScripts)
  }
  // implementationSteps 固定 5 行，不在此追加
}

export function removePtfAt(arr, i) {
  if (arr.length > 1) arr.splice(i, 1)
  renumberSeqForRows(arr)
}
