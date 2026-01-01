<template>
  <div class="board-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <h1>Issues Board</h1>
        <span class="issue-count" v-if="total > 0">{{ total }} issues</span>
      </div>
      <div class="header-right">
        <el-input
          v-model="searchQuery"
          placeholder="Search issues..."
          prefix-icon="Search"
          clearable
          size="small"
          style="width: 200px"
          @input="debouncedSearch"
        />
        <el-button size="small" @click="showFilters = !showFilters">
          <i class="ri-filter-3-line"></i>
          Filters
        </el-button>
        <el-button type="primary" size="small" @click="$emit('create-issue')">
          <i class="ri-add-line"></i>
          New Issue
        </el-button>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar" v-if="showFilters">
      <el-select
        v-model="filters.priority"
        multiple
        placeholder="Priority"
        size="small"
        clearable
        style="width: 140px"
        @change="applyFilters"
      >
        <el-option label="Urgent" value="urgent" />
        <el-option label="High" value="high" />
        <el-option label="Medium" value="medium" />
        <el-option label="Low" value="low" />
      </el-select>
      
      <el-select
        v-model="filters.cycleId"
        placeholder="Cycle"
        size="small"
        clearable
        style="width: 160px"
        @change="applyFilters"
      >
        <el-option
          v-for="cycle in cycles"
          :key="cycle.id"
          :label="cycle.name"
          :value="cycle.id"
        />
        <el-option label="No Cycle" value="none" />
      </el-select>
      
      <el-button size="small" @click="resetFilters" v-if="hasActiveFilters">
        Clear filters
      </el-button>
    </div>

    <!-- Kanban Board -->
    <div class="kanban-board" v-loading="isLoading">
      <div
        v-for="column in columns"
        :key="column.id"
        class="kanban-column"
      >
        <div class="column-header">
          <span class="column-title">{{ column.label }}</span>
          <span class="column-count">{{ getColumnIssues(column.id).length }}</span>
        </div>
        
        <div
          class="column-content"
          @dragover.prevent
          @drop="onDrop($event, column.id)"
        >
          <div
            v-for="issue in getColumnIssues(column.id)"
            :key="issue.id"
            class="issue-card"
            draggable="true"
            @dragstart="onDragStart($event, issue)"
            @click="selectIssue(issue)"
          >
            <div class="card-header">
              <span class="issue-id">#{{ issue.id.slice(0, 8) }}</span>
              <span :class="['priority-badge', `priority-${issue.priority}`]">
                {{ issue.priority }}
              </span>
            </div>
            <div class="card-title">{{ issue.title }}</div>
            <div class="card-footer">
              <div class="assignee" v-if="issue.assignee">
                <el-avatar :size="20">
                  {{ issue.assignee.firstName?.[0] || issue.assignee.email?.[0] }}
                </el-avatar>
              </div>
              <div class="card-meta">
                <span v-if="issue.estimatedHours" class="hours">
                  <i class="ri-time-line"></i>
                  {{ issue.estimatedHours }}h
                </span>
              </div>
            </div>
          </div>
          
          <div class="column-empty" v-if="getColumnIssues(column.id).length === 0">
            No issues
          </div>
        </div>
      </div>
    </div>

    <!-- Issue Detail Panel -->
    <el-drawer
      v-model="showIssuePanel"
      :title="selectedIssue?.title"
      size="500px"
      @close="clearSelectedIssue"
    >
      <div class="issue-panel" v-if="selectedIssue">
        <div class="panel-section">
          <label>Status</label>
          <el-select
            v-model="selectedIssue.status"
            @change="updateIssueStatus"
            style="width: 100%"
          >
            <el-option
              v-for="col in columns"
              :key="col.id"
              :label="col.label"
              :value="col.id"
            />
          </el-select>
        </div>
        
        <div class="panel-section">
          <label>Priority</label>
          <el-select
            v-model="selectedIssue.priority"
            @change="updateIssuePriority"
            style="width: 100%"
          >
            <el-option label="Urgent" value="urgent" />
            <el-option label="High" value="high" />
            <el-option label="Medium" value="medium" />
            <el-option label="Low" value="low" />
          </el-select>
        </div>
        
        <div class="panel-section">
          <label>Description</label>
          <el-input
            v-model="selectedIssue.description"
            type="textarea"
            :rows="4"
            @blur="updateIssueDescription"
          />
        </div>
        
        <el-row :gutter="16">
          <el-col :span="12">
            <div class="panel-section">
              <label>Estimated Hours</label>
              <el-input-number
                v-model="selectedIssue.estimatedHours"
                :min="0"
                :precision="1"
                style="width: 100%"
                @change="updateIssueHours"
              />
            </div>
          </el-col>
          <el-col :span="12">
            <div class="panel-section">
              <label>Actual Hours</label>
              <el-input-number
                v-model="selectedIssue.actualHours"
                :min="0"
                :precision="1"
                style="width: 100%"
                @change="updateIssueHours"
              />
            </div>
          </el-col>
        </el-row>
        
        <!-- Comments Section -->
        <div class="panel-section comments-section">
          <label>Comments</label>
          <div class="comments-list">
            <!-- Comments would be loaded here -->
            <div class="no-comments" v-if="!comments.length">
              No comments yet
            </div>
          </div>
          <el-input
            v-model="newComment"
            type="textarea"
            :rows="2"
            placeholder="Add a comment..."
          />
          <el-button
            size="small"
            type="primary"
            style="margin-top: 8px"
            @click="addComment"
            :disabled="!newComment.trim()"
          >
            Add Comment
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { computed, ref, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus';
import { debounce } from 'lodash';
import { useProject } from '@/modules/devspace/composables/useProject';

export default {
  name: 'BoardPage',

  setup() {
    const store = useStore();
    const { activeProjectId, hasActiveProject } = useProject();

    // Board columns
    const columns = [
      { id: 'backlog', label: 'Backlog' },
      { id: 'todo', label: 'To Do' },
      { id: 'in_progress', label: 'In Progress' },
      { id: 'review', label: 'Review' },
      { id: 'done', label: 'Done' },
    ];

    // State
    const showFilters = ref(false);
    const showIssuePanel = ref(false);
    const searchQuery = ref('');
    const newComment = ref('');
    const comments = ref([]);
    const filters = ref({
      priority: [],
      cycleId: null,
    });
    const draggedIssue = ref(null);

    // Computed
    const isLoading = computed(() => store.getters['issues/isLoading']);
    const total = computed(() => store.getters['issues/total']);
    const issuesByStatus = computed(() => store.getters['issues/issuesByStatus']);
    const selectedIssue = computed(() => store.getters['issues/selectedIssue']);
    const cycles = computed(() => store.getters['cycles/cycles']);
    const hasActiveFilters = computed(() => 
      filters.value.priority.length > 0 || filters.value.cycleId
    );

    // Methods
    const getColumnIssues = (status) => issuesByStatus.value[status] || [];

    const applyFilters = () => {
      const filterParams = { ...filters.value };
      if (filterParams.cycleId === 'none') {
        filterParams.hasNoCycle = true;
        delete filterParams.cycleId;
      }
      store.dispatch('issues/setFilters', filterParams);
    };

    const resetFilters = () => {
      filters.value = { priority: [], cycleId: null };
      store.dispatch('issues/resetFilters');
    };

    const debouncedSearch = debounce(() => {
      store.dispatch('issues/setFilters', { search: searchQuery.value });
    }, 300);

    const selectIssue = async (issue) => {
      await store.dispatch('issues/selectIssue', issue.id);
      showIssuePanel.value = true;
    };

    const clearSelectedIssue = () => {
      store.dispatch('issues/clearSelectedIssue');
    };

    const updateIssueStatus = async () => {
      try {
        await store.dispatch('issues/updateIssue', {
          issueId: selectedIssue.value.id,
          data: { status: selectedIssue.value.status },
        });
      } catch (error) {
        ElMessage.error('Failed to update status');
      }
    };

    const updateIssuePriority = async () => {
      try {
        await store.dispatch('issues/updateIssue', {
          issueId: selectedIssue.value.id,
          data: { priority: selectedIssue.value.priority },
        });
      } catch (error) {
        ElMessage.error('Failed to update priority');
      }
    };

    const updateIssueDescription = async () => {
      try {
        await store.dispatch('issues/updateIssue', {
          issueId: selectedIssue.value.id,
          data: { description: selectedIssue.value.description },
        });
      } catch (error) {
        ElMessage.error('Failed to update description');
      }
    };

    const updateIssueHours = async () => {
      try {
        await store.dispatch('issues/updateIssue', {
          issueId: selectedIssue.value.id,
          data: {
            estimatedHours: selectedIssue.value.estimatedHours,
            actualHours: selectedIssue.value.actualHours,
          },
        });
      } catch (error) {
        ElMessage.error('Failed to update hours');
      }
    };

    const addComment = () => {
      // TODO: Implement comment API
      ElMessage.info('Comments coming soon');
      newComment.value = '';
    };

    // Drag and drop
    const onDragStart = (event, issue) => {
      draggedIssue.value = issue;
      event.dataTransfer.effectAllowed = 'move';
    };

    const onDrop = async (event, newStatus) => {
      event.preventDefault();
      if (!draggedIssue.value) return;
      if (draggedIssue.value.status === newStatus) return;

      try {
        await store.dispatch('issues/moveIssue', {
          issueId: draggedIssue.value.id,
          newStatus,
        });
      } catch (error) {
        ElMessage.error('Failed to move issue');
      }
      
      draggedIssue.value = null;
    };

    // Watch selected issue to show panel
    watch(selectedIssue, (issue) => {
      if (issue) {
        showIssuePanel.value = true;
      }
    });



    // Load data when mounted
    onMounted(async () => {
      if (hasActiveProject.value) {
        await store.dispatch('cycles/fetchCycles', activeProjectId.value);
        await store.dispatch('issues/fetchIssues', activeProjectId.value);
      }
    });

    return {
      columns,
      showFilters,
      showIssuePanel,
      searchQuery,
      newComment,
      comments,
      filters,
      draggedIssue,
      isLoading,
      total,
      issuesByStatus,
      selectedIssue,
      cycles,
      hasActiveFilters,
      hasActiveProject,
      getColumnIssues,
      applyFilters,
      resetFilters,
      debouncedSearch,
      selectIssue,
      clearSelectedIssue,
      updateIssueStatus,
      updateIssuePriority,
      updateIssueDescription,
      updateIssueHours,
      addComment,
      onDragStart,
      onDrop,
    };
  },
};
</script>

<style scoped>
.board-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: var(--el-text-color-primary);
}

