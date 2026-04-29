<script setup>
import { h } from 'vue'
import { message } from 'ant-design-vue'
import {
  FileWordOutlined,
  CloudDownloadOutlined,
  FileZipOutlined,
} from '@ant-design/icons-vue'
import { usePtfForm } from '../../composables/usePtfFormContext.js'
import { generatePtfDocx } from '../../api.js'

const { form, loading } = usePtfForm()

function plainFormPayload() {
  // 去掉 Vue reactive/Proxy，避免深嵌套数组在 JSON 序列化时出现边界问题
  return JSON.parse(JSON.stringify(form))
}

async function onSubmit() {
  loading.value = true
  try {
    const blob = await generatePtfDocx(plainFormPayload())
    const suffix = (form.fileNameSuffix || 'Wintel,DBA').replace(
      /[<>:"/\\|?*]/g,
      '-',
    )
    const name = form.createChangeTicketFolders
      ? `PROD-PTF-AA-${suffix}.zip`
      : `PROD-PTF-AA-${suffix}.docx`
    const safe = name.replace(/[<>:"/\\|?*]/g, '-')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = safe
    a.click()
    URL.revokeObjectURL(a.href)
    message.success({
      content: `已下载：${safe}`,
      icon: h(form.createChangeTicketFolders ? FileZipOutlined : FileWordOutlined),
    })
  } catch (e) {
    message.error(e?.message || '生成失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <a-card :bordered="false" class="section-card action-card">
    <a-space :size="16" wrap align="center">
      <a-button
        type="primary"
        size="large"
        :loading="loading"
        @click="onSubmit"
      >
        <template #icon>
          <CloudDownloadOutlined v-if="!loading" />
        </template>
        下载 {{ form.createChangeTicketFolders ? 'ZIP 包' : 'Word' }}
      </a-button>
      <a-checkbox v-model:checked="form.createChangeTicketFolders">
        创建 change ticket 文件夹
      </a-checkbox>
      <a-typography-text type="secondary">
        勾选后为 ZIP：<a-typography-text code>PTF/</a-typography-text>
        ，以及「ITSR／PRB」中填写的每个
        <a-typography-text code>CHG ID</a-typography-text>
        对应一层
        <a-typography-text code>change ticket</a-typography-text>
        文件夹；否则仅 Word。
        <a-typography-text code>POST /api/generate</a-typography-text>
      </a-typography-text>
    </a-space>
  </a-card>
</template>

<style scoped>
:deep(.section-card) {
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}
:deep(.section-card .ant-card-head) {
  font-weight: 600;
}
:deep(.action-card .ant-card-body) {
  padding: 20px 24px;
}
</style>
