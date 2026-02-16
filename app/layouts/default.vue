<script setup lang="ts">
  import { LayoutDashboardIcon, LogOutIcon, MoonIcon, SunIcon, UserIcon } from 'lucide-vue-next'

  const { user, logout } = useAuth()
  const isDark = useDark()
  const toggleTheme = useToggle(isDark)
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }
</script>

<template>
  <div class="bg-background relative min-h-screen">
    <!-- Subtle gradient background pattern -->
    <div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        class="animate-pulse-slow bg-primary/5 absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full blur-3xl"
      />
      <div
        class="animate-pulse-slow bg-secondary/5 absolute -right-40 -bottom-40 h-[500px] w-[500px] rounded-full blur-3xl"
        style="animation-delay: 2s"
      />
    </div>

    <!-- Header / Navbar -->
    <header class="bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-xl">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <!-- Logo -->
        <NuxtLink to="/home" class="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <div class="bg-primary flex size-8 items-center justify-center rounded-lg">
            <LayoutDashboardIcon class="text-primary-foreground size-4" />
          </div>
          <span class="text-lg font-bold tracking-tight">Todoist</span>
        </NuxtLink>

        <!-- Right side actions -->
        <div class="flex items-center gap-2">
          <!-- Theme toggle -->
          <Button variant="ghost" size="icon" @click="toggleTheme" aria-label="Toggle theme">
            <SunIcon v-if="isDark" class="size-4" />
            <MoonIcon v-else class="size-4" />
          </Button>

          <!-- User menu -->
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" class="relative flex items-center gap-2 pr-3 pl-2">
                <Avatar class="size-7">
                  <AvatarImage v-if="user?.image" :src="user.image" :alt="user?.name" />
                  <AvatarFallback class="bg-primary/10 text-primary text-xs font-semibold">
                    {{ user?.name?.charAt(0)?.toUpperCase() || 'U' }}
                  </AvatarFallback>
                </Avatar>
                <span class="hidden text-sm font-medium sm:inline-block">{{
                  user?.name || 'User'
                }}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-56">
              <DropdownMenuLabel class="font-normal">
                <div class="flex flex-col space-y-1">
                  <p class="text-sm leading-none font-medium">{{ user?.name }}</p>
                  <p class="text-muted-foreground text-xs leading-none">{{ user?.email }}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <UserIcon class="mr-2 size-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                class="text-destructive focus:text-destructive"
                @click="handleLogout"
              >
                <LogOutIcon class="mr-2 size-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <slot />
    </main>
  </div>
</template>

<style scoped>
  @keyframes pulse-slow {
    0%,
    100% {
      opacity: 0.4;
    }
    50% {
      opacity: 0.8;
    }
  }

  .animate-pulse-slow {
    animation: pulse-slow 6s ease-in-out infinite;
  }
</style>
