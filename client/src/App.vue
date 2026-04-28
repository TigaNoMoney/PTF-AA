<script setup>
import { ref } from 'vue'
import { EyeOutlined } from '@ant-design/icons-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import {
  createPtfFormState,
  providePtfFormContext,
  addPtfRow,
  removePtfAt,
} from './composables/usePtfFormContext.js'
import { useIsWideLayout } from './composables/useIsWideLayout.js'
import PtfAppHeader from './components/ptf/PtfAppHeader.vue'
import PtfBasicInfo from './components/ptf/PtfBasicInfo.vue'
import PtfItsrPrbSection from './components/ptf/PtfItsrPrbSection.vue'
import PtfPipelineSection from './components/ptf/PtfPipelineSection.vue'
import PtfStaticFilesSection from './components/ptf/PtfStaticFilesSection.vue'
import PtfDbScriptsSection from './components/ptf/PtfDbScriptsSection.vue'
import PtfImplementationSection from './components/ptf/PtfImplementationSection.vue'
import PtfOtherFields from './components/ptf/PtfOtherFields.vue'
import PtfGenerateAction from './components/ptf/PtfGenerateAction.vue'
import PtfLivePreview from './components/ptf/PtfLivePreview.vue'

const form = createPtfFormState()
const loading = ref(false)

function addRow(key) {
  addPtfRow(form, key)
}
function removeAt(arr, i) {
  removePtfAt(arr, i)
}

providePtfFormContext({ form, addRow, removeAt, loading })

const { isWide } = useIsWideLayout()
const previewDrawerOpen = ref(false)
</script>

<template>
  <a-config-provider
    :locale="zhCN"
    :theme="{
      token: {
        colorPrimary: '#1677ff',
        borderRadius: 8,
        fontFamily: `'Segoe UI', system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif`,
      },
    }"
  >
    <a-layout class="page-layout">
      <a-layout-content class="page-content">
        <div class="page-inner">
          <PtfAppHeader>
            <template v-if="!isWide" #extra>
              <a-button type="primary" ghost @click="previewDrawerOpen = true">
                <template #icon><EyeOutlined /></template>
                实时预览
              </a-button>
            </template>
          </PtfAppHeader>

          <a-row :gutter="[24, 24]" class="main-row" align="top">
            <a-col :xs="24" :lg="isWide ? 14 : 24" :xl="isWide ? 15 : 24" class="form-col">
              <a-form layout="vertical" class="form-wrap" @submit.prevent>
                <PtfBasicInfo />
                <PtfItsrPrbSection />
                <PtfPipelineSection />
                <PtfStaticFilesSection />
                <PtfDbScriptsSection />
                <PtfImplementationSection />
                <PtfOtherFields />
                <PtfGenerateAction />
              </a-form>
            </a-col>
            <a-col v-show="isWide" :lg="10" :xl="9" class="preview-col">
              <aside class="preview-aside" aria-label="填表实时预览">
                <div class="preview-aside-head">
                  <EyeOutlined />
                  实时预览
                </div>
                <div class="preview-aside-body">
                  <PtfLivePreview />
                </div>
              </aside>
            </a-col>
          </a-row>
        </div>

        <a-drawer
          v-model:open="previewDrawerOpen"
          title="填表实时预览"
          placement="right"
          :content-wrapper-style="{ width: 'min(440px, 92vw)' }"
          :body-style="{ padding: '12px 16px 20px' }"
          destroy-on-close
        >
          <PtfLivePreview compact />
        </a-drawer>
      </a-layout-content>
    </a-layout>
  </a-config-provider>
</template>

<style scoped>
.page-layout {
  min-height: 100vh;
  min-height: 100dvh;
  background: linear-gradient(180deg, #f0f5ff 0%, #f5f5f5 28%, #f5f5f5 100%);
}
.page-content {
  padding: 32px 20px 48px;
}
.page-inner {
  max-width: 1320px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.form-wrap {
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.form-wrap :deep(.section-card) {
  margin-bottom: 0;
}
.main-row {
  width: 100%;
}
.form-col {
  min-width: 0;
}
.preview-col {
  min-width: 0;
}
.preview-aside {
  position: sticky;
  top: 20px;
  max-height: calc(100dvh - 40px);
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
}
.preview-aside-head {
  flex: none;
  padding: 10px 14px;
  background: linear-gradient(180deg, #f0f5ff 0%, #ffffff 100%);
  border: 1px solid #d6e4ff;
  border-radius: 8px 8px 0 0;
  font-weight: 600;
  font-size: 14px;
  color: #1677ff;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 1px 0 rgba(22, 119, 255, 0.08);
}
.preview-aside-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  border: 1px solid #d6e4ff;
  border-top: none;
  border-radius: 0 0 8px 8px;
  background: #f0f2f5;
  padding: 8px 8px 10px;
}
</style>
