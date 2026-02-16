<script setup lang="ts">
  import {
    ArrowRightIcon,
    CheckCircle2Icon,
    KanbanIcon,
    ImageIcon,
    ListChecksIcon,
    SparklesIcon,
    ShieldCheckIcon,
    LayoutDashboardIcon,
    ZapIcon,
    GithubIcon,
    MoonIcon,
    SunIcon,
  } from 'lucide-vue-next'

  definePageMeta({
    layout: false,
  })

  useHead({
    title: 'Todoist - Organize Your Life, One Task at a Time',
    meta: [
      {
        name: 'description',
        content:
          'A beautiful and powerful task management app with Kanban boards, rich items, and seamless collaboration.',
      },
    ],
  })

  const isDark = useDark()
  const toggleTheme = useToggle(isDark)

  const features = [
    {
      icon: KanbanIcon,
      title: 'Kanban Board',
      description:
        'Organize tasks with Backlog, In Progress, and Finished columns for clear workflow visibility.',
    },
    {
      icon: ListChecksIcon,
      title: 'Rich Checklist Items',
      description:
        'Add flexible sub-items with JSON-powered data structure for checklists and notes.',
    },
    {
      icon: ImageIcon,
      title: 'Image Attachments',
      description: 'Attach images to your todos for richer context and visual reference.',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure Auth',
      description:
        'Sign in with email/password or Google OAuth for a seamless authentication experience.',
    },
    {
      icon: ZapIcon,
      title: 'Blazing Fast',
      description:
        'Built with Nuxt 4 and SSR for lightning-fast page loads and optimal performance.',
    },
    {
      icon: SparklesIcon,
      title: 'Beautiful UI',
      description:
        'Carefully crafted interface with dark mode support and smooth micro-animations.',
    },
  ]
</script>

