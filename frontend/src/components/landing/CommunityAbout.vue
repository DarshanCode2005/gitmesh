<template>
  <section class="max-w-6xl mx-auto px-6 py-20 border-t border-white">
    <h2 class="font-sans text-3xl font-bold text-white tracking-tight mb-12">
      About the Project
    </h2>

    <p v-if="loading" class="text-white/60 font-mono">
      Loading documentation…
    </p>

    <p v-if="error" class="text-red-400 font-mono">
      Failed to load project documentation.
    </p>

    <div
      v-if="!loading && !error"
      class="grid grid-cols-1 md:grid-cols-2 gap-8"
    >
      <a
        v-for="doc in docs"
        :key="doc.id"
        :href="doc.url"
        target="_blank"
        rel="noopener noreferrer"
        class="block border border-white p-6
               hover:border-orange-500 transition-colors"
      >
        <h3 class="font-mono text-lg font-semibold text-orange-500 mb-3">
          {{ doc.title }}
        </h3>

        <p class="text-white/80 text-sm leading-relaxed line-clamp-4">
          {{ doc.summary }}
        </p>

        <span class="mt-4 inline-block font-mono text-sm text-orange-500">
          Read more →
        </span>
      </a>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const RAW_BASE =
  'https://raw.githubusercontent.com/LF-Decentralized-Trust-labs/gitmesh/main';

const GITHUB_BASE =
  'https://github.com/LF-Decentralized-Trust-labs/gitmesh/blob/main';

const SOURCES = [
  { id: 'contributing', title: 'Contributing', file: 'CONTRIBUTING.md' },
  { id: 'security', title: 'Security', file: 'SECURITY.md' },
  { id: 'conduct', title: 'Code of Conduct', file: 'CODE_OF_CONDUCT.md' },
  { id: 'governance', title: 'Governance', file: 'GOVERNANCE.md' },
  { id: 'license', title: 'License', file: 'LICENSE' },
];

const docs = ref([]);
const loading = ref(true);
const error = ref(false);

function extractSummary(markdown) {
  return (
    markdown
      .replace(/^#+\s.*$/gm, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`]*`/g, '')
      .replace(/\n+/g, ' ')
      .trim()
      .slice(0, 240) + '…'
  );
}

onMounted(async () => {
  try {
    const results = await Promise.all(
      SOURCES.map(async (src) => {
        const res = await fetch(`${RAW_BASE}/${src.file}`);
        if (!res.ok) return null;

        const text = await res.text();
        return {
          id: src.id,
          title: src.title,
          summary: extractSummary(text),
          url: `${GITHUB_BASE}/${src.file}`,
        };
      })
    );

    docs.value = results.filter(Boolean);
  } catch {
    error.value = true;
  } finally {
    loading.value = false;
  }
});
</script>
