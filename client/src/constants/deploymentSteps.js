/**
 * 与母版 / 后端 generatePtf.js 中 FIXED_DEPLOYMENT_STEPS 一致，勿改顺序。
 */
export const DEPLOYMENT_STEP_LABELS = [
  'DB Script Deployment Plan',
  'File Transfer/Setup',
  'Critical Milestone(s)',
  'Post Implementation Checks',
  'Rollback Plan & Checks',
]

export function createDefaultImplementationSteps() {
  return DEPLOYMENT_STEP_LABELS.map((step) => ({
    step,
    remarks: '',
    actionBy: '',
    startTime: '',
    estimation: '',
  }))
}
