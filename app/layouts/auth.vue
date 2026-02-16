<script setup lang="ts">
  import { LayoutDashboardIcon } from 'lucide-vue-next'
</script>

<template>
  <div class="relative flex min-h-screen">
    <!-- Left panel: Decorative / branding -->
    <div
      class="bg-primary relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col lg:justify-between"
    >
      <!-- Background pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="auth-pattern absolute inset-0" />
      </div>

      <!-- Floating orbs -->
      <div class="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div class="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

      <!-- Content -->
      <div class="relative z-10 flex flex-1 flex-col justify-between p-12">
        <!-- Logo -->
        <div class="flex items-center gap-3">
          <div
            class="flex size-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm"
          >
            <LayoutDashboardIcon class="size-5 text-white" />
          </div>
          <span class="text-xl font-bold tracking-tight text-white">Todoist</span>
        </div>

        <!-- Center testimonial / info -->
        <div class="space-y-6">
          <blockquote class="space-y-4">
            <p class="text-2xl leading-relaxed font-semibold text-white/95">
              "Organize your tasks, boost your productivity, and achieve your goals with ease."
            </p>
            <footer class="text-sm text-white/70">
              <p>— Built with ❤️ for productivity</p>
            </footer>
          </blockquote>
        </div>

        <!-- Bottom stats -->
        <div class="flex gap-8 text-white/80">
          <div>
            <p class="text-2xl font-bold text-white">10K+</p>
            <p class="text-sm">Active users</p>
          </div>
          <div>
            <p class="text-2xl font-bold text-white">50K+</p>
            <p class="text-sm">Tasks completed</p>
          </div>
          <div>
            <p class="text-2xl font-bold text-white">99%</p>
            <p class="text-sm">Satisfaction</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Right panel: Form content -->
    <div class="flex w-full flex-col items-center justify-center px-4 py-12 sm:px-8 lg:w-1/2">
      <!-- Mobile logo (shown only on small screens) -->
      <div class="mb-8 flex items-center gap-2.5 lg:hidden">
        <div class="bg-primary flex size-9 items-center justify-center rounded-lg">
          <LayoutDashboardIcon class="text-primary-foreground size-5" />
        </div>
        <span class="text-xl font-bold tracking-tight">Todoist</span>
      </div>

      <div class="w-full max-w-[420px]">
        <slot />
      </div>
    </div>
  </div>
</template>
<style scoped>
  .auth-pattern {
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
</style>
