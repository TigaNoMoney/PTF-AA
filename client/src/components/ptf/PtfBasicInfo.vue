<script setup>
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { usePtfForm } from '../../composables/usePtfFormContext.js'
import { parseDateTime, formatDateTime } from '../../utils/dateTime.js'

const { form } = usePtfForm()

function startDayjs() {
  const s = parseDateTime(form.expectedStart)
  return s?.isValid() ? dayjs(s) : null
}

/** 结束日期的日历：早于「开始当日」的不选 */
function disabledEndDate(current) {
  const start = startDayjs()
  if (!current || !start) return false
  return current.startOf('day').valueOf() < start.startOf('day').valueOf()
}

/** 结束时刻：与「开始」同一天时，只能选择晚于开始的时分 */
function disabledEndTime(current) {
  const start = startDayjs()
  if (!start || !current || !dayjs(current).isValid()) return {}

  const cur = dayjs(current)
  if (!cur.startOf('day').isSame(start.startOf('day'))) return {}

  const sh = start.hour()
  const sm = start.minute()
  const allMins = () => Array.from({ length: 60 }, (_, i) => i)

  return {
    disabledHours: () => Array.from({ length: sh }, (_, i) => i),
    disabledMinutes: (selectedHour) => {
      if (selectedHour > sh) return []
      if (selectedHour < sh) return allMins()
      return Array.from({ length: sm + 1 }, (_, i) => i)
    },
  }
}

const envOptions = [
  { label: 'UAT', value: 'UAT' },
  { label: 'Regression', value: 'Regression' },
  { label: 'Production', value: 'Production' },
]

function onStartChange(d) {
  form.expectedStart = formatDateTime(d)
  const s = startDayjs()
  const end = parseDateTime(form.expectedEnd)
  if (s?.isValid() && end?.isValid() && !end.isAfter(s)) {
    form.expectedEnd = ''
  }
}

function onEndChange(d) {
  if (d == null) {
    form.expectedEnd = ''
    return
  }
  const start = startDayjs() || parseDateTime(form.expectedStart)
  const candidate = dayjs(d)
  if (start?.isValid() && !candidate.isAfter(start)) {
    message.warning('结束时间须晚于预计开始')
    return
  }
  form.expectedEnd = formatDateTime(d)
}
</script>

<template>
  <a-card title="基础信息" :bordered="false" class="section-card" size="default">
    <a-row :gutter="[16, 0]">
      <a-col :xs="24" :sm="12" :md="8">
        <a-form-item label="环境" required>
          <a-select
            v-model:value="form.environment"
            :options="envOptions"
            placeholder="选择环境"
          />
        </a-form-item>
      </a-col>
      <a-col :xs="24" :sm="12" :md="8">
        <a-form-item
          label="文件名后缀"
          required
          extra="保存为 PROD-PTF-AA-&lt;后缀&gt;.docx，例如 Wintel,DBA"
        >
          <a-input v-model:value="form.fileNameSuffix" allow-clear />
        </a-form-item>
      </a-col>
      <a-col :xs="24" :sm="12" :md="8">
        <a-form-item label="应用">
          <a-input v-model:value="form.appName" allow-clear />
        </a-form-item>
      </a-col>
      <a-col :xs="24" :sm="12">
        <a-form-item label="预计开始" extra="日期 + 时间">
          <a-date-picker
            :value="parseDateTime(form.expectedStart)"
            show-time
            format="YYYY-MM-DD HH:mm"
            style="width: 100%"
            placeholder="选择日期时间"
            @update:value="onStartChange"
          />
        </a-form-item>
      </a-col>
      <a-col :xs="24" :sm="12">
        <a-form-item label="预计结束" extra="须晚于「预计开始」；日期 + 时间">
          <a-date-picker
            :value="parseDateTime(form.expectedEnd)"
            show-time
            format="YYYY-MM-DD HH:mm"
            style="width: 100%"
            placeholder="选择日期时间"
            :disabled-date="disabledEndDate"
            :disabled-time="disabledEndTime"
            @update:value="onEndChange"
          />
        </a-form-item>
      </a-col>
    </a-row>
  </a-card>
</template>

<style scoped>
:deep(.section-card) {
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}
:deep(.section-card .ant-card-head) {
  border-bottom: 1px solid #f0f0f0;
  font-weight: 600;
}
</style>
