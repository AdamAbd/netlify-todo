<script setup lang="ts">
  import { EyeIcon, EyeOffIcon, Loader2Icon, MailIcon, UserIcon } from 'lucide-vue-next'
  import { useForm, Field as VeeField } from 'vee-validate'
  import { registerSchema } from '#shared/types/user'
  import { authClient } from '@/lib/auth-client'
  import { toast } from 'vue-sonner'

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

  const { handleSubmit, values } = useForm({
    validationSchema: registerSchema,
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const showPassword = ref(false)
  const showConfirmPassword = ref(false)
  const isSubmitting = ref(false)
  const isGoogleSubmitting = ref(false)
  const errorMessage = ref('')

  const passwordStrength = usePasswordStrength(() => values.password || '')

  const onSubmit = handleSubmit(async (values) => {
    try {
      await authClient.signUp.email(
        {
          email: values.email, // user email address
          password: values.password, // user password -> min 8 characters by default
          name: values.name, // user display name
          callbackURL: '/home', // A URL to redirect to after the user verifies their email (optional)
        },
        {
          onRequest: (_ctx) => {
            errorMessage.value = ''
            isSubmitting.value = true
          },
          onSuccess: (_ctx) => {
            isSubmitting.value = false

            toast.success('Account created! Please check your email to verify your account.')
          },
          onError: (ctx) => {
            isSubmitting.value = false

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
      <h1 class="text-2xl font-bold tracking-tight">Create your account</h1>
      <p class="text-muted-foreground text-sm">Start organizing your tasks in seconds</p>
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

    <!-- Register Form -->
    <form id="form-register" class="space-y-4" @submit="onSubmit">
      <!-- Name -->
      <VeeField v-slot="{ field, errors }" name="name">
        <Field :data-invalid="!!errors.length">
          <FieldLabel for="form-register-name">Full Name</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="form-register-name"
              :model-value="field.value"
              type="text"
              placeholder="John Doe"
              :disabled="isSubmitting || isGoogleSubmitting"
              autocomplete="name"
              @update:model-value="field.onChange"
            />
            <InputGroupAddon>
              <UserIcon />
            </InputGroupAddon>
          </InputGroup>
          <FieldError v-if="errors.length" :errors="errors" />
        </Field>
      </VeeField>

      <!-- Email -->
      <VeeField v-slot="{ field, errors }" name="email">
        <Field :data-invalid="!!errors.length">
          <FieldLabel for="form-register-email">Email</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="form-register-email"
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
          <FieldLabel for="form-register-password">Password</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="form-register-password"
              :model-value="field.value"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Create a strong password"
              :disabled="isSubmitting || isGoogleSubmitting"
              autocomplete="new-password"
              @update:model-value="field.onChange"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton type="button" size="icon-xs" @click="showPassword = !showPassword">
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
          <FieldLabel for="form-register-confirm-password">Confirm Password</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="form-register-confirm-password"
              :model-value="field.value"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Confirm your password"
              :disabled="isSubmitting || isGoogleSubmitting"
              autocomplete="new-password"
              @update:model-value="field.onChange"
            />
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

      <!-- Submit -->
      <Button type="submit" size="lg" class="w-full" :disabled="isSubmitting || isGoogleSubmitting">
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
