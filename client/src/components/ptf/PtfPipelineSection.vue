<script setup>
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { usePtfForm } from '../../composables/usePtfFormContext.js'

const { form, addRow, removeAt } = usePtfForm()
</script>

<template>
  <a-card title="Pipeline" :bordered="false" class="section-card">
    <template #extra>
      <a-button type="dashed" size="small" @click="addRow('pipelines')">
        <template #icon><PlusOutlined /></template>
        添加行
      </a-button>
    </template>
    <a-space direction="vertical" :size="12" style="width: 100%">
      <a-card
        v-for="(row, i) in form.pipelines"
        :key="'pipe' + i"
        size="small"
        :title="`第 ${i + 1} 条`"
        type="inner"
      >
        <template #extra>
          <a-button
            v-if="form.pipelines.length > 1"
            type="text"
            danger
            size="small"
            @click="removeAt(form.pipelines, i)"
          >
            <template #icon><DeleteOutlined /></template>
          </a-button>
        </template>
        <a-row :gutter="[12, 12]">
          <a-col :span="24">
            <a-form-item label="Pipeline 名称" class="compact-item">
              <a-input v-model:value="row.name" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="Jira 链接" class="compact-item">
              <a-input v-model:value="row.link" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="8">
            <a-form-item label="ITSR / PRB" class="compact-item">
              <a-input v-model:value="row.itsrRef" allow-clear />
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
