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

  const { login, loginWithGoogle } = useAuth()
  const router = useRouter()

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

    const result = await login(form.email, form.password)

    if (result.success) {
      router.push('/home')
    } else {
      errorMessage.value = result.error || 'Login failed.'
    }

    isSubmitting.value = false
  }

  const handleGoogleLogin = () => {
    loginWithGoogle()
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
    <Button variant="outline" class="h-11 w-full gap-3" @click="handleGoogleLogin">
      <svg class="size-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
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
      <Button type="submit" class="h-11 w-full" :disabled="isSubmitting">
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
