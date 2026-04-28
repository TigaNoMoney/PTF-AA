<script setup>
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { usePtfForm } from '../../composables/usePtfFormContext.js'

const { form, addRow, removeAt } = usePtfForm()

const PREPARED_BY_OPTIONS = [
  { label: 'Leo Li', value: 'Leo Li' },
  { label: 'Kin Wong', value: 'Kin Wong' },
  { label: 'Chao Huang', value: 'Chao Huang' },
]

const APP_TEAM_LEAD_OPTIONS = [{ label: 'Jerry Huang', value: 'Jerry Huang' }]
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
              <a-input v-model:value="row.prb" allow-clear />
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
