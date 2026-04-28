<script setup>
import { usePtfForm } from '../../composables/usePtfFormContext.js'

const { form } = usePtfForm()
</script>

<template>
  <a-card title="其它" :bordered="false" class="section-card">
    <a-row :gutter="[16, 0]">
      <a-col :xs="24" :md="12">
        <a-form-item label="联络人 (Wintel)">
          <a-input v-model:value="form.contacts.wintel" allow-clear />
        </a-form-item>
      </a-col>
      <a-col :xs="24" :md="12">
        <a-form-item label="联络人 (DBA)">
          <a-input v-model:value="form.contacts.dba" allow-clear />
        </a-form-item>
      </a-col>
      <a-col :span="24">
        <a-form-item label="回滚 Jira：aa-web">
          <a-input v-model:value="form.jira.aaWebRollback" allow-clear />
        </a-form-item>
      </a-col>
      <a-col :span="24">
        <a-form-item label="回滚 Jira：aa-api">
          <a-input v-model:value="form.jira.aaApiRollback" allow-clear />
        </a-form-item>
      </a-col>
      <a-col :span="24">
        <a-form-item label="事后检查">
          <a-textarea
            v-model:value="form.postChecks"
            :rows="3"
            :maxlength="2000"
            show-count
          />
        </a-form-item>
      </a-col>
      <a-col :span="24">
        <a-form-item label="回滚说明" extra="选填">
          <a-textarea
            v-model:value="form.rollback"
            :rows="2"
            :maxlength="2000"
            show-count
          />
        </a-form-item>
      </a-col>
    </a-row>
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
</style>
