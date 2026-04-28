import { provide, inject, reactive } from 'vue'
import { createDefaultImplementationSteps } from '../constants/deploymentSteps.js'

const PTF_KEY = Symbol('ptfForm')

const initialState = () => ({
  environment: 'Production',
  fileNameSuffix: 'Wintel,DBA',
  appName: 'AA',
  expectedStart: '',
  expectedEnd: '',
  itsrRows: [
    { prb: '', chgId: '', title: '', preparedBy: '', teamLead: '' },
  ],
  pipelines: [{ name: '', link: '', itsrRef: '' }],
  staticFiles: [{ type: 'Folder', sourcePath: '', destPath: '' }],
  dbScripts: [
    {
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
    form.itsrRows.push({ prb: '', chgId: '', title: '', preparedBy: '', teamLead: '' })
  } else if (key === 'pipelines') {
    form.pipelines.push({ name: '', link: '', itsrRef: '' })
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
  }
  // implementationSteps 固定 5 行，不在此追加
}

export function removePtfAt(arr, i) {
  if (arr.length > 1) arr.splice(i, 1)
}
