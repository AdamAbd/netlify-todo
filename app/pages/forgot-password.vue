<script setup lang="ts">
  import { ArrowLeftIcon, Loader2Icon, MailIcon, CheckCircle2Icon } from 'lucide-vue-next'
  import { toTypedSchema } from '@vee-validate/zod'
  import { useForm, Field as VeeField } from 'vee-validate'
  import { forgotPasswordSchema } from '#shared/types/user'
  import { authClient } from '@/lib/auth-client'
  import { toast } from 'vue-sonner'

  definePageMeta({
    layout: 'auth',
    middleware: ['guest'],
  })

  useHead({
    title: 'Forgot Password - Todoist',
    meta: [{ name: 'description', content: 'Reset your Todoist password via email.' }],
  })

  const { handleSubmit, values } = useForm({
    validationSchema: toTypedSchema(forgotPasswordSchema),
    initialValues: {
      email: '',
    },
  })

  const isSubmitting = ref(false)
  const errorMessage = ref('')
  const isSuccess = ref(false)

  const onSubmit = handleSubmit(async (values) => {
    try {
      await authClient.requestPasswordReset(
        {
          email: values.email,
          redirectTo: '/reset-password',
        },
        {
          onRequest: () => {
            errorMessage.value = ''
            isSubmitting.value = true
          },
          onSuccess: () => {
            isSubmitting.value = false
            isSuccess.value = true
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
          <h1 class="text-2xl font-bold tracking-tight">Check your email</h1>
          <p class="text-muted-foreground text-sm">
            We've sent a password reset link to
            <span class="text-foreground font-medium">{{ values.email }}</span
            >. Please check your inbox and follow the instructions.
          </p>
        </div>
        <div class="space-y-3">
          <Button size="lg" class="w-full" @click="isSuccess = false"> Send another link </Button>
          <Button variant="outline" size="lg" class="w-full" as-child>
            <NuxtLink to="/login">Back to sign in</NuxtLink>
          </Button>
        </div>
      </div>
    </template>

    <!-- Form state -->
    <template v-else>
      <!-- Header -->
      <div class="space-y-2 text-center">
        <h1 class="text-2xl font-bold tracking-tight">Forgot your password?</h1>
        <p class="text-muted-foreground text-sm">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <!-- Error message -->
      <div
        v-if="errorMessage"
        class="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm"
      >
        {{ errorMessage }}
      </div>

      <!-- Form -->
      <form id="form-forgot-password" class="space-y-4" @submit="onSubmit">
        <!-- Email -->
        <VeeField v-slot="{ field, errors }" name="email">
          <Field :data-invalid="!!errors.length">
            <FieldLabel for="form-forgot-password-email">Email</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="form-forgot-password-email"
                :model-value="field.value"
                type="email"
                placeholder="name@example.com"
                :disabled="isSubmitting"
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

        <Button type="submit" size="lg" class="w-full" :disabled="isSubmitting">
          <Loader2Icon v-if="isSubmitting" class="mr-2 size-4 animate-spin" />
          {{ isSubmitting ? 'Sending...' : 'Send reset link' }}
        </Button>
      </form>

      <!-- Login link -->
      <p class="text-muted-foreground text-center text-sm">
        Remember your password?
        <NuxtLink
          to="/login"
          class="text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Sign in
        </NuxtLink>
      </p>
    </template>
  </div>
</template>
