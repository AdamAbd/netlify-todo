<script setup lang="ts">
  import { EyeIcon, EyeOffIcon, Loader2Icon, MailIcon, LockIcon, UserIcon } from 'lucide-vue-next'

  definePageMeta({
    layout: 'auth',
    middleware: ['guest'],
  })

  useHead({
    title: 'Create Account - Todoist',
    meta: [
      {
        name: 'description',
        content: 'Create your free Todoist account and start organizing your tasks.',
      },
    ],
  })

  const { register, loginWithGoogle } = useAuth()
  const router = useRouter()

  const form = reactive({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const showPassword = ref(false)
  const showConfirmPassword = ref(false)
  const isSubmitting = ref(false)
  const errorMessage = ref('')

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

    if (!passwordsMatch.value) {
      errorMessage.value = 'Passwords do not match.'
      return
    }

    if (form.password.length < 8) {
      errorMessage.value = 'Password must be at least 8 characters.'
      return
    }

    isSubmitting.value = true

    const result = await register(form.name, form.email, form.password)

    if (result.success) {
      router.push('/home')
    } else {
      errorMessage.value = result.error || 'Registration failed.'
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
      <h1 class="text-2xl font-bold tracking-tight">Create your account</h1>
      <p class="text-muted-foreground text-sm">Start organizing your tasks in seconds</p>
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

    <!-- Register Form -->
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <!-- Name -->
      <div class="space-y-2">
        <Label for="name">Full Name</Label>
        <div class="relative">
          <UserIcon class="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            id="name"
            v-model="form.name"
            type="text"
            placeholder="John Doe"
            required
            class="pl-10"
          />
        </div>
      </div>

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
        <Label for="password">Password</Label>
        <div class="relative">
          <LockIcon class="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
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
          <LockIcon class="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            id="confirmPassword"
            v-model="form.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="Confirm your password"
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

      <!-- Submit -->
      <Button type="submit" size="lg" class="w-full" :disabled="isSubmitting || !passwordsMatch">
        <Loader2Icon v-if="isSubmitting" class="mr-2 size-4 animate-spin" />
        {{ isSubmitting ? 'Creating account...' : 'Create account' }}
      </Button>
    </form>

    <!-- Terms -->
    <p class="text-muted-foreground text-center text-xs">
      By creating an account, you agree to our
      <a href="#" class="hover:text-foreground underline">Terms of Service</a>
      and
      <a href="#" class="hover:text-foreground underline">Privacy Policy</a>
    </p>

    <!-- Login link -->
    <p class="text-muted-foreground text-center text-sm">
      Already have an account?
      <NuxtLink
        to="/login"
        class="text-primary hover:text-primary/80 font-medium transition-colors"
      >
        Sign in
      </NuxtLink>
    </p>
  </div>
</template>
