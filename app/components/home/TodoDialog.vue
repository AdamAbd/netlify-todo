<script setup lang="ts">
  import { toTypedSchema } from '@vee-validate/zod'
  import { useForm } from 'vee-validate'
  import { PlusIcon, ImageIcon, XIcon } from 'lucide-vue-next'
  import { toast } from 'vue-sonner'
  import {
    TODO_STATUSES,
    type Todo,
    type TodoStatus,
    type TodoItem,
    type CreateTodoPayload,
    type UpdateTodoPayload,
    createTodoSchema,
  } from '#shared/types/todo'

  interface Props {
    open: boolean
    mode: 'create' | 'edit'
    todo: Todo | null
    defaultStatus?: TodoStatus
  }

  const props = withDefaults(defineProps<Props>(), {
    defaultStatus: 'backlog',
  })

  const emit = defineEmits<{
    'update:open': [value: boolean]
    create: [payload: CreateTodoPayload]
    update: [payload: { id: string; payload: UpdateTodoPayload }]
  }>()

  const defaultTodoFormValues: CreateTodoPayload = {
    title: '',
    description: '',
    status: 'backlog',
    items: [],
    imageUrl: '',
  }

  const openProxy = computed({
    get: () => props.open,
    set: (value: boolean) => emit('update:open', value),
  })

  const checklistInput = ref('')

  const {
    handleSubmit,
    values: todoFormValues,
    setFieldValue,
    setValues,
    resetForm,
  } = useForm<CreateTodoPayload>({
    validationSchema: toTypedSchema(createTodoSchema),
    initialValues: defaultTodoFormValues,
  })

  const statusOptions = TODO_STATUSES.map((status) => ({
    value: status,
    label:
      status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1),
  }))

  const resetTodoDialog = (status: TodoStatus = 'backlog') => {
    checklistInput.value = ''
    resetForm({
      values: {
        ...defaultTodoFormValues,
        status,
      },
    })
  }

  watch(
    () => [props.open, props.mode, props.todo, props.defaultStatus],
    () => {
      if (!props.open) {
        resetTodoDialog(props.defaultStatus)
        return
      }

      if (props.mode === 'create') {
        resetTodoDialog(props.defaultStatus)
        return
      }

      if (!props.todo) {
        resetTodoDialog(props.defaultStatus)
        return
      }

      checklistInput.value = ''
      setValues({
        title: props.todo.title,
        description: props.todo.description || '',
        status: props.todo.status,
        items: props.todo.items ? [...props.todo.items.map((item: TodoItem) => ({ ...item }))] : [],
        imageUrl: props.todo.imageUrl || '',
      })
    },
    { immediate: true }
  )

  const addChecklistItem = () => {
    const label = checklistInput.value.trim()
    if (!label) return

    const items = todoFormValues.items ?? []
    setFieldValue('items', [...items, { label, checked: false }])
    checklistInput.value = ''
  }

  const removeChecklistItem = (index: number) => {
    const items = [...(todoFormValues.items ?? [])]
    items.splice(index, 1)
    setFieldValue('items', items)
  }

  const toggleChecklistItem = (index: number, checked: boolean) => {
    const items = [...(todoFormValues.items ?? [])]
    if (!items[index]) return

    items[index] = { ...items[index], checked }
    setFieldValue('items', items)
  }

  const handleImageError = () => {
    setFieldValue('imageUrl', '')
    toast.error('Gagal memuat gambar. Pastikan URL valid dan dapat diakses.')
  }

  const onSubmit = handleSubmit(async (values) => {
    if (props.mode === 'create') {
      emit('create', values)
      return
    }

    if (!props.todo?.id) {
      toast.error('Task tidak ditemukan untuk update.')
      return
    }

    emit('update', { id: props.todo.id, payload: values })
  })
</script>

<template>
  <Dialog v-model:open="openProxy">
    <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ mode === 'create' ? 'Create New Task' : 'Edit Task' }}</DialogTitle>
        <DialogDescription>
          {{
            mode === 'create'
              ? 'Add a new task to your board. Fill in the details below.'
              : 'Update the task details below.'
          }}
        </DialogDescription>
      </DialogHeader>
      <form class="space-y-4" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="title">
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input placeholder="Enter task title" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="description">
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Add a description (optional)"
                class="min-h-20"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ value, handleChange }" name="status">
          <FormItem>
            <FormLabel>Status</FormLabel>
            <FormControl>
              <Select :model-value="value" @update:model-value="handleChange">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="imageUrl">
          <FormItem>
            <FormLabel>Image URL</FormLabel>
            <FormControl>
              <div class="relative">
                <ImageIcon
                  class="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
                />
                <Input
                  placeholder="https://example.com/image.jpg"
                  class="pl-10"
                  v-bind="componentField"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <div v-if="todoFormValues.imageUrl" class="relative overflow-hidden rounded-lg border">
          <NuxtImg
            :src="todoFormValues.imageUrl"
            alt="Preview"
            class="h-32 w-full object-cover"
            @error="handleImageError"
          />
          <button
            type="button"
            class="bg-background/80 absolute top-2 right-2 rounded-full p-1 backdrop-blur-sm"
            aria-label="Remove image"
            @click="setFieldValue('imageUrl', '')"
          >
            <XIcon class="size-3" />
          </button>
        </div>

        <div class="space-y-2">
          <Label>Checklist Items</Label>
          <div class="space-y-2">
            <div
              v-for="(item, idx) in todoFormValues.items"
              :key="idx"
              class="bg-muted/30 flex items-center gap-2 rounded-md border px-3 py-2"
            >
              <Checkbox
                :model-value="item.checked"
                @update:model-value="(val) => toggleChecklistItem(idx, Boolean(val))"
              />
              <span
                class="flex-1 text-sm"
                :class="item.checked ? 'text-muted-foreground line-through' : ''"
              >
                {{ item.label }}
              </span>
              <button
                type="button"
                class="text-muted-foreground hover:text-destructive"
                aria-label="Remove item"
                @click="removeChecklistItem(idx)"
              >
                <XIcon class="size-3.5" />
              </button>
            </div>
          </div>
          <div class="flex gap-2">
            <Input
              v-model="checklistInput"
              placeholder="Add checklist item"
              class="flex-1"
              @keydown.enter.prevent="addChecklistItem"
            />
            <Button type="button" variant="outline" size="sm" @click="addChecklistItem">
              <PlusIcon class="size-4" />
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="emit('update:open', false)">
            Cancel
          </Button>
          <Button type="submit">
            {{ mode === 'create' ? 'Create Task' : 'Save Changes' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
