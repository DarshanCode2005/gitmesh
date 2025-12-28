<template>
  <header class="border-b border-white/10 bg-black">
    <div class="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
      <!-- Brand -->
      <div>
        <h1 class="font-mono text-lg font-semibold text-white tracking-tight">
          GitMesh
          <span class="ml-2 text-sm font-normal text-white/60">
            Community Edition
          </span>
        </h1>
        <p class="mt-0.5 text-xs text-white/50">
          A Linux Foundation Decentralized Trust Lab Project
        </p>
      </div>

      <!-- Actions -->
      <nav class="flex items-center gap-5">
        <router-link
          to="/auth/signin"
          class="font-mono text-sm font-medium text-white/80 hover:text-white transition-colors"
        >
          Sign In
        </router-link>

        <router-link
          to="/auth/signup"
          class="font-mono text-sm font-semibold px-4 py-2 rounded-md
                 bg-orange-500 text-black
                 hover:bg-orange-400 transition-colors"
        >
          Sign Up
        </router-link>
      </nav>
    </div>
  </header>
</template>

<script setup>
</script>
