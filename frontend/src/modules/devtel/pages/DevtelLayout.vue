<template>
  <div class="devtel-layout">
    <header class="devtel-header">
      <div class="header-left">
        <div class="app-title">
          <i v-if="pageIcon" :class="pageIcon" class="mr-2"></i>
          <span>{{ pageTitle }}</span>
        </div>
        
        <div class="project-selector-wrapper">
          <project-selector />
        </div>
      </div>
      
      <div class="header-actions">
        <el-button 
          type="primary" 
          icon="ri-add-line"
          @click="openNewIssueModal"
        >
          New Issue
        </el-button>
        <el-button 
          plain
          icon="ri-folder-add-line"
          @click="openNewProjectModal"
        >
          New Project
        </el-button>
      </div>
    </header>

    <div class="devtel-content">
      <router-view />
    </div>

    <issue-form-modal
      v-if="showNewIssueModal"
      v-model="showNewIssueModal"
      :project-id="activeProjectId"
      @success="handleIssueCreated"
    />

    <project-form-modal
      v-if="showNewProjectModal"
      v-model="showNewProjectModal"
      @success="handleProjectCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import ProjectSelector from '../components/ProjectSelector.vue';
import IssueFormModal from '../components/IssueFormModal.vue';
import ProjectFormModal from '../components/ProjectFormModal.vue';

const store = useStore();
const route = useRoute();

const showNewIssueModal = ref(false);
const showNewProjectModal = ref(false);

const activeProjectId = computed(() => store.getters['devspace/activeProjectId']);

const pageTitle = computed(() => {
  return route.meta.title || 'DevSpace';
});

const pageIcon = computed(() => {
  return null;
});

const openNewIssueModal = () => {
  showNewIssueModal.value = true;
};

const openNewProjectModal = () => {
  showNewProjectModal.value = true;
};

const handleIssueCreated = () => {
  if (activeProjectId.value) {
    store.dispatch('issues/fetchIssues', activeProjectId.value);
  }
};

const handleProjectCreated = () => {
  store.dispatch('devspace/fetchProjects');
};
</script>

<style lang="scss">
.devtel-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  
  /* Force Dark Theme Variables - "Dark Black" Style */
  --el-bg-color: #000000;
  --el-bg-color-page: #000000;
  --el-bg-color-overlay: #000000;

  --el-text-color-primary: #ffffff;
  --el-text-color-regular: #a1a1aa; /* zinc-400 */
  --el-text-color-secondary: #71717a; /* zinc-500 */
  --el-text-color-placeholder: #52525b; /* zinc-600 */
  --el-text-color-disabled: #3f3f46; /* zinc-700 */

  --el-border-color: #3f3f46; /* zinc-700 */
  --el-border-color-light: #27272a; /* zinc-800 */
  --el-border-color-lighter: #18181b; /* zinc-900 */
  --el-border-color-extra-light: #000000;
  --el-border-color-dark: #52525b; /* zinc-600 */

  --el-fill-color: #27272a; /* zinc-800 */
  --el-fill-color-light: #18181b; /* zinc-900 */
  --el-fill-color-lighter: #18181b; /* zinc-900 */
  --el-fill-color-extra-light: #09090b; /* zinc-950 */
  --el-fill-color-dark: #3f3f46;
  --el-fill-color-blank: #000000;

  --el-mask-color: rgba(0, 0, 0, 0.8);
  --el-mask-color-extra-light: rgba(0, 0, 0, 0.3);
  
  /* Card specific overrides if needed */
  --el-card-bg-color: #000000;
  --el-card-border-color: #3f3f46;

  background-color: var(--el-bg-color);
  color: var(--el-text-color-primary);
}

.devtel-header {
  height: 64px;
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  border-bottom: 1px solid var(--el-border-color);
  background-color: var(--el-bg-color);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.app-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  
  i {
    font-size: 20px;
    margin-right: 8px;
  }
}

.header-actions {
  display: flex;
  gap: 12px;
}

.devtel-content {
  flex: 1;
  overflow: auto;
  position: relative;
  background-color: var(--el-bg-color-page);
  padding: 24px;
}
</style>
