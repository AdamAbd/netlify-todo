<script setup lang="ts">
  import {
    EyeIcon,
    EyeOffIcon,
    Loader2Icon,
    LockIcon,
    CheckCircle2Icon,
    ArrowLeftIcon,
  } from 'lucide-vue-next'
  import { toTypedSchema } from '@vee-validate/zod'
  import { useForm, Field as VeeField } from 'vee-validate'
  import * as z from 'zod'
  import { authClient } from '@/lib/auth-client'
  import { toast } from 'vue-sonner'

  definePageMeta({
    layout: 'auth',
    middleware: ['guest'],
  })

  useHead({
    title: 'Reset Password - Todoist',
    meta: [{ name: 'description', content: 'Set a new password for your Todoist account.' }],
  })

  const route = useRoute()
  const token = computed(() => (route.query.token as string) || '')

  const resetPasswordSchema = toTypedSchema(
    z
      .object({
        password: z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string(),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      })
  )

  const { handleSubmit, values } = useForm({
    validationSchema: resetPasswordSchema,
    initialValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const showPassword = ref(false)
  const showConfirmPassword = ref(false)
  const isSubmitting = ref(false)
  const errorMessage = ref('')
  const isSuccess = ref(false)

  const passwordStrength = usePasswordStrength(() => values.password || '')

  const onSubmit = handleSubmit(async (values) => {
    if (!token.value) {
      errorMessage.value = 'Invalid or missing reset token.'
      return
    }

    try {
      await authClient.resetPassword(
        {
          newPassword: values.password,
          token: token.value,
        },
        {
          onRequest: () => {
            errorMessage.value = ''
            isSubmitting.value = true
          },
          onSuccess: () => {
            isSubmitting.value = false
            isSuccess.value = true
            toast.success('Password reset successful!')
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
      <form id="form-reset-password" class="space-y-4" @submit="onSubmit">
        <!-- Password -->
        <VeeField v-slot="{ field, errors }" name="password">
          <Field :data-invalid="!!errors.length">
            <FieldLabel for="form-reset-password-password">New Password</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="form-reset-password-password"
                :model-value="field.value"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Create a strong password"
                :disabled="isSubmitting || !token"
                autocomplete="new-password"
                @update:model-value="field.onChange"
              />
              <InputGroupAddon align="inline-start">
                <LockIcon class="size-4" />
              </InputGroupAddon>
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="button"
                  size="icon-xs"
                  @click="showPassword = !showPassword"
                >
                  <EyeOffIcon v-if="showPassword" class="size-4" />
                  <EyeIcon v-else class="size-4" />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <!-- Password strength indicator -->
            <div v-if="values.password" class="space-y-1.5 pt-2">
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
            <FieldError v-if="errors.length" :errors="errors" />
          </Field>
        </VeeField>

        <!-- Confirm Password -->
        <VeeField v-slot="{ field, errors }" name="confirmPassword">
          <Field :data-invalid="!!errors.length">
            <FieldLabel for="form-reset-password-confirm-password">Confirm Password</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="form-reset-password-confirm-password"
                :model-value="field.value"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Confirm your new password"
                :disabled="isSubmitting || !token"
                autocomplete="new-password"
                @update:model-value="field.onChange"
              />
              <InputGroupAddon align="inline-start">
                <LockIcon class="size-4" />
              </InputGroupAddon>
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="button"
                  size="icon-xs"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <EyeOffIcon v-if="showConfirmPassword" class="size-4" />
                  <EyeIcon v-else class="size-4" />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <FieldError v-if="errors.length" :errors="errors" />
          </Field>
        </VeeField>

        <Button type="submit" size="lg" class="w-full" :disabled="isSubmitting || !token">
          <Loader2Icon v-if="isSubmitting" class="mr-2 size-4 animate-spin" />
          {{ isSubmitting ? 'Resetting...' : 'Reset password' }}
        </Button>
      </form>
    </template>
  </div>
</template>
