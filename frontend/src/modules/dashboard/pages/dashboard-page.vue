<template>
  <div v-if="currentTenant" class="flex -m-5 bg-black">
    <div
      class="flex-grow overflow-auto bg-black"
      :style="{
        height: showBanner
          ? 'calc(100vh - 3.5rem)'
          : '100vh',
      }"
      @scroll="handleScroll($event)"
    >
      <div class="flex justify-center bg-black">
        <div class="home-content px-8">
          <div
            class="py-8 -mx-4 px-4 sticky -top-6 bg-black z-20 flex items-center justify-between border-b border-zinc-700"
          >
            <h4
              class="leading-8 font-semibold transition-all duration-100 text-white font-mono mt-8"
              :class="scrolled ? 'text-base' : 'text-xl'"
            >
              {{ currentTenant?.name }} Workspace Dashboard
            </h4>
            <div class="relative mt-8 group flex items-center">
              <div
              class="absolute right-6 top-1/2 -translate-y-1/2 bg-zinc-800 text-zinc-400 font-mono text-xs px-3 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-30"
              >
              Data on this page is refreshed every 15 min
              </div>
              <i class="text-orange-500 ri-time-line text-base cursor-pointer" />
            </div>
          </div>

          <div
            class="mb-8 -mx-4 px-4 sticky top-12 bg-black z-20"
          >
            <app-dashboard-filters class="block" />
          </div>

          <div
            v-if="!loadingCubeToken"
            v-loading="!loadingCubeToken"
            class="app-page-spinner h-16 !relative !min-h-5"
          />
          <div v-else>
            <app-dashboard-members class="mb-8" />
            <app-dashboard-organizations class="mb-8" />
            <app-dashboard-activities class="mb-8" />
          </div>
        </div>
      </div>
    </div>
    <aside
      class="border-l border-zinc-700 overflow-auto px-5 py-6 bg-black"
      :style="{
        height: showBanner
          ? 'calc(100vh - 3.5rem)'
          : '100vh',
      }"
    >
      <app-dashboard-guides v-if="!isQuickstartEnabled()" />
      <app-dashboard-integrations class="mb-10 mt-8" />
      <app-dashboard-task />
    </aside>
  </div>
</template>

<script setup>
import {
  onMounted, onBeforeUnmount, ref, computed, watch,
} from 'vue';
import { useStore } from 'vuex';
import AppDashboardIntegrations from '@/modules/dashboard/components/dashboard-active-integrations.vue';
import {
  mapGetters,
  mapActions,
} from '@/shared/vuex/vuex.helpers';
import AppDashboardGuides from '@/modules/dashboard/components/dashboard-guides.vue';
import AppDashboardActivities from '@/modules/dashboard/components/dashboard-activities.vue';
import AppDashboardMembers from '@/modules/dashboard/components/dashboard-members.vue';
import AppDashboardOrganizations from '@/modules/dashboard/components/dashboard-organizations.vue';
import AppDashboardTask from '@/modules/dashboard/components/dashboard-task.vue';
import AppDashboardFilters from '@/modules/dashboard/components/dashboard-filters.vue';
import { FeatureFlag } from '@/utils/featureFlag';

defineOptions({
  name: 'dashboard',
});

const { currentTenant } = mapGetters('auth');
const { showBanner } = mapGetters('tenant');
const { cubejsApi, cubejsTokenAttempted } = mapGetters('widget');
const { doFetch } = mapActions('report');
const { reset } = mapActions('dashboard');
const { getCubeToken } = mapActions('widget');

const store = useStore();

const storeUnsubscribe = ref(null);
const scrolled = ref(false);

const loadingCubeToken = computed(() => cubejsTokenAttempted.value);

const handleScroll = (event) => {
  scrolled.value = event.target.scrollTop > 20;
};

onMounted(() => {
  if (window.analytics) {
    window.analytics.page('Dashboard');
  }

  if (!cubejsTokenAttempted.value) {
    getCubeToken();
  }

  if (currentTenant.value) {
    doFetch({});
  }

  storeUnsubscribe.value = store.subscribeAction(
    (action) => {
      if (action.type === 'auth/doSelectTenant') {
        doFetch({});
        reset({});
      }
    },
  );
});

onBeforeUnmount(() => {
  storeUnsubscribe.value();
});

watch(currentTenant, (updatedTenant, previousTenant) => {
  if (updatedTenant?.id && previousTenant?.id && updatedTenant.id !== previousTenant.id) {
    getCubeToken();
  }
}, {
  deep: true,
  immediate: true,
});

const isQuickstartEnabled = () => FeatureFlag.isFlagEnabled(FeatureFlag.flags.quickstartV2);

</script>

<style lang="scss" scoped>
aside {
  width: 18.25rem;
  min-width: 18.25rem;
}
.home-content {
  max-width: 60rem;
  width: 100%;
}
</style>
