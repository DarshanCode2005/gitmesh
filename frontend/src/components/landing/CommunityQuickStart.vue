<template>
  <section class="max-w-6xl mx-auto px-6 py-20 border-t border-white">
    <h2 class="font-sans text-3xl font-bold text-white tracking-tight mb-10">
      Quick Start
    </h2>

    <div class="space-y-10">
      <!-- Step 1 -->
      <div>
        <h3 class="font-mono text-sm font-semibold text-orange-500 mb-2">
          Step 1 — Clone the Repository
        </h3>

        <div class="relative bg-black border border-white p-4">
          <pre
            class="overflow-x-auto"><code class="font-mono text-sm text-white">$ git clone https://github.com/LF-Decentralized-Trust-labs/gitmesh</code></pre>

          <button @click="copy(commands.clone)" aria-label="Copy command" class="absolute top-2 right-2 p-2 border border-white
           hover:bg-white hover:text-black transition-colors">
            <!-- Copy Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
        </div>

      </div>

      <!-- Step 2 -->
      <div>
        <h3 class="font-mono text-sm font-semibold text-orange-500 mb-2">
          Step 2 — Navigate to the Project
        </h3>

        <div class="relative bg-black border border-white p-4">
          <pre class="overflow-x-auto"><code class="font-mono text-sm text-white">$ cd gitmesh</code></pre>

          <button @click="copy(commands.cd)" aria-label="Copy command" class="absolute top-2 right-2 p-2 border border-white
           hover:bg-white hover:text-black transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Step 3 -->
      <div>
        <h3 class="font-mono text-sm font-semibold text-orange-500 mb-2">
          Step 3 — Start the Community Edition
        </h3>

        <div class="relative bg-black border border-white p-4">
          <pre class="overflow-x-auto"><code class="font-mono text-sm text-white">$ cd scripts<br>$ ./cli clean-dev</code></pre>

          <button @click="copy(commands.run)" aria-label="Copy command" class="absolute top-2 right-2 p-2 border border-white
           hover:bg-white hover:text-black transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
        </div>


        <p class="mt-2 text-sm text-white/70">
          <span class="font-semibold">Note: </span>This starts GitMesh in Community Edition mode using local infrastructure.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
const commands = {
  clone: 'git clone https://github.com/LF-Decentralized-Trust-labs/gitmesh',
  cd: 'cd gitmesh',
  run: 'cd scripts\n./cli clean-dev'
};

const copy = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Failed to copy command', err);
  }
};
</script>
