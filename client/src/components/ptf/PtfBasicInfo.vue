<script setup>
import { usePtfForm } from '../../composables/usePtfFormContext.js'
import { parseDateTime, formatDateTime } from '../../utils/dateTime.js'

const { form } = usePtfForm()

const envOptions = [
  { label: 'UAT', value: 'UAT' },
  { label: 'Regression', value: 'Regression' },
  { label: 'Production', value: 'Production' },
]

function onStartChange(d) {
  form.expectedStart = formatDateTime(d)
}
function onEndChange(d) {
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
        <a-form-item label="预计结束" extra="日期 + 时间">
          <a-date-picker
            :value="parseDateTime(form.expectedEnd)"
            show-time
            format="YYYY-MM-DD HH:mm"
            style="width: 100%"
            placeholder="选择日期时间"
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
