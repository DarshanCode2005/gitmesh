/**
 * DevSpace Project Context Composable
 * Provides reactive access to active project context across all DevSpace pages
 */
import { computed, watch } from 'vue';
import { useStore } from 'vuex';

export function useProject() {
    const store = useStore(); 

    // Computed reactive properties
    const activeProject = computed(() => store.getters['devspace/activeProject']);
    const activeProjectId = computed(() => store.getters['devspace/activeProjectId']);
    const projects = computed(() => store.getters['devspace/projects']);
    const isLoading = computed(() => store.getters['devspace/isLoading']);

    // Check if we have an active project
    const hasActiveProject = computed(() => !!activeProjectId.value);

    // Methods
    const setActiveProject = (project) => {
        store.dispatch('devspace/setActiveProject', project);
    };

    const setActiveProjectId = (projectId) => {
        store.dispatch('devspace/setActiveProjectId', projectId);
    };

    const fetchProjects = () => {
        return store.dispatch('devspace/fetchProjects');
    };

    // Watch for project changes
    const watchProject = (callback, options = { immediate: false }) => {
        return watch(activeProjectId, (newId, oldId) => {
            if (newId && newId !== oldId) {
                callback(newId, oldId);
            }
        }, options);
    };

    return {
        // State
        activeProject,
        activeProjectId,
        projects,
        isLoading,
        hasActiveProject,

        // Methods
        setActiveProject,
        setActiveProjectId,
        fetchProjects,
        watchProject,
    };
}

export default useProject;
