<script setup>
import { usePtfForm } from '../../composables/usePtfFormContext.js'
import { parseTimeHm, formatTimeHm } from '../../utils/dateTime.js'

const { form } = usePtfForm()

function onStartTimeChange(row, d) {
  row.startTime = formatTimeHm(d)
}
</script>

<template>
  <a-card :bordered="false" class="section-card">
    <template #title>
      <span>实施步骤（Timing Summary）</span>
      <a-typography-text type="secondary" class="head-hint">
        Deployment Steps 为固定 5 行，与 Word 母版一致，请填写后四列
      </a-typography-text>
    </template>
    <a-space direction="vertical" :size="12" style="width: 100%">
      <a-card
        v-for="(row, i) in form.implementationSteps"
        :key="row.step + i"
        size="small"
        type="inner"
      >
        <template #title>
          <span class="step-idx">{{ i + 1 }}.</span>
          <span class="step-title">{{ row.step }}</span>
        </template>
        <a-row :gutter="[12, 12]">
          <a-col :xs="24" :md="7">
            <a-form-item label="Remarks" class="compact-item">
              <a-input
                v-model:value="row.remarks"
                allow-clear
                placeholder="如 Attachment 1、Kyndryl Wintel 等"
              />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="8" :md="4">
            <a-form-item label="Action by" class="compact-item">
              <a-input v-model:value="row.actionBy" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :xs="12" :sm="8" :md="4">
            <a-form-item label="开始时间" extra="时:分">
              <a-time-picker
                :value="parseTimeHm(row.startTime)"
                format="HH:mm"
                style="width: 100%"
                placeholder="选择时间"
                @update:value="(d) => onStartTimeChange(row, d)"
              />
            </a-form-item>
          </a-col>
          <a-col :xs="12" :sm="8" :md="5">
            <a-form-item label="估时" class="compact-item" extra="如 0.5 hour、1 hour">
              <a-input v-model:value="row.estimation" allow-clear />
            </a-form-item>
          </a-col>
        </a-row>
      </a-card>
    </a-space>
  </a-card>
</template>

<style scoped>
.head-hint {
  display: block;
  font-size: 12px;
  font-weight: normal;
  margin-top: 2px;
}
.step-idx {
  color: #8c8c8c;
  font-weight: 600;
  margin-right: 6px;
}
.step-title {
  font-weight: 600;
  color: #262626;
}
:deep(.section-card) {
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}
:deep(.section-card .ant-card-head) {
  border-bottom: 1px solid #f0f0f0;
  font-weight: 600;
}
:deep(.ant-card-head-title) {
  white-space: normal;
}
:deep(.ant-card-small > .ant-card-head) {
  min-height: auto;
}
.compact-item :deep(.ant-form-item-label) {
  padding-bottom: 2px;
}
</style>
