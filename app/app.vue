<script setup lang="ts">
  import 'vue-sonner/style.css'

  import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator color="var(--primary)" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster position="top-right" :duration="4000" rich-colors />
    <VueQueryDevtools />
  </div>
</template>
