<template>
  <section class="max-w-6xl mx-auto px-6 py-24">
    <div class="max-w-3xl">
      <!-- Title -->
      <h1
        class="text-white font-sans text-5xl md:text-6xl font-black leading-tight tracking-tight"
      >
        GitMesh
        <span class="block text-xl md:text-2xl font-medium text-white/70 mt-2">
          Community Edition
        </span>
      </h1>

      <!-- Description -->
      <p class="mt-8 text-lg text-white/80 leading-relaxed">
        GitMesh is an open-source Git collaboration platform designed to support
        maintainers and contributors working on decentralized trust
        infrastructure.
      </p>

      <p class="mt-4 text-base text-white/70 leading-relaxed">
        The Community Edition is developed in the open and maintained by
        contributors from multiple open-source organizations under the Linux
        Foundation Decentralized Trust Lab.
      </p>

      <p class="mt-4 text-base text-white/70 leading-relaxed">
        The Enterprise Edition is officially provided and supported by

        <a
          href="https://alveoli.app/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="text-orange-500 font-medium"> Alveoli</span>
        </a>.
      </p>

      <!-- CTAs -->
      <div class="mt-12 flex flex-wrap gap-4">
        <router-link
          to="/auth/signup"
          class="bg-orange-500 text-black px-8 py-3 font-mono text-sm font-semibold hover:bg-orange-400 transition-colors"
        >
          Get Started
        </router-link>

        <router-link
          to="/auth/signin"
          class="border border-white text-white px-8 py-3 font-mono text-sm font-semibold hover:bg-white hover:text-black transition-colors"
        >
          Sign In
        </router-link>
      </div>
    </div>

    <!-- Principles -->
    <div class="mt-24 grid grid-cols-1 md:grid-cols-3 gap-10">
      <div>
        <h3 class="font-mono text-base font-semibold text-white mb-2">
          Open Governance
        </h3>
        <p class="text-sm text-white/70 leading-relaxed">
          Developed through transparent, community-driven governance under the
          Linux Foundation Decentralized Trust Lab.
        </p>
      </div>

      <div>
        <h3 class="font-mono text-base font-semibold text-white mb-2">
          Self-Hosted by Design
        </h3>
        <p class="text-sm text-white/70 leading-relaxed">
          Runs on infrastructure you control, using your own repositories,
          services, and credentials.
        </p>
      </div>

      <div>
        <h3 class="font-mono text-base font-semibold text-white mb-2">
          Apache 2.0 Licensed
        </h3>
        <p class="text-sm text-white/70 leading-relaxed">
          Licensed under Apache 2.0, allowing use, modification, and
          redistribution.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup></script>
