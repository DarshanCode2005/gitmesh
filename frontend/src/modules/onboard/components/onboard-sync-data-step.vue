<template>
  <div class="relative min-h-[400px]">

    <div
      v-if="loading"
      class="flex flex-col items-center justify-center py-24 gap-4"
    >
      <div class="relative w-16 h-16">
        <div class="absolute inset-0 border-2 border-zinc-900 rounded-full"></div>
        <div class="absolute inset-0 border-2 border-t-orange-600 rounded-full animate-spin"></div>
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="h-2 w-2 bg-orange-600 animate-ping"></span>
        </div>
      </div>
      <span class="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.3em] animate-pulse">
        Scanning_Available_Modules...
      </span>
    </div>

    <div v-else class="space-y-10">
      <div v-if="highlightedIntegrationsArray.length > 0">
        <div class="flex items-center gap-4 mb-4">
          <span class="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.3em]">Priority_Deployment</span>
          <div class="h-[1px] flex-1 bg-zinc-900"></div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <app-onboard-integration-item
            v-for="highlightedIntegration in highlightedIntegrationsArray"
            :key="highlightedIntegration.platform"
            :integration="highlightedIntegration"
            @allow-redirect="onConnect"
            @invite-colleagues="emit('inviteColleagues')"
          />
        </div>
      </div>

      <div v-if="integrationsArray.length > 0">
        <div class="flex items-center gap-4 mb-4">
          <span class="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.3em]">Peripheral_Links</span>
          <div class="h-[1px] flex-1 bg-zinc-900"></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <app-onboard-integration-item
            v-for="integration in integrationsArray"
            :key="integration.platform"
            :integration="integration"
            @allow-redirect="onConnect"
          />
        </div>
      </div>
    </div>

    <app-dialog
      v-model="showGithubDialog"
      size="small"
      title="GitHub Integration"
      custom-class="terminal-dialog"
    >
    <template #title>
        <div class="flex items-center gap-3">
        <i class="ri-github-fill text-xl"></i>
        <span>GitHub Integration</span>
        </div>
    </template>
    <template #content>
      <div class="p-8 max-w-xs mx-auto space-y-6">

        <div class="space-y-3 text-xs">
          <div class="flex items-center gap-3 text-emerald-500">
            <i class="ri-checkbox-circle-fill"></i>
            <span>Handshake established</span>
          </div>
          <div class="flex items-center gap-3 text-zinc-400">
            <div class="w-3 h-3 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin"></div>
            <span>Configuring access...</span>
          </div>
          <div class="flex items-center gap-3 text-zinc-300">
            <i class="ri-checkbox-blank-circle-line"></i>
            <span>Finalizing sync</span>
          </div>
        </div>
      </div>
    </template>
    </app-dialog>
  </div>
</template>

<script setup>
import { useStore } from 'vuex';
import { computed, onMounted, ref } from 'vue';
import { GitmeshIntegrations } from '@/integrations/integrations-config';
import AppOnboardIntegrationItem from '@/modules/onboard/components/onboard-integration-item.vue';
import { minValue } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';

const emit = defineEmits(['allowRedirect', 'inviteColleagues']);
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => {},
  },
});

const store = useStore();

const loading = computed(() => store.getters['integration/loadingFetch']);
const integrationsArray = computed(() => GitmeshIntegrations.mappedConfigs(store)
  .filter((i) => !i.onboard?.highlight && !!i.onboard));
const highlightedIntegrationsArray = computed(() => GitmeshIntegrations.mappedConfigs(store)
  .filter((i) => i.onboard?.highlight && !!i.onboard));
const showGithubDialog = ref(false);

useVuelidate({
  activeIntegrations: {
    minValue: minValue(1),
  },
}, props.modelValue);

const handleGithubInstallation = async () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const installId = params.get('installation_id');
  const source = params.get('source');

  if (source === 'discord' && params.get('guild_id')) {
    await store.dispatch('integration/doDiscordConnect', {
      guildId: params.get('guild_id'),
    });
    return;
  }

  if (source === 'github' || code || installId) {
    showGithubDialog.value = true;
    try {
      await store.dispatch('integration/doGithubConnect', {
        code: code || null,
        installId: installId || null,
        setupAction: params.get('setup_action') || 'install',
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('GitHub connection failed:', error);
      if (source === 'github' && !installId) showManualInputDialog();
    } finally {
      showGithubDialog.value = false;
    }
  }
};

const showManualInputDialog = () => {
  const installId = prompt('IDENTIFY_INSTALLATION_ID:');
  if (installId && !isNaN(installId)) {
    showGithubDialog.value = true;
    store.dispatch('integration/doGithubConnect', {
      code: null, installId: installId, setupAction: 'install',
    }).finally(() => { showGithubDialog.value = false; });
  }
};

onMounted(async () => { await handleGithubInstallation(); });
const onConnect = (val) => { emit('allowRedirect', val); };
</script>

<style scoped>
/* Scoped Dialog Overrides for the "Robotic" look */
:deep(.terminal-dialog) {
  border-radius: 0px !important;
  background-color: #09090b !important;
  border: 1px solid #18181b !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
}

:deep(.terminal-dialog .el-dialog__header) {
  padding: 1rem !important;
  border-bottom: 1px solid #18181b !important;
  margin-right: 0px !important;
}

:deep(.terminal-dialog .el-dialog__title) {
  font-family: 'JetBrains Mono', monospace !important;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-size: 11px !important;
  color: #a1a1aa !important;
}

:deep(.terminal-dialog .el-dialog__body) {
  padding: 0px !important;
}

:deep(.terminal-dialog .el-dialog__close) {
  color: #3f3f46 !important;
}
:deep(.terminal-dialog .el-dialog__close:hover) {
  color: #ea580c !important;
}
</style>