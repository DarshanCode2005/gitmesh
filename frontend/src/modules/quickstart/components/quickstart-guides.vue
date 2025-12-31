<template>
  <div class="panel !p-0 !rounded-lg mb-10">
    <section class="relative">
      <div class="absolute h-1 bg-green-500 top-0 left-0" :style="{ width: `${completionPercentage}%` }" />
      <div v-if="loading">
        <app-loading height="7.5rem" class="mb-1" />
        <app-loading height="7.5rem" class="mb-1" />
        <app-loading height="7.5rem" class="mb-1" />
        <app-loading height="7.5rem" />
      </div>
      <el-collapse
        v-model="activeView"
        accordion
        class="guides"
        @change="trackExpandGuide"
      >
        <el-collapse-item
          v-for="guide of guides"
          :key="guide.key"
          :title="guide.title"
          :name="guide.key"
          :disabled="hasSampleData && guide.disabledInSampleData"
          class="relative cursor-auto px-6 py-2"
        >
          <template #title>
            <el-tooltip
              :disabled="!(hasSampleData && guide.disabledInSampleData)"
              :content="guide.disabledTooltipText"
              placement="top"
            >
              <div class="w-full">
                <cr-quickstart-guide-item-head
                  :guide="guide"
                  :extended="activeView === guide.key"
                />
              </div>
            </el-tooltip>
          </template>
          <template #default>
            <cr-quickstart-guide-item-content
              :guide="guide"
            />
          </template>
        </el-collapse-item>
      </el-collapse>
    </section>
  </div>
</template>

<script setup>
import {
  ref, computed, onMounted,
} from 'vue';
import { storeToRefs } from 'pinia';
import {
  mapGetters,
} from '@/shared/vuex/vuex.helpers';
import { useQuickStartStore } from '@/modules/quickstart/store';
import CrQuickstartGuideItemHead from '@/modules/quickstart/components/item/quickstart-guide-item-head.vue';
import CrQuickstartGuideItemContent from '@/modules/quickstart/components/item/quickstart-guide-item-content.vue';
import AppLoading from '@/shared/loading/loading-placeholder.vue';
import { TenantEventService } from '@/shared/events/tenant-event.service';

const { currentTenant } = mapGetters('auth');

const storeQuickStartGuides = useQuickStartStore();
const { guides, notcompletedGuides } = storeToRefs(
  storeQuickStartGuides,
);
const { getGuides } = storeQuickStartGuides;

const activeView = ref(null);
const loading = ref(false);

const hasSampleData = computed(
  () => currentTenant.value?.hasSampleData,
);

const completionPercentage = computed(() => {
  if (!guides.value || !guides.value.length) {
    return 0;
  }
  const completed = guides.value.filter((g) => g.completed).length;
  return (completed / guides.value.length) * 100;
});

const fetchGuides = () => {
  loading.value = true;
  getGuides({}).then(() => {
    activeView.value = notcompletedGuides.value?.length
      ? notcompletedGuides.value[0].key
      : null;
  })
    .finally(() => {
      loading.value = false;
    });
};

const trackExpandGuide = (activeName) => {
  TenantEventService.event({
    name: 'Onboarding Guide expanded',
    properties: {
      guide: activeName,
    },
  });
};

onMounted(() => {
  fetchGuides();
});
</script>

<script>
export default {
  name: 'CrQuickstartGuides',
};
</script>

<style lang="scss">
.guides.el-collapse {
  .el-collapse-item__header {
    line-height: 1.25rem !important;
    height: auto !important;
    @apply text-xs font-medium py-4 bg-black;
  }
  .el-collapse-item__wrap{
    @apply border-0 bg-black;
  }
  .el-collapse-item__arrow {
     @apply hidden;
   }
}

  .quickstart-summary{
    background: linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.015));
    border: 1px solid rgba(255,255,255,0.03);
    border-radius: 0;
  }
  .quickstart-summary .completion-pill{
    background: rgba(37,99,235,0.06);
    color: rgba(37,99,235,0.95);
    padding:6px 10px;
    border-radius:999px;
  }
  .quickstart-summary .icon-check{ flex-shrink:0; margin-top:4px }
  .quickstart-summary h3{ letter-spacing:0.4px }
  .quickstart-summary ul li{ background: transparent; border-radius:0; padding:6px }

  /* Override primary CTA inside quickstart panels to a modern black/grey style */
  .panel .btn--primary{
    background: #000;
    color: #ffffff;
    border: 1px solid rgba(255,255,255,0.06);
    box-shadow: none;
  }
  .panel .btn--primary:hover{
    background: #111;
  }
  .panel .btn--primary.selected,
  .panel .btn--primary:active,
  .panel .btn--primary:focus{
    background: #F3F4F6;
    color: #111827;
    border-color: rgba(15,23,42,0.04);
  }


</style>
