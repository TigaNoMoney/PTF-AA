<script setup>
import { h } from 'vue'
import { message } from 'ant-design-vue'
import { FileWordOutlined, CloudDownloadOutlined } from '@ant-design/icons-vue'
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
    const name = `PROD-PTF-AA-${form.fileNameSuffix || 'Wintel,DBA'}.docx`
    const safe = name.replace(/[<>:"/\\|?*]/g, '-')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = safe
    a.click()
    URL.revokeObjectURL(a.href)
    message.success({
      content: `已下载：${safe}`,
      icon: h(FileWordOutlined),
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
    <a-space :size="16" wrap>
      <a-button
        type="primary"
        size="large"
        :loading="loading"
        @click="onSubmit"
      >
        <template #icon>
          <CloudDownloadOutlined v-if="!loading" />
        </template>
        下载 Word
      </a-button>
      <a-typography-text type="secondary">
        将调用 <a-typography-text code>POST /api/generate</a-typography-text> 并触发浏览器下载
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
