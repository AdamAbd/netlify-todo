<script setup lang="ts">
  import {
    EyeIcon,
    EyeOffIcon,
    Loader2Icon,
    LockIcon,
    CheckCircle2Icon,
    ArrowLeftIcon,
  } from 'lucide-vue-next'

  definePageMeta({
    layout: 'auth',
    middleware: ['guest'],
  })

  useHead({
    title: 'Reset Password - Todoist',
    meta: [{ name: 'description', content: 'Set a new password for your Todoist account.' }],
  })

  const { resetPassword } = useAuth()
  const route = useRoute()
  const router = useRouter()

  const token = computed(() => (route.query.token as string) || '')

  const form = reactive({
    password: '',
    confirmPassword: '',
  })
  const showPassword = ref(false)
  const showConfirmPassword = ref(false)
  const isSubmitting = ref(false)
  const errorMessage = ref('')
  const isSuccess = ref(false)

  const passwordsMatch = computed(() => form.password === form.confirmPassword)

  const passwordStrength = computed(() => {
    const p = form.password
    if (!p) return { score: 0, label: '', color: '' }
    let score = 0
    if (p.length >= 8) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++

    const map: Record<number, { label: string; color: string }> = {
      0: { label: '', color: '' },
      1: { label: 'Weak', color: 'bg-destructive' },
      2: { label: 'Fair', color: 'bg-accent' },
      3: { label: 'Good', color: 'bg-secondary' },
      4: { label: 'Strong', color: 'bg-secondary' },
    }
    return { score, ...map[score] }
  })

  const handleSubmit = async () => {
    errorMessage.value = ''

    if (!token.value) {
      errorMessage.value = 'Invalid or missing reset token.'
      return
    }

    if (!passwordsMatch.value) {
      errorMessage.value = 'Passwords do not match.'
      return
    }

    if (form.password.length < 8) {
      errorMessage.value = 'Password must be at least 8 characters.'
      return
    }

    isSubmitting.value = true

    const result = await resetPassword(token.value, form.password)

    if (result.success) {
      isSuccess.value = true
    } else {
      errorMessage.value = result.error || 'Failed to reset password.'
    }

    isSubmitting.value = false
  }
</script>

<template>
  <div class="space-y-6">
    <!-- Back link -->
    <NuxtLink
      to="/login"
      class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
    >
      <ArrowLeftIcon class="size-4" />
      Back to login
    </NuxtLink>

    <!-- Success state -->
    <template v-if="isSuccess">
      <div class="space-y-6 text-center">
        <div class="bg-secondary/10 mx-auto flex size-16 items-center justify-center rounded-full">
          <CheckCircle2Icon class="text-secondary size-8" />
        </div>
        <div class="space-y-2">
          <h1 class="text-2xl font-bold tracking-tight">Password reset successful</h1>
          <p class="text-muted-foreground text-sm">
            Your password has been updated. You can now sign in with your new password.
          </p>
        </div>
        <Button size="lg" class="w-full" as-child>
          <NuxtLink to="/login">Go to sign in</NuxtLink>
        </Button>
      </div>
    </template>

    <!-- Form state -->
    <template v-else>
      <!-- Header -->
      <div class="space-y-2 text-center">
        <h1 class="text-2xl font-bold tracking-tight">Reset your password</h1>
        <p class="text-muted-foreground text-sm">Enter your new password below.</p>
      </div>

      <!-- No token warning -->
      <div
        v-if="!token"
        class="border-accent/30 bg-accent/10 text-accent-foreground rounded-lg border px-4 py-3 text-sm"
      >
        No reset token found. Please use the link from your email.
      </div>

      <!-- Error message -->
      <div
        v-if="errorMessage"
        class="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm"
      >
        {{ errorMessage }}
      </div>

      <!-- Form -->
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <!-- Password -->
        <div class="space-y-2">
          <Label for="password">New Password</Label>
          <div class="relative">
            <LockIcon
              class="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
            />
            <Input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Create a strong password"
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
          <!-- Password strength indicator -->
          <div v-if="form.password" class="space-y-1.5">
            <div class="flex gap-1">
              <div
                v-for="i in 4"
                :key="i"
                class="h-1 flex-1 rounded-full transition-colors duration-300"
                :class="i <= passwordStrength.score ? passwordStrength.color : 'bg-muted'"
              />
            </div>
            <p class="text-muted-foreground text-xs">
              Password strength: <span class="font-medium">{{ passwordStrength.label }}</span>
            </p>
          </div>
        </div>

        <!-- Confirm Password -->
        <div class="space-y-2">
          <Label for="confirmPassword">Confirm Password</Label>
          <div class="relative">
            <LockIcon
              class="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
            />
            <Input
              id="confirmPassword"
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Confirm your new password"
              required
              class="pr-10 pl-10"
              :class="form.confirmPassword && !passwordsMatch ? 'border-destructive' : ''"
            />
            <button
              type="button"
              class="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <EyeOffIcon v-if="showConfirmPassword" class="size-4" />
              <EyeIcon v-else class="size-4" />
            </button>
          </div>
          <p v-if="form.confirmPassword && !passwordsMatch" class="text-destructive text-xs">
            Passwords do not match
          </p>
        </div>

        <Button
          type="submit"
          size="lg"
          class="w-full"
          :disabled="isSubmitting || !passwordsMatch || !token"
        >
          <Loader2Icon v-if="isSubmitting" class="mr-2 size-4 animate-spin" />
          {{ isSubmitting ? 'Resetting...' : 'Reset password' }}
        </Button>
      </form>
    </template>
  </div>
</template>
