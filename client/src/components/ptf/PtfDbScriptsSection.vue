<script setup>
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { usePtfForm } from '../../composables/usePtfFormContext.js'

const { form, addRow, removeAt } = usePtfForm()
</script>

<template>
  <a-card title="DB 脚本" :bordered="false" class="section-card">
    <template #extra>
      <a-button type="dashed" size="small" @click="addRow('dbScripts')">
        <template #icon><PlusOutlined /></template>
        添加行
      </a-button>
    </template>
    <a-space direction="vertical" :size="12" style="width: 100%">
      <a-card
        v-for="(row, i) in form.dbScripts"
        :key="'db' + i"
        size="small"
        :title="`第 ${row.seq ?? i + 1} 行`"
        type="inner"
      >
        <template #extra>
          <a-button
            v-if="form.dbScripts.length > 1"
            type="text"
            danger
            size="small"
            @click="removeAt(form.dbScripts, i)"
          >
            <template #icon><DeleteOutlined /></template>
          </a-button>
        </template>
        <a-row :gutter="[12, 12]">
          <a-col :xs="24" :lg="8">
            <a-form-item label="Server" class="compact-item">
              <a-input v-model:value="row.server" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :lg="16">
            <a-form-item label="Script path" class="compact-item">
              <a-input v-model:value="row.location" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="8" :lg="6">
            <a-form-item label="Script name" class="compact-item">
              <a-input v-model:value="row.scriptName" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :xs="8" :sm="4" :lg="3">
            <a-form-item label="Env" class="compact-item">
              <a-input v-model:value="row.env" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :xs="8" :sm="4" :lg="3">
            <a-form-item label="Schema" class="compact-item">
              <a-input v-model:value="row.schemaChange" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :xs="8" :sm="8" :lg="6">
            <a-form-item label="Project code" class="compact-item">
              <a-input v-model:value="row.projectCode" allow-clear />
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
