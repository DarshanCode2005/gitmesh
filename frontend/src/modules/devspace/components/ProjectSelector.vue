<template>
  <el-select 
    v-model="activeProjectId" 
    placeholder="Select Project" 
    filterable 
    class="project-selector"
    size="default"
  >
    <el-option
      v-for="project in projects"
      :key="project.id"
      :label="project.name"
      :value="project.id"
    />
  </el-select>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const activeProjectId = computed({
  get: () => store.getters['devspace/activeProjectId'],
  set: (val) => store.dispatch('devspace/setActiveProjectId', val)
});

const projects = computed(() => store.state.devspace.projects || []);

onMounted(() => {
  if (projects.value.length === 0) {
    store.dispatch('devspace/fetchProjects');
  }
});
</script>

<style scoped>
.project-selector {
  width: 200px;
}
</style>
