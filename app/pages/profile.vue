<script setup lang="ts">
  import {
    CheckCircle2Icon,
    CircleIcon,
    ImageIcon,
    LinkIcon,
    Loader2Icon,
    MailIcon,
    UserIcon,
  } from 'lucide-vue-next'
  import { toTypedSchema } from '@vee-validate/zod'
  import { Field as VeeField, useForm } from 'vee-validate'
  import { toast } from 'vue-sonner'
  import { type ConnectedAccount, updateProfileSchema } from '#shared/types/profile'
  import { authClient } from '@/lib/auth-client'

  definePageMeta({
    middleware: ['auth'],
  })

  useHead({
    title: 'Profile - Todoist',
    meta: [
      {
        name: 'description',
        content: 'Manage your profile details and connected accounts.',
      },
    ],
  })

  const session = authClient.useSession()
  const profile = computed(() => session.value?.data?.user ?? null)
  const isProfilePending = computed(() => session.value?.isPending ?? false)
  const sessionError = computed(() => session.value?.error ?? null)

  const connectedAccounts = ref<ConnectedAccount[]>([])
  const isAccountsPending = ref(true)
  const accountsError = ref<unknown>(null)
  const loadError = computed(() => sessionError.value ?? accountsError.value ?? null)

  const loadConnectedAccounts = async () => {
    try {
      isAccountsPending.value = true
      accountsError.value = null

      const { data, error } = await authClient.listAccounts()

      if (error) {
        accountsError.value = error
        connectedAccounts.value = []
        return
      }

      connectedAccounts.value = data ?? []
    } catch (requestError: unknown) {
      accountsError.value = requestError
      connectedAccounts.value = []
    } finally {
      isAccountsPending.value = false
    }
  }

  const { handleSubmit, resetForm } = useForm({
    validationSchema: toTypedSchema(updateProfileSchema),
    initialValues: {
      name: '',
      image: '',
    },
  })

  watch(
    () => profile.value,
    (value) => {
      if (!value) return

      resetForm({
        values: {
          name: value.name,
          image: value.image ?? '',
        },
      })
    },
    { immediate: true }
  )

  const resolveErrorMessage = (value: unknown, fallback: string) => {
    if (!value || typeof value !== 'object') return fallback

    const errorData = value as {
      data?: { statusMessage?: string; message?: string }
      message?: string
    }
    return errorData.data?.statusMessage || errorData.data?.message || errorData.message || fallback
  }

  const formatDate = (value: string | Date | null | undefined) => {
    if (!value) return 'Unknown'
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return 'Unknown'
    }

    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
    }).format(date)
  }

  const findConnectedAccount = (providerIds: string[]) => {
    return connectedAccounts.value.find((account) =>
      providerIds.includes(account.providerId.toLowerCase())
    )
  }

  const accountProviders = computed(() => {
    const credentialAccount = findConnectedAccount([
      'credential',
      'email',
      'email-password',
      'password',
    ])
    const googleAccount = findConnectedAccount(['google'])

    return [
      {
        id: 'credential',
        label: 'Email & Password',
        description: 'Primary credential used for signing in with email.',
        connected: Boolean(credentialAccount),
        connectedAt: credentialAccount?.createdAt,
        accountId: credentialAccount?.accountId,
        icon: MailIcon,
      },
      {
        id: 'google',
        providerId: 'google',
        label: 'Google',
        description: 'OAuth account for one-click login with Google.',
        connected: Boolean(googleAccount),
        connectedAt: googleAccount?.createdAt,
        accountId: googleAccount?.accountId,
        icon: LinkIcon,
      },
    ]
  })

  const isSaving = ref(false)
  const isLinkingGoogle = ref(false)
  const isUnlinkingGoogle = ref(false)

  const refreshPageData = async () => {
    const jobs: Promise<unknown>[] = [loadConnectedAccounts()]

    if (session.value?.refetch) {
      jobs.push(session.value.refetch())
    }

    await Promise.all(jobs)
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      isSaving.value = true

      const { error: updateError } = await authClient.updateUser({
        name: values.name.trim(),
        image: values.image?.trim() ? values.image.trim() : null,
      })

      if (updateError) {
        toast.error(updateError.message || 'Failed to update profile')
        return
      }

      await refreshPageData()
      toast.success('Profile updated successfully')
    } catch (requestError: unknown) {
      toast.error(resolveErrorMessage(requestError, 'Failed to update profile'))
    } finally {
      isSaving.value = false
    }
  })

  const handleLinkGoogle = async () => {
    try {
      isLinkingGoogle.value = true
      const { error } = await authClient.linkSocial({
        provider: 'google',
        callbackURL: '/profile',
      })

      if (error) {
        toast.error(error.message || 'Failed to link Google account')
      }
    } catch (requestError: unknown) {
      toast.error(resolveErrorMessage(requestError, 'Failed to link Google account'))
    } finally {
      isLinkingGoogle.value = false
    }
  }

  const handleUnlinkGoogle = async (accountId?: string) => {
    try {
      isUnlinkingGoogle.value = true
      const payload = accountId
        ? { providerId: 'google', accountId }
        : { providerId: 'google' }

      const { error } = await authClient.unlinkAccount(payload)
      if (error) {
        toast.error(error.message || 'Failed to unlink Google account')
        return
      }

      await loadConnectedAccounts()
      toast.success('Google account unlinked')
    } catch (requestError: unknown) {
      toast.error(resolveErrorMessage(requestError, 'Failed to unlink Google account'))
    } finally {
      isUnlinkingGoogle.value = false
    }
  }

  onMounted(async () => {
    await loadConnectedAccounts()
  })
