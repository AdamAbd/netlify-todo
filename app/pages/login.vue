<script setup lang="ts">
  import { EyeIcon, EyeOffIcon, Loader2Icon, MailIcon, LockIcon } from 'lucide-vue-next'
  import { useForm, Field as VeeField } from 'vee-validate'
  import { loginSchema } from '#shared/types/user'
  import { authClient } from '@/lib/auth-client'
  import { toast } from 'vue-sonner'

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

  const { handleSubmit } = useForm({
    validationSchema: loginSchema,
    initialValues: {
      email: '',
      password: '',
    },
  })

  const showPassword = ref(false)
  const isSubmitting = ref(false)
  const isGoogleSubmitting = ref(false)
  const errorMessage = ref('')

  const onSubmit = handleSubmit(async (values) => {
    try {
      await authClient.signIn.email(
        {
          email: values.email,
          password: values.password,
          callbackURL: '/home',
        },
        {
          onRequest: () => {
            errorMessage.value = ''
            isSubmitting.value = true
          },
          onSuccess: () => {
            isSubmitting.value = false
            toast.success('Signed in successfully')
          },
          onError: (ctx) => {
            isSubmitting.value = false
            errorMessage.value = ctx.error.message
            toast.error(ctx.error.message)
          },
        }
      )
    } catch (e: unknown) {
      isSubmitting.value = false
      const message =
        (e instanceof Error && e.message) || String(e) || 'An unexpected error occurred'
      errorMessage.value = message
      toast.error(message)
    }
  })

  const handleGoogleLogin = async () => {
    try {
      await authClient.signIn.social(
        {
          provider: 'google',
          callbackURL: '/home',
        },
        {
          onRequest: (_ctx) => {
            errorMessage.value = ''
            isGoogleSubmitting.value = true
          },
          onSuccess: (_ctx) => {
            isGoogleSubmitting.value = false
          },
          onError: (ctx) => {
            isGoogleSubmitting.value = false

            // display the error message
            errorMessage.value = ctx.error.message
            toast.error(ctx.error.message)
          },
        }
      )
    } catch (e: unknown) {
      isSubmitting.value = false
      const message =
        (e instanceof Error && e.message) || String(e) || 'An unexpected error occurred'
      errorMessage.value = message
      toast.error(message)
    }
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
    <Button
      variant="outline"
      size="lg"
      class="w-full"
      :disabled="isSubmitting || isGoogleSubmitting"
      @click="handleGoogleLogin"
    >
      <Loader2Icon v-if="isGoogleSubmitting" class="mr-2 size-4 animate-spin" />
      <SharedGoogleLogo v-else />
      {{ isGoogleSubmitting ? 'Connecting...' : 'Continue with Google' }}
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
    <form id="form-login" class="space-y-4" @submit="onSubmit">
      <!-- Email -->
      <VeeField v-slot="{ field, errors }" name="email">
        <Field :data-invalid="!!errors.length">
          <FieldLabel for="form-login-email">Email</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="form-login-email"
              :model-value="field.value"
              type="email"
              placeholder="name@example.com"
              :disabled="isSubmitting || isGoogleSubmitting"
              autocomplete="email"
              @update:model-value="field.onChange"
            />
            <InputGroupAddon>
              <MailIcon />
            </InputGroupAddon>
          </InputGroup>
          <FieldError v-if="errors.length" :errors="errors" />
        </Field>
      </VeeField>

      <!-- Password -->
      <VeeField v-slot="{ field, errors }" name="password">
        <Field :data-invalid="!!errors.length">
          <div class="flex items-center justify-between">
            <FieldLabel for="form-login-password">Password</FieldLabel>
            <NuxtLink
              to="/forgot-password"
              class="text-primary hover:text-primary/80 text-xs font-medium transition-colors"
            >
              Forgot password?
            </NuxtLink>
          </div>
          <InputGroup>
            <InputGroupInput
              id="form-login-password"
              :model-value="field.value"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
              :disabled="isSubmitting || isGoogleSubmitting"
              autocomplete="current-password"
              @update:model-value="field.onChange"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton type="button" size="icon-xs" @click="showPassword = !showPassword">
                <EyeOffIcon v-if="showPassword" class="size-4" />
                <EyeIcon v-else class="size-4" />
              </InputGroupButton>
            </InputGroupAddon>
            <InputGroupAddon align="inline-start">
              <LockIcon />
            </InputGroupAddon>
          </InputGroup>
          <FieldError v-if="errors.length" :errors="errors" />
        </Field>
      </VeeField>

      <!-- Submit -->
      <Button type="submit" size="lg" class="w-full" :disabled="isSubmitting || isGoogleSubmitting">
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
