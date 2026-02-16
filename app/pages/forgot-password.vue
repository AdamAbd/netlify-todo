<script setup lang="ts">
  import { ArrowLeftIcon, Loader2Icon, MailIcon, CheckCircle2Icon } from 'lucide-vue-next'

  definePageMeta({
    layout: 'auth',
    middleware: ['guest'],
  })

  useHead({
    title: 'Forgot Password - Todoist',
    meta: [{ name: 'description', content: 'Reset your Todoist password via email.' }],
  })

  const { forgotPassword } = useAuth()

  const email = ref('')
  const isSubmitting = ref(false)
  const errorMessage = ref('')
  const isSuccess = ref(false)

  const handleSubmit = async () => {
    errorMessage.value = ''
    isSubmitting.value = true

    const result = await forgotPassword(email.value)

    if (result.success) {
      isSuccess.value = true
    } else {
      errorMessage.value = result.error || 'Failed to send reset email.'
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
          <h1 class="text-2xl font-bold tracking-tight">Check your email</h1>
          <p class="text-muted-foreground text-sm">
            We've sent a password reset link to
            <span class="text-foreground font-medium">{{ email }}</span
            >. Please check your inbox and follow the instructions.
          </p>
        </div>
        <div class="space-y-3">
          <Button class="h-11 w-full" @click="isSuccess = false"> Send another link </Button>
          <Button variant="outline" class="h-11 w-full" as-child>
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
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div class="space-y-2">
          <Label for="email">Email</Label>
          <div class="relative">
            <MailIcon
              class="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
            />
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="name@example.com"
              required
              class="pl-10"
            />
          </div>
        </div>

        <Button type="submit" class="h-11 w-full" :disabled="isSubmitting">
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
