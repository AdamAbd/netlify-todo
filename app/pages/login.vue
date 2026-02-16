<script setup lang="ts">
  import { EyeIcon, EyeOffIcon, Loader2Icon, MailIcon, LockIcon } from 'lucide-vue-next'

  definePageMeta({
    layout: 'auth',
    middleware: ['guest'],
  })

  useHead({
    title: 'Sign In - Todoist',
    meta: [
      { name: 'description', content: 'Sign in to your Todoist account to manage your tasks.' },
    ],
  })

  const form = reactive({
    email: '',
    password: '',
  })
  const showPassword = ref(false)
  const isSubmitting = ref(false)
  const errorMessage = ref('')

  const handleSubmit = async () => {
    errorMessage.value = ''
    isSubmitting.value = true

    // TODO: Implement login with better-auth
    isSubmitting.value = false
  }

  const handleGoogleLogin = () => {
    // TODO: Implement google login with better-auth
  }
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="space-y-2 text-center">
      <h1 class="text-2xl font-bold tracking-tight">Welcome back</h1>
      <p class="text-muted-foreground text-sm">Enter your credentials to access your account</p>
    </div>

    <!-- Google OAuth Button -->
    <Button variant="outline" size="lg" class="w-full" @click="handleGoogleLogin">
      <SharedGoogleLogo />
      Continue with Google
    </Button>

    <!-- Divider -->
    <div class="relative">
      <div class="absolute inset-0 flex items-center">
        <Separator />
      </div>
      <div class="relative flex justify-center text-xs uppercase">
        <span class="bg-background text-muted-foreground px-2">Or continue with email</span>
      </div>
    </div>

    <!-- Error message -->
    <div
      v-if="errorMessage"
      class="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm"
    >
      {{ errorMessage }}
    </div>

    <!-- Login Form -->
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <!-- Email -->
      <div class="space-y-2">
        <Label for="email">Email</Label>
        <div class="relative">
          <MailIcon class="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="name@example.com"
            required
            class="pl-10"
          />
        </div>
      </div>

      <!-- Password -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <Label for="password">Password</Label>
          <NuxtLink
            to="/forgot-password"
            class="text-primary hover:text-primary/80 text-xs font-medium transition-colors"
          >
            Forgot password?
          </NuxtLink>
        </div>
        <div class="relative">
          <LockIcon class="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Enter your password"
            required
            class="pr-10 pl-10"
          />
          <button
            type="button"
            class="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
            @click="showPassword = !showPassword"
          >
            <EyeOffIcon v-if="showPassword" class="size-4" />
            <EyeIcon v-else class="size-4" />
          </button>
        </div>
      </div>

      <!-- Submit -->
      <Button type="submit" size="lg" class="w-full" :disabled="isSubmitting">
        <Loader2Icon v-if="isSubmitting" class="mr-2 size-4 animate-spin" />
        {{ isSubmitting ? 'Signing in...' : 'Sign in' }}
      </Button>
    </form>

    <!-- Register link -->
    <p class="text-muted-foreground text-center text-sm">
      Don't have an account?
      <NuxtLink
        to="/register"
        class="text-primary hover:text-primary/80 font-medium transition-colors"
      >
        Create account
      </NuxtLink>
    </p>
  </div>
</template>