.issue-count {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background-color: transparent;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
}

.kanban-board {
  flex: 1;
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 16px;
}

.kanban-column {
  flex: 0 0 280px;
  display: flex;
  flex-direction: column;
  background-color: transparent; /* Clean look */
  border-radius: 8px;
  max-height: calc(100vh - 250px);
  border: 1px solid transparent; /* Reserve space or just implicit */
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 4px; /* Reduced padding since no bg */
  margin-bottom: 8px;
  border-bottom: 1px solid transparent; /* No underline for clean look */
}

.column-title {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.column-count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background-color: var(--el-fill-color);
  padding: 2px 8px;
  border-radius: 10px;
}

.column-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 4px; /* Align with header */
  min-height: 100px;
}

.column-empty {
  text-align: center;
  padding: 24px;
  color: var(--el-text-color-placeholder);
  font-size: 14px;
  border: 1px dashed var(--el-border-color-dark);
  border-radius: 8px;
}

.issue-card {
  background-color: #18181b; /* zinc-900 to pop against black */
  border: 1px solid #27272a; /* zinc-800 */
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.issue-card:hover {
  border-color: var(--el-color-primary);
  background-color: #27272a; /* Slightly lighter on hover */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.issue-card:active {
  cursor: grabbing;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.issue-id {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-family: monospace;
}

.priority-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: 600;
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

.card-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 12px;
  line-height: 1.4;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.card-meta .hours {
  display: flex;
  align-items: center;
  gap: 4px;
}

.panel-section {
  margin-bottom: 20px;
}

.panel-section label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.comments-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--el-border-color-light);
}

.comments-list {
  margin-bottom: 12px;
}

.no-comments {
  text-align: center;
  padding: 24px;
  color: var(--el-text-color-placeholder);
}
</style>
