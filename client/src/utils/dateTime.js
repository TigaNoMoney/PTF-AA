import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

const FMT_DT = 'YYYY-MM-DD HH:mm'
const FMT_T = 'HH:mm'

/** 日期时间字符串 → dayjs，用于 a-date-picker */
export function parseDateTime(str) {
  if (str == null || str === '') return null
  const d = dayjs(str, FMT_DT, true)
  return d.isValid() ? d : null
}

/** 仅时间 "HH:mm" → dayjs（用于 a-time-picker） */
export function parseTimeHm(str) {
  if (str == null || str === '') return null
  const d = dayjs(`1970-01-01 ${str}`, `YYYY-MM-DD ${FMT_T}`, true)
  return d.isValid() ? d : null
}

export function formatDateTime(d) {
  if (d == null) return ''
  const x = dayjs(d)
  return x.isValid() ? x.format(FMT_DT) : ''
}

export function formatTimeHm(d) {
  if (d == null) return ''
  const x = dayjs(d)
  return x.isValid() ? x.format(FMT_T) : ''
}
