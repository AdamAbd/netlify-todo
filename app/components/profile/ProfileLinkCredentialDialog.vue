<script setup lang="ts">
  import { Loader2Icon } from 'lucide-vue-next'
  import { toTypedSchema } from '@vee-validate/zod'
  import { useForm } from 'vee-validate'
  import { type LinkCredentialPayload, linkCredentialSchema } from '#shared/types/profile'

  const props = defineProps<{
    open: boolean
    isPending?: boolean
  }>()

  const emit = defineEmits<{
    'update:open': [value: boolean]
    submit: [newPassword: string]
  }>()

  const isDialogOpen = computed({
    get: () => props.open,
    set: (value: boolean) => emit('update:open', value),
  })

  const linkCredentialForm = useForm<LinkCredentialPayload>({
    validationSchema: toTypedSchema(linkCredentialSchema),
    initialValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const { handleSubmit, resetForm } = linkCredentialForm

  watch(
    () => props.open,
    (isOpen) => {
      if (!isOpen) {
        resetForm({
          values: {
            password: '',
            confirmPassword: '',
          },
        })
      }
    }
  )

  const onSubmit = handleSubmit(async (values) => {
    emit('submit', values.password)
  })
</script>

<template>
  <Dialog v-model:open="isDialogOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Link Email & Password</DialogTitle>
        <DialogDescription>
          Add an email & password credential so you can sign in without social providers.
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="password" :form="linkCredentialForm">
          <FormItem>
            <FormLabel>New Password</FormLabel>
            <FormControl>
              <Input
                type="password"
                autocomplete="new-password"
                placeholder="Create a strong password"
                :disabled="isPending"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="confirmPassword" :form="linkCredentialForm">
          <FormItem>
            <FormLabel>Confirm Password</FormLabel>
            <FormControl>
              <Input
                type="password"
                autocomplete="new-password"
                placeholder="Re-enter password"
                :disabled="isPending"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            :disabled="isPending"
            @click="isDialogOpen = false"
          >
            Cancel
          </Button>
          <Button type="submit" :disabled="isPending">
            <Loader2Icon v-if="isPending" class="mr-2 size-3.5 animate-spin" />
            {{ isPending ? 'Linking...' : 'Link Credential' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
