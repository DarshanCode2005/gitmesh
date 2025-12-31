<template>
  <div
    v-if="isPrimaryWorkspace && notcompletedGuides.length > 0"
    class="px-1"
  >
    <el-tooltip
      key="menu-link-quickstart"
      :disabled="!props.collapsed"
      :hide-after="50"
      content="Welcome aboard"
      effect="dark"
      placement="right"
      raw-content
    >
      <router-link
        id="menu-quickstart"
        :to="{ name: 'welcomeaboard' }"
        class="quickstart-card h-9 transition mb-2 overflow-hidden text-sm"
        :class="{ 'justify-center': props.collapsed, 'flex items-center': true }"
        active-class="quickstart-card--active"
      >
        <div class="quickstart-icon" :class="{ 'mr-3': !props.collapsed }">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12 2l2.39 4.85L20 8.18l-4 3.9L17.8 18 12 15.27 6.2 18 8 12.08 4 8.18l5.61-.98L12 2z" fill="#A3AED0" />
          </svg>
        </div>

        <div v-if="!props.collapsed" class="flex flex-grow items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="quickstart-title">
              Quickstart Guide
            </span>
            <span class="quickstart-sub text-xs text-zinc-400">New</span>
          </div>

          <div class="quickstart-badge">
            <span class="text-xs font-medium">{{ guides.length - notcompletedGuides.length }}/{{ guides.length }}</span>
          </div>
        </div>
      </router-link>
    </el-tooltip>
    <div class="border-t border-zinc-700 mb-3 mt-1" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useQuickStartStore } from '@/modules/quickstart/store';
import { storeToRefs } from 'pinia';
import { mapGetters } from '@/shared/vuex/vuex.helpers';

const props = defineProps<{
  collapsed: boolean,
}>();

const { rows } = mapGetters('tenant');
const { currentTenant } = mapGetters('auth');

const storeQuickStartGuides = useQuickStartStore();
const { notcompletedGuides, guides } = storeToRefs(storeQuickStartGuides);
const { getGuides } = storeQuickStartGuides;

const isPrimaryWorkspace = computed(() => {
  const tenants = rows.value;
  if (tenants.length > 0) {
    const oldestTenant = tenants.reduce((oldest: any, tenant: any) => {
      const oldestDate = new Date(oldest.createdAt);
      const currentTenantDate = new Date(tenant.createdAt);
      return oldestDate > currentTenantDate ? tenant : oldest;
    }, tenants[0]);
    return oldestTenant.id === currentTenant.value.id;
  }
  return false;
});

onMounted(() => {
  getGuides();
});
</script>

<script lang="ts">
export default {
  name: 'CrMenuQuickstart',
};
</script>

<style scoped lang="scss">
.quickstart-card{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:6px 10px;
  border-radius:0;
  background:linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.015));
  border:1px solid rgba(255,255,255,0.03);
  color:rgba(255,255,255,0.92);
  transition:all 160ms ease;
}
.quickstart-card:hover{ background: rgba(255,255,255,0.03); transform: translateY(-1px); }
.quickstart-card--active{ background: linear-gradient(90deg, rgba(37,99,235,0.12), rgba(37,99,235,0.06)); color: #E6EDFF; border-color: rgba(37,99,235,0.22); }
.quickstart-icon{ width:28px; height:28px; display:flex; align-items:center; justify-content:center; border-radius:0; background: rgba(255,255,255,0.02); }
.quickstart-title{ font-weight:600; color: rgba(255,255,255,0.95); }
.quickstart-sub{ background: transparent; padding:0 4px; }
.quickstart-badge{ min-width:44px; text-align:center; padding:3px 6px; border-radius:0; background: rgba(255,255,255,0.02); color: rgba(255,255,255,0.85); border:1px solid rgba(255,255,255,0.02); }

/* Center when collapsed */
.justify-center.quickstart-card{ justify-content:center; }
.justify-center .quickstart-title, .justify-center .quickstart-badge, .justify-center .quickstart-sub{ display:none; }
.justify-center .quickstart-icon{ margin:0; }
</style>
