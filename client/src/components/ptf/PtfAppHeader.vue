<script setup>
import { FileWordOutlined } from '@ant-design/icons-vue'
</script>

<template>
  <div class="header-row">
    <a-space direction="vertical" :size="8" class="page-header">
      <a-typography>
        <a-typography-title :level="2" :style="{ margin: 0 }">
          <FileWordOutlined class="title-icon" />
          PROD-PTF文档生成
        </a-typography-title>
        <a-typography-paragraph type="secondary" :style="{ marginBottom: 0, maxWidth: 720 }">
          右侧为<strong>数据预览</strong>，与母版版式可能略有差异。
        </a-typography-paragraph>
      </a-typography>
    </a-space>
    <div v-if="$slots.extra" class="header-extra">
      <slot name="extra" />
    </div>
  </div>
</template>

<style scoped>
.header-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px 16px;
  width: 100%;
}
.page-header {
  flex: 1;
  min-width: 0;
}
.header-extra {
  flex: none;
  padding-top: 2px;
}
.title-icon {
  margin-right: 10px;
  color: #1677ff;
  font-size: 0.9em;
  vertical-align: -0.12em;
}
</style>