</script>

<template>
  <div class="space-y-8">
    <section class="bg-card relative overflow-hidden rounded-2xl border p-6 sm:p-8">
      <div class="pointer-events-none absolute inset-0 -z-10">
        <div class="bg-primary/10 absolute top-0 -left-16 h-48 w-48 rounded-full blur-3xl" />
        <div class="bg-secondary/10 absolute right-0 -bottom-16 h-48 w-48 rounded-full blur-3xl" />
      </div>

      <div class="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-3">
          <div
            class="bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide"
          >
            <UserIcon class="size-3.5" />
            Account Settings
          </div>
          <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Profile</h1>
          <p class="text-muted-foreground max-w-2xl text-sm sm:text-base">
            Update your public profile details and review how you sign in.
          </p>
        </div>

        <div
          v-if="profile"
          class="bg-background/80 ring-border/60 flex items-center gap-3 rounded-xl border px-4 py-3 ring-1"
        >
          <Avatar class="size-10">
            <AvatarImage v-if="profile.image" :src="profile.image" :alt="profile.name" />
            <AvatarFallback class="bg-primary/15 text-primary text-sm font-semibold">
              {{ profile.name.charAt(0).toUpperCase() }}
            </AvatarFallback>
          </Avatar>
          <div class="space-y-0.5">
            <p class="text-sm leading-none font-semibold">{{ profile.name }}</p>
            <p class="text-muted-foreground text-xs leading-none">{{ profile.email }}</p>
          </div>
        </div>
      </div>
    </section>

    <div
      v-if="isProfilePending && !profile"
      class="flex items-center justify-center rounded-2xl border py-20"
    >
      <div class="text-muted-foreground flex items-center gap-2 text-sm">
        <Loader2Icon class="size-4 animate-spin" />
        Loading profile...
      </div>
    </div>

    <div
      v-else-if="loadError && !profile"
      class="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm"
    >
      {{ resolveErrorMessage(loadError, 'Failed to load profile information') }}
    </div>

    <div v-else-if="profile" class="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div
        v-if="accountsError"
        class="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm xl:col-span-2"
      >
        {{ resolveErrorMessage(accountsError, 'Failed to load connected accounts') }}
      </div>

      <section class="bg-card rounded-2xl border p-6 sm:p-8">
        <div class="mb-6 space-y-1">
          <h2 class="text-xl font-bold tracking-tight">Update Profile</h2>
          <p class="text-muted-foreground text-sm">Keep your account details up to date.</p>
        </div>

        <form class="space-y-5" @submit="onSubmit">
          <VeeField v-slot="{ field, errors }" name="name">
            <Field :data-invalid="!!errors.length">
              <FieldLabel for="profile-name">Full Name</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="profile-name"
                  :model-value="field.value"
                  type="text"
                  placeholder="Your full name"
                  autocomplete="name"
                  :disabled="isSaving"
                  @update:model-value="field.onChange"
                />
                <InputGroupAddon>
                  <UserIcon />
                </InputGroupAddon>
              </InputGroup>
              <FieldError v-if="errors.length" :errors="errors" />
            </Field>
          </VeeField>

          <Field>
            <FieldLabel for="profile-email">Email Address</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="profile-email"
                :model-value="profile.email"
                type="email"
                disabled
                readonly
              />
              <InputGroupAddon>
                <MailIcon />
              </InputGroupAddon>
            </InputGroup>
            <div class="text-muted-foreground mt-2 flex items-center gap-2 text-xs">
              <CheckCircle2Icon v-if="profile.emailVerified" class="text-secondary size-3.5" />
              <CircleIcon v-else class="size-3.5" />
              <span>
                {{ profile.emailVerified ? 'Email verified' : 'Email not verified yet' }}
              </span>
            </div>
          </Field>

          <VeeField v-slot="{ field, errors }" name="image">
            <Field :data-invalid="!!errors.length">
              <FieldLabel for="profile-image">Avatar URL</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="profile-image"
                  :model-value="field.value"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  :disabled="isSaving"
                  @update:model-value="field.onChange"
                />
                <InputGroupAddon>
                  <ImageIcon />
                </InputGroupAddon>
              </InputGroup>
              <FieldError v-if="errors.length" :errors="errors" />
            </Field>
          </VeeField>

          <div class="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" :disabled="isSaving" @click="refreshPageData()">
              Refresh
            </Button>
            <Button type="submit" :disabled="isSaving">
              <Loader2Icon v-if="isSaving" class="mr-2 size-4 animate-spin" />
              {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </Button>
          </div>
        </form>
      </section>

      <section class="bg-card rounded-2xl border p-6 sm:p-8">
        <div class="mb-6 space-y-1">
          <h2 class="text-xl font-bold tracking-tight">Connected Accounts</h2>
          <p class="text-muted-foreground text-sm">
            Review providers currently linked to your account.
          </p>
        </div>

        <div
          v-if="isAccountsPending"
          class="text-muted-foreground mb-3 flex items-center gap-2 text-xs"
        >
          <Loader2Icon class="size-3.5 animate-spin" />
          Refreshing connected accounts...
        </div>

        <div class="space-y-3">
          <div
            v-for="provider in accountProviders"
            :key="provider.id"
            class="bg-muted/30 ring-border/50 rounded-xl border p-4 ring-1"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-start gap-3">
                <div class="bg-background text-muted-foreground rounded-lg border p-2">
                  <component :is="provider.icon" class="size-4" />
                </div>
                <div class="space-y-1">
                  <p class="text-sm font-semibold">{{ provider.label }}</p>
                  <p class="text-muted-foreground text-xs">{{ provider.description }}</p>
                  <p class="text-muted-foreground text-xs">
                    {{
                      provider.connected
                        ? `Connected since ${formatDate(provider.connectedAt)}`
                        : 'Not connected yet'
                    }}
                  </p>
                </div>
              </div>
              <div class="flex shrink-0 flex-col items-end gap-2">
                <Badge :variant="provider.connected ? 'default' : 'secondary'">
                  {{ provider.connected ? 'Connected' : 'Not Connected' }}
                </Badge>

                <Button
                  v-if="provider.id === 'google' && !provider.connected"
                  size="sm"
                  variant="outline"
                  :disabled="isLinkingGoogle || isUnlinkingGoogle"
                  @click="handleLinkGoogle"
                >
                  <Loader2Icon v-if="isLinkingGoogle" class="mr-2 size-3.5 animate-spin" />
                  Link Google
                </Button>

                <Button
                  v-if="provider.id === 'google' && provider.connected"
                  size="sm"
                  variant="outline"
                  :disabled="isLinkingGoogle || isUnlinkingGoogle"
                  @click="handleUnlinkGoogle(provider.accountId)"
                >
                  <Loader2Icon v-if="isUnlinkingGoogle" class="mr-2 size-3.5 animate-spin" />
                  Unlink Google
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="connectedAccounts.length" class="bg-muted/20 mt-5 rounded-xl border p-4">
          <p class="text-sm font-semibold">Detected provider IDs</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <Badge
              v-for="account in connectedAccounts"
              :key="account.id"
              variant="outline"
              class="font-mono text-[11px]"
            >
              {{ account.providerId }}
            </Badge>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
