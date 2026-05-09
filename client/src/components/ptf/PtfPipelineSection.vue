<script setup>
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { usePtfForm } from '../../composables/usePtfFormContext.js'

const { form, addRow, removeAt } = usePtfForm()

function parseItsrRef(v) {
  const s = (v ?? '').toString().trim()
  if (!s) return { type: undefined, id: '' }
  const m = s.match(/^(ITSR|PRB)\s*[-#:]?\s*(.*)$/i)
  if (m) return { type: m[1].toUpperCase(), id: (m[2] || '').trim() }
  return { type: undefined, id: s }
}

function buildItsrRef(type, id) {
  const t = (type ?? '').toString().trim()
  const i = (id ?? '').toString().trim()
  if (!t && !i) return ''
  if (t && i) return `${t} ${i}`
  return t || i
}

function itsrIdPlaceholder(type) {
  if (type === 'ITSR') return '请输入 ITSR ID'
  if (type === 'PRB') return '请输入 PRB ID'
  return '请先选择类型'
}
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
              <a-space-compact style="width: 100%">
                <a-select
                  :value="parseItsrRef(row.itsrRef).type"
                  allow-clear
                  style="width: 96px"
                  @change="(v) => {
                    const p = parseItsrRef(row.itsrRef)
                    row.itsrRef = buildItsrRef(v, p.id)
                  }"
                >
                  <a-select-option value="ITSR">ITSR</a-select-option>
                  <a-select-option value="PRB">PRB</a-select-option>
                </a-select>
                <a-input
                  :value="parseItsrRef(row.itsrRef).id"
                  allow-clear
                  :disabled="!parseItsrRef(row.itsrRef).type"
                  :placeholder="itsrIdPlaceholder(parseItsrRef(row.itsrRef).type)"
                  @update:value="(v) => {
                    const p = parseItsrRef(row.itsrRef)
                    row.itsrRef = buildItsrRef(p.type, v)
                  }"
                />
              </a-space-compact>
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
