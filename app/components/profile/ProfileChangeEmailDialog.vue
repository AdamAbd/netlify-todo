<script setup lang="ts">
  import { Loader2Icon, MailIcon } from 'lucide-vue-next'
  import { toTypedSchema } from '@vee-validate/zod'
  import { Field as VeeField, useForm } from 'vee-validate'
  import { type ChangeEmailPayload, changeEmailSchema } from '#shared/types/profile'

  const props = defineProps<{
    open: boolean
    isPending?: boolean
  }>()

  const emit = defineEmits<{
    'update:open': [value: boolean]
    submit: [newEmail: string]
  }>()

  const isDialogOpen = computed({
    get: () => props.open,
    set: (value: boolean) => emit('update:open', value),
  })

  const changeEmailForm = useForm<ChangeEmailPayload>({
    validationSchema: toTypedSchema(changeEmailSchema),
    initialValues: {
      newEmail: '',
    },
  })

  const { handleSubmit, resetForm } = changeEmailForm

  watch(
    () => props.open,
    (isOpen) => {
      if (!isOpen) {
        resetForm({
          values: {
            newEmail: '',
          },
        })
      }
    }
  )

  const onSubmit = handleSubmit(async (values) => {
    emit('submit', values.newEmail)
  })
</script>

<template>
  <Dialog v-model:open="isDialogOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Change Email</DialogTitle>
        <DialogDescription>
          Your email address will be updated immediately. Make sure you have access to the new email
          address.
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit="onSubmit">
        <VeeField v-slot="{ field, errors }" name="newEmail" :form="changeEmailForm">
          <Field :data-invalid="!!errors.length">
            <FieldLabel for="change-email-new-email">New Email</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="change-email-new-email"
                :model-value="field.value"
                type="email"
                placeholder="name@example.com"
                autocomplete="email"
                :disabled="isPending"
                @update:model-value="field.onChange"
              />
              <InputGroupAddon>
                <MailIcon />
              </InputGroupAddon>
            </InputGroup>
            <FieldError v-if="errors.length" :errors="errors" />
          </Field>
        </VeeField>

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
            {{ isPending ? 'Submitting...' : 'Request Change' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
