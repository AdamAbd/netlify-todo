<script setup lang="ts">
  import 'vue-sonner/style.css'
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator color="var(--primary)" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster position="top-right" :duration="4000" rich-colors />
  </div>
</template>
