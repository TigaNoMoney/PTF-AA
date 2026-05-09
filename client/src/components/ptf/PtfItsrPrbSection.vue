<script setup>
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { usePtfForm } from '../../composables/usePtfFormContext.js'

const { form, addRow, removeAt } = usePtfForm()

const prbIdPlaceholder = (prb) => {
  if (prb === 'ITSR') return '请输入 ITSR ID'
  if (prb === 'PRB') return '请输入 PRB ID'
  return '请先选择类型'
}

const onPrbTypeChange = (row, value) => {
  // 类型清空时，同时清空 ID，避免出现“有 ID 但没类型”
  if (!value) row.prbId = undefined
}

const PREPARED_BY_OPTIONS = [
  { label: 'Leo Lin', value: 'Leo Lin' },
  { label: 'Kin Wong', value: 'Kin Wong' },
  { label: 'Chao Huang', value: 'Chao Huang' },
]

const APP_TEAM_LEAD_OPTIONS = [
  { label: 'Jerry Huang', value: 'Jerry Huang' },
  { label: 'Kin Wong', value: 'Kin Wong' },
  { label: 'Tom Cheung', value: 'Tom Cheung' },
]
</script>

<template>
  <a-card title="ITSR / PRB" :bordered="false" class="section-card">
    <template #extra>
      <a-button type="dashed" size="small" @click="addRow('itsrRows')">
        <template #icon><PlusOutlined /></template>
        添加行
      </a-button>
    </template>
    <a-space direction="vertical" :size="12" style="width: 100%">
      <a-card
        v-for="(row, i) in form.itsrRows"
        :key="'itsr' + i"
        size="small"
        :title="`第 ${i + 1} 行`"
        type="inner"
      >
        <template #extra>
          <a-button
            v-if="form.itsrRows.length > 1"
            type="text"
            danger
            size="small"
            @click="removeAt(form.itsrRows, i)"
          >
            <template #icon><DeleteOutlined /></template>
          </a-button>
        </template>
        <a-row :gutter="[12, 12]">
          <a-col :xs="24" :sm="12" :lg="6">
            <a-form-item label="PRB/ITSR" class="compact-item">
              <a-space-compact style="width: 100%">
                <a-select
                  v-model:value="row.prb"
                  allow-clear
                  style="width: 120px"
                  @change="(v) => onPrbTypeChange(row, v)"
                >
                  <a-select-option value="ITSR">ITSR</a-select-option>
                  <a-select-option value="PRB">PRB</a-select-option>
                </a-select>
                <a-input
                  v-model:value="row.prbId"
                  allow-clear
                  :disabled="!row.prb"
                  :placeholder="prbIdPlaceholder(row.prb)"
                />
              </a-space-compact>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12" :lg="6">
            <a-form-item label="CHG ID" class="compact-item">
              <a-input v-model:value="row.chgId" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :lg="12">
            <a-form-item label="Project Title" class="compact-item">
              <a-input v-model:value="row.title" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12" :lg="6">
            <a-form-item label="Prepared by" class="compact-item">
              <a-select
                v-model:value="row.preparedBy"
                placeholder="请选择"
                allow-clear
                :options="PREPARED_BY_OPTIONS"
              />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12" :lg="6">
            <a-form-item label="App Team Lead" class="compact-item">
              <a-select
                v-model:value="row.teamLead"
                placeholder="请选择"
                allow-clear
                :options="APP_TEAM_LEAD_OPTIONS"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-card>
    </a-space>
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
.compact-item :deep(.ant-form-item-label) {
  padding-bottom: 2px;
}
</style>
