<template>
  <div class="backlog-page">
    <div class="page-header">
      <h1>Backlog</h1>
      <el-button type="primary" size="small">
        <i class="ri-add-line"></i>
        New Issue
      </el-button>
    </div>
    
    <div class="backlog-content">
      <el-table :data="issues" v-loading="isLoading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="100">
          <template #default="{ row }">
            <span class="issue-id">#{{ row.id?.slice(0, 8) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="Title" min-width="200" />
        <el-table-column prop="status" label="Status" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="Priority" width="100">
          <template #default="{ row }">
            <span :class="['priority-badge', `priority-${row.priority}`]">
              {{ row.priority }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="estimatedHours" label="Est. Hours" width="100" />
        <el-table-column prop="assignee" label="Assignee" width="150">
          <template #default="{ row }">
            <span v-if="row.assignee">{{ row.assignee.fullName || row.assignee.email }}</span>
            <span v-else class="unassigned">Unassigned</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useProject } from '@/modules/devspace/composables/useProject';

export default {
  name: 'BacklogPage',
  setup() {
    const store = useStore();
    const { activeProjectId, hasActiveProject } = useProject();

    const issues = computed(() => store.getters['issues/issues']);
    const isLoading = computed(() => store.getters['issues/isLoading']);

    // Load issues when mounted
    onMounted(async () => {
      if (hasActiveProject.value) {
        await store.dispatch('issues/fetchIssues', activeProjectId.value);
      }
    });

    return { issues, isLoading, hasActiveProject };
  },
};
</script>

<style scoped>
.backlog-page {
  height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.issue-id {
  font-family: monospace;
  color: var(--el-text-color-secondary);
}

.priority-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: capitalize;
  border: 1px solid transparent;
}

.priority-urgent { 
  background-color: rgba(239, 68, 68, 0.2); 
  color: #f87171; 
  border-color: rgba(239, 68, 68, 0.3);
}

.priority-high { 
  background-color: rgba(249, 115, 22, 0.2); 
  color: #fb923c;
  border-color: rgba(249, 115, 22, 0.3);
}

.priority-medium { 
  background-color: rgba(59, 130, 246, 0.2); 
  color: #60a5fa;
  border-color: rgba(59, 130, 246, 0.3);
}

.priority-low { 
  background-color: rgba(16, 185, 129, 0.2); 
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.3);
}

.unassigned {
  color: var(--el-text-color-placeholder);
  font-style: italic;
}
</style>