<template>
  <div class="bg-background min-h-screen">
    <!-- Navbar -->
    <header class="bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-xl">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <NuxtLink to="/" class="flex items-center gap-2.5">
          <div class="bg-primary flex size-8 items-center justify-center rounded-lg">
            <LayoutDashboardIcon class="text-primary-foreground size-4" />
          </div>
          <span class="text-lg font-bold tracking-tight">Todoist</span>
        </NuxtLink>
        <div class="flex items-center gap-2">
          <Button variant="ghost" size="icon" @click="toggleTheme">
            <SunIcon v-if="isDark" class="size-4" />
            <MoonIcon v-else class="size-4" />
          </Button>
          <Button variant="ghost" as-child>
            <NuxtLink to="/login">Sign In</NuxtLink>
          </Button>
          <Button as-child>
            <NuxtLink to="/register" class="gap-1.5">
              Get Started
              <ArrowRightIcon class="size-4" />
            </NuxtLink>
          </Button>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <!-- Background decorations -->
      <div class="pointer-events-none absolute inset-0 -z-10">
        <div
          class="bg-primary/8 absolute top-0 -left-40 h-[600px] w-[600px] rounded-full blur-3xl"
        />
        <div
          class="bg-secondary/8 absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full blur-3xl"
        />
        <div
          class="bg-accent/5 absolute top-1/3 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full blur-3xl"
        />
      </div>

      <div class="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div class="mx-auto max-w-3xl text-center">
          <!-- Badge -->
          <div
            class="bg-card mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium shadow-sm"
          >
            <SparklesIcon class="text-primary size-4" />
            <span>Now with Kanban Board & Image Support</span>
          </div>

          <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Organize Your Life,
            <span
              class="from-primary via-secondary to-accent bg-linear-to-r bg-clip-text text-transparent"
            >
              One Task at a Time
            </span>
          </h1>
          <p class="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg sm:text-xl">
            A beautiful task management app with Kanban boards, rich checklist items, and image
            attachments. Stay productive and never miss a beat.
          </p>

          <!-- CTA Buttons -->
          <div class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" as-child class="min-w-[180px] gap-2 text-base">
              <NuxtLink to="/register">
                Start Free
                <ArrowRightIcon class="size-4" />
              </NuxtLink>
            </Button>
            <Button variant="outline" size="lg" as-child class="min-w-[180px] gap-2 text-base">
              <NuxtLink to="/login"> Sign In </NuxtLink>
            </Button>
          </div>
        </div>

        <!-- Hero Preview Card -->
        <div class="mx-auto mt-20 max-w-5xl">
          <div class="bg-card ring-border/50 relative rounded-2xl border p-2 shadow-2xl ring-1">
            <!-- Fake browser bar -->
            <div class="bg-muted/50 flex items-center gap-2 rounded-t-xl border-b px-4 py-3">
              <div class="flex gap-1.5">
                <div class="bg-destructive/60 size-3 rounded-full" />
                <div class="bg-accent/60 size-3 rounded-full" />
                <div class="bg-secondary/60 size-3 rounded-full" />
              </div>
              <div
                class="bg-background text-muted-foreground mx-auto flex h-7 w-64 items-center justify-center rounded-md px-3 text-xs"
              >
                todoist.app/home
              </div>
            </div>
            <!-- Preview Content (Kanban Board mockup) -->
            <div class="grid grid-cols-3 gap-4 p-6">
              <!-- Backlog Column -->
              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <div class="bg-muted-foreground size-2 rounded-full" />
                  <span class="text-sm font-semibold">Backlog</span>
                  <Badge variant="secondary" class="text-xs">3</Badge>
                </div>
                <div v-for="i in 3" :key="i" class="bg-background space-y-2 rounded-lg border p-3">
                  <div class="bg-muted h-3 w-3/4 rounded" />
                  <div class="bg-muted/60 h-2 w-1/2 rounded" />
                </div>
              </div>
              <!-- In Progress Column -->
              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <div class="bg-primary size-2 rounded-full" />
                  <span class="text-sm font-semibold">In Progress</span>
                  <Badge class="text-xs">2</Badge>
                </div>
                <div
                  v-for="i in 2"
                  :key="i"
                  class="border-primary/20 bg-primary/5 space-y-2 rounded-lg border p-3"
                >
                  <div class="bg-primary/20 h-3 w-2/3 rounded" />
                  <div class="bg-primary/10 h-2 w-1/3 rounded" />
                </div>
              </div>
              <!-- Finished Column -->
              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <div class="bg-secondary size-2 rounded-full" />
                  <span class="text-sm font-semibold">Finished</span>
                  <Badge variant="secondary" class="text-xs">4</Badge>
                </div>
                <div
                  v-for="i in 4"
                  :key="i"
                  class="bg-background space-y-2 rounded-lg border p-3 opacity-70"
                >
                  <div class="flex items-center gap-2">
                    <CheckCircle2Icon class="text-secondary size-4" />
                    <div class="bg-muted h-3 w-2/3 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="bg-muted/30 border-t py-24">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-2xl text-center">
          <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to stay organized
          </h2>
          <p class="text-muted-foreground mt-4 text-lg">
            Powerful features wrapped in a beautiful, intuitive interface.
          </p>
        </div>

        <div class="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="group bg-card relative overflow-hidden rounded-2xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div
              class="bg-primary/10 group-hover:bg-primary/20 mb-4 inline-flex size-12 items-center justify-center rounded-xl transition-colors"
            >
              <component :is="feature.icon" class="text-primary size-6" />
            </div>
            <h3 class="mb-2 text-lg font-semibold">{{ feature.title }}</h3>
            <p class="text-muted-foreground text-sm leading-relaxed">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="relative overflow-hidden border-t py-24">
      <div class="pointer-events-none absolute inset-0 -z-10">
        <div
          class="bg-primary/5 absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        />
      </div>
      <div class="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to boost your productivity?
        </h2>
        <p class="text-muted-foreground mx-auto mt-4 max-w-xl text-lg">
          Join thousands of users who organize their life with Todoist. It's free to get started.
        </p>
        <div class="mt-10 flex justify-center gap-4">
          <Button size="lg" as-child class="gap-2 text-base">
            <NuxtLink to="/register">
              Create Free Account
              <ArrowRightIcon class="size-4" />
            </NuxtLink>
          </Button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-muted/20 border-t py-12">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div class="flex items-center gap-2.5">
            <div class="bg-primary flex size-7 items-center justify-center rounded-lg">
              <LayoutDashboardIcon class="text-primary-foreground size-3.5" />
            </div>
            <span class="font-semibold">Todoist</span>
          </div>
          <p class="text-muted-foreground text-sm">
            &copy; {{ new Date().getFullYear() }} Todoist. All rights reserved.
          </p>
          <div class="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener"
              class="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Visit our GitHub repository"
            >
              <GithubIcon class="size-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
