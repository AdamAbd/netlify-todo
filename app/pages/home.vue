<script setup lang="ts">
  import {
    PlusIcon,
    Loader2Icon,
    ImageIcon,
    Trash2Icon,
    GripVerticalIcon,
    CheckCircle2Icon,
    CircleDotIcon,
    CircleIcon,
    MoreHorizontalIcon,
    PencilIcon,
    ArrowRightIcon,
    XIcon,
    UploadIcon,
    ListChecksIcon,
  } from 'lucide-vue-next'
  import { toast } from 'vue-sonner'
  import type { Todo, TodoStatus, TodoItem, CreateTodoPayload } from '~/composables/useTodos'

  definePageMeta({
    middleware: ['auth'],
  })

  useHead({
    title: 'Home - Todoist',
    meta: [
      {
        name: 'description',
        content: 'Your personal task dashboard. Manage and organize your todos.',
      },
    ],
  })

  const {
    todosByStatus,
    totalTodos,
    completedTodos,
    progressPercentage,
    isLoading,
    fetchTodos,
    createTodo,
    updateTodo,
    updateStatus,
    deleteTodo,
  } = useTodos()

  // Fetch todos on mount
  onMounted(() => {
    fetchTodos()
  })

  // Dialog state
  const isCreateDialogOpen = ref(false)
  const isEditDialogOpen = ref(false)
  const editingTodo = ref<Todo | null>(null)

  // Create form
  const createForm = reactive<CreateTodoPayload>({
    title: '',
    description: '',
    status: 'backlog',
    items: [],
    imageUrl: '',
  })

  const newItemLabel = ref('')

  const addItem = () => {
    if (!newItemLabel.value.trim()) return
    if (!createForm.items) createForm.items = []
    createForm.items.push({ label: newItemLabel.value.trim(), checked: false })
    newItemLabel.value = ''
  }

  const removeItem = (index: number) => {
    createForm.items?.splice(index, 1)
  }

  const resetCreateForm = () => {
    createForm.title = ''
    createForm.description = ''
    createForm.status = 'backlog'
    createForm.items = []
    createForm.imageUrl = ''
    newItemLabel.value = ''
  }

  const handleCreate = async () => {
    if (!createForm.title.trim()) return
    const result = await createTodo({
      ...createForm,
      items: createForm.items?.length ? createForm.items : undefined,
      imageUrl: createForm.imageUrl || undefined,
      description: createForm.description || undefined,
    })
    if (result.success) {
      isCreateDialogOpen.value = false
      resetCreateForm()
    }
  }

  const handleImageError = () => {
    createForm.imageUrl = ''

    toast.error('Gagal memuat gambar. Pastikan URL valid dan dapat diakses.')
  }

  const handleEditImageError = () => {
    editForm.imageUrl = ''

    toast.error('Gagal memuat gambar. Pastikan URL valid dan dapat diakses.')
  }

  // Edit form
  const editForm = reactive<{
    title: string
    description: string
    status: TodoStatus
    items: TodoItem[]
    imageUrl: string
  }>({
    title: '',
    description: '',
    status: 'backlog',
    items: [],
    imageUrl: '',
  })

  const editItemLabel = ref('')

  const addEditItem = () => {
    if (!editItemLabel.value.trim()) return
    editForm.items.push({ label: editItemLabel.value.trim(), checked: false })
    editItemLabel.value = ''
  }

  const removeEditItem = (index: number) => {
    editForm.items.splice(index, 1)
  }

  const openEdit = (todo: Todo) => {
    editingTodo.value = todo
    editForm.title = todo.title
    editForm.description = todo.description || ''
    editForm.status = todo.status
    editForm.items = todo.items ? [...todo.items.map((i: TodoItem) => ({ ...i }))] : []
    editForm.imageUrl = todo.imageUrl || ''
    editItemLabel.value = ''
    isEditDialogOpen.value = true
  }

  const handleEdit = async () => {
    if (!editingTodo.value || !editForm.title.trim()) return
    await updateTodo(editingTodo.value.id, {
      title: editForm.title,
      description: editForm.description || undefined,
      status: editForm.status,
      items: editForm.items.length ? editForm.items : undefined,
      imageUrl: editForm.imageUrl || undefined,
    })
    isEditDialogOpen.value = false
    editingTodo.value = null
  }

  const handleDelete = async (id: string) => {
    await deleteTodo(id)
  }

  const handleStatusChange = async (id: string, status: TodoStatus) => {
    await updateStatus(id, status)
  }

  // Column config
  const columns: { key: TodoStatus; label: string; icon: any; dotColor: string }[] = [
    { key: 'backlog', label: 'Backlog', icon: CircleIcon, dotColor: 'bg-muted-foreground' },
    { key: 'in_progress', label: 'In Progress', icon: CircleDotIcon, dotColor: 'bg-primary' },
    { key: 'finished', label: 'Finished', icon: CheckCircle2Icon, dotColor: 'bg-secondary' },
  ]

  const statusOptions: { value: TodoStatus; label: string }[] = [
    { value: 'backlog', label: 'Backlog' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'finished', label: 'Finished' },
  ]

  const getNextStatus = (current: TodoStatus): TodoStatus | null => {
    if (current === 'backlog') return 'in_progress'
    if (current === 'in_progress') return 'finished'
    return null
  }

  const getStatusBadgeVariant = (status: TodoStatus) => {
    if (status === 'finished') return 'secondary' as const
    if (status === 'in_progress') return 'default' as const
    return 'outline' as const
  }

  const openCreateForBacklog = () => {
    createForm.status = 'backlog'
    isCreateDialogOpen.value = true
  }
</script>

<template>
  <div class="space-y-8">
    <!-- Page header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">My Tasks</h1>
        <p class="text-muted-foreground mt-1">
          {{ totalTodos }} total tasks · {{ completedTodos }} completed
        </p>
      </div>

      <Dialog v-model:open="isCreateDialogOpen">
        <DialogTrigger as-child>
          <Button class="gap-2">
            <PlusIcon class="size-4" />
            Add Task
          </Button>
        </DialogTrigger>
        <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task to your board. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          <form class="space-y-4" @submit.prevent="handleCreate">
            <!-- Title -->
            <div class="space-y-2">
              <Label for="create-title">Title</Label>
              <Input
                id="create-title"
                v-model="createForm.title"
                placeholder="Enter task title"
                required
              />
            </div>

            <!-- Description -->
            <div class="space-y-2">
              <Label for="create-desc">Description</Label>
              <Textarea
                id="create-desc"
                v-model="createForm.description"
                placeholder="Add a description (optional)"
                class="min-h-20"
              />
            </div>

            <!-- Status -->
            <div class="space-y-2">
              <Label>Status</Label>
              <Select v-model="createForm.status">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Image URL -->
            <div class="space-y-2">
              <Label for="create-image">Image URL</Label>
              <div class="relative">
                <ImageIcon
                  class="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
                />
                <Input
                  id="create-image"
                  v-model="createForm.imageUrl"
                  placeholder="https://example.com/image.jpg"
                  class="pl-10"
                />
              </div>
              <!-- Image preview -->
              <div v-if="createForm.imageUrl" class="relative overflow-hidden rounded-lg border">
                <NuxtImg
                  :src="createForm.imageUrl"
                  alt="Preview"
                  class="h-32 w-full object-cover"
                  @error="handleImageError"
                />
                <button
                  type="button"
                  class="bg-background/80 absolute top-2 right-2 rounded-full p-1 backdrop-blur-sm"
                  @click="createForm.imageUrl = ''"
                  aria-label="Remove image"
                >
                  <XIcon class="size-3" />
                </button>
              </div>
            </div>

            <!-- Checklist Items (JSONB) -->
            <div class="space-y-2">
              <Label>Checklist Items</Label>
              <div class="space-y-2">
                <div
                  v-for="(item, idx) in createForm.items"
                  :key="idx"
                  class="bg-muted/30 flex items-center gap-2 rounded-md border px-3 py-2"
                >
                  <Checkbox
                    :checked="item.checked"
                    @update:checked="(val: boolean) => (item.checked = val)"
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
                    @click="removeItem(idx)"
                    aria-label="Remove checklist item"
                  >
                    <XIcon class="size-3.5" />
                  </button>
                </div>
              </div>
              <div class="flex gap-2">
                <Input
                  v-model="newItemLabel"
                  placeholder="Add checklist item"
                  class="flex-1"
                  @keydown.enter.prevent="addItem"
                />
                <Button type="button" variant="outline" size="sm" @click="addItem">
                  <PlusIcon class="size-4" />
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" @click="isCreateDialogOpen = false">
                Cancel
              </Button>
              <Button type="submit" :disabled="!createForm.title.trim()"> Create Task </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>

    <!-- Progress bar -->
    <div class="space-y-2">
      <div class="flex items-center justify-between text-sm">
        <span class="text-muted-foreground">Overall progress</span>
        <span class="font-medium">{{ progressPercentage }}%</span>
      </div>
      <Progress :model-value="progressPercentage" />
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex items-center justify-center py-24">
      <div class="text-muted-foreground flex flex-col items-center gap-3">
        <Loader2Icon class="size-8 animate-spin" />
        <p class="text-sm">Loading your tasks...</p>
      </div>
    </div>

    <!-- Kanban Board -->
    <div v-else class="grid gap-6 lg:grid-cols-3">
      <div
        v-for="column in columns"
        :key="column.key"
        class="bg-muted/20 flex flex-col rounded-xl border p-4"
      >
        <!-- Column header -->
        <div class="mb-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="size-2.5 rounded-full" :class="column.dotColor" />
            <h2 class="text-sm font-semibold">{{ column.label }}</h2>
            <Badge variant="secondary" class="text-xs">
              {{ todosByStatus[column.key].length }}
            </Badge>
          </div>
          <Button
            v-if="column.key === 'backlog'"
            variant="ghost"
            size="icon-sm"
            @click="openCreateForBacklog"
          >
            <PlusIcon class="size-4" />
          </Button>
        </div>

        <!-- Tasks list -->
        <div class="flex flex-1 flex-col gap-3">
          <!-- Empty state -->
          <div
            v-if="todosByStatus[column.key].length === 0"
            class="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center"
          >
            <component :is="column.icon" class="text-muted-foreground/50 mb-2 size-8" />
            <p class="text-muted-foreground text-sm">No tasks here</p>
          </div>

          <!-- Task cards -->
          <div
            v-for="todo in todosByStatus[column.key]"
            :key="todo.id"
            class="group bg-card relative rounded-lg border p-4 shadow-sm transition-all duration-200 hover:shadow-md"
            :class="{
              'border-primary/20': column.key === 'in_progress',
              'opacity-75': column.key === 'finished',
            }"
          >
            <!-- Image -->
            <div v-if="todo.imageUrl" class="mb-3 overflow-hidden rounded-md">
              <img
                :src="todo.imageUrl"
                :alt="todo.title"
                class="h-28 w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            <!-- Title & Actions -->
            <div class="flex items-start justify-between gap-2">
              <h3
                class="text-sm leading-snug font-medium"
                :class="column.key === 'finished' ? 'text-muted-foreground line-through' : ''"
              >
                {{ todo.title }}
              </h3>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    class="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <MoreHorizontalIcon class="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" class="w-48">
                  <DropdownMenuItem @click="openEdit(todo)">
                    <PencilIcon class="mr-2 size-4" />
                    Edit
                  </DropdownMenuItem>
                  <!-- Status changes -->
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel class="text-muted-foreground text-xs"
                    >Move to</DropdownMenuLabel
                  >
                  <DropdownMenuItem
                    v-for="opt in statusOptions.filter((s) => s.value !== todo.status)"
                    :key="opt.value"
                    @click="handleStatusChange(todo.id, opt.value)"
                  >
                    <ArrowRightIcon class="mr-2 size-4" />
                    {{ opt.label }}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    class="text-destructive focus:text-destructive"
                    @click="handleDelete(todo.id)"
                  >
                    <Trash2Icon class="mr-2 size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <!-- Description -->
            <p v-if="todo.description" class="text-muted-foreground mt-1 line-clamp-2 text-xs">
              {{ todo.description }}
            </p>

            <!-- Checklist items preview -->
            <div v-if="todo.items && todo.items.length > 0" class="mt-3 space-y-1.5">
              <div
                v-for="(item, idx) in todo.items.slice(0, 3)"
                :key="idx"
                class="flex items-center gap-2 text-xs"
              >
                <Checkbox :checked="item.checked" class="size-3.5" disabled />
                <span
                  :class="item.checked ? 'text-muted-foreground line-through' : 'text-foreground'"
                >
                  {{ item.label }}
                </span>
              </div>
              <p v-if="todo.items.length > 3" class="text-muted-foreground text-xs">
                +{{ todo.items.length - 3 }} more items
              </p>
            </div>

            <!-- Footer: Items count + quick move -->
            <div class="mt-3 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  v-if="todo.items && todo.items.length"
                  class="text-muted-foreground flex items-center gap-1 text-xs"
                >
                  <ListChecksIcon class="size-3.5" />
                  {{ todo.items.filter((i: TodoItem) => i.checked).length }}/{{ todo.items.length }}
                </div>
                <div
                  v-if="todo.imageUrl"
                  class="text-muted-foreground flex items-center gap-1 text-xs"
                >
                  <ImageIcon class="size-3.5" />
                </div>
              </div>
              <!-- Quick move button -->
              <Button
                v-if="getNextStatus(todo.status)"
                variant="ghost"
                size="sm"
                class="h-7 gap-1 px-2 text-xs opacity-0 transition-opacity group-hover:opacity-100"
                @click="handleStatusChange(todo.id, getNextStatus(todo.status)!)"
              >
                <ArrowRightIcon class="size-3" />
                {{ getNextStatus(todo.status) === 'in_progress' ? 'Start' : 'Done' }}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Dialog -->
    <Dialog v-model:open="isEditDialogOpen">
      <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription> Update the task details below. </DialogDescription>
        </DialogHeader>
        <form class="space-y-4" @submit.prevent="handleEdit">
          <!-- Title -->
          <div class="space-y-2">
            <Label for="edit-title">Title</Label>
            <Input
              id="edit-title"
              v-model="editForm.title"
              placeholder="Enter task title"
              required
            />
          </div>

          <!-- Description -->
          <div class="space-y-2">
            <Label for="edit-desc">Description</Label>
            <Textarea
              id="edit-desc"
              v-model="editForm.description"
              placeholder="Add a description (optional)"
              class="min-h-20"
            />
          </div>

          <!-- Status -->
          <div class="space-y-2">
            <Label>Status</Label>
            <Select v-model="editForm.status">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Image URL -->
          <div class="space-y-2">
            <Label for="edit-image">Image URL</Label>
            <div class="relative">
              <ImageIcon
                class="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
              />
              <Input
                id="edit-image"
                v-model="editForm.imageUrl"
                placeholder="https://example.com/image.jpg"
                class="pl-10"
              />
            </div>
            <div v-if="editForm.imageUrl" class="relative overflow-hidden rounded-lg border">
              <NuxtImg
                :src="editForm.imageUrl"
                alt="Preview"
                class="h-32 w-full object-cover"
                @error="handleEditImageError"
              />
              <button
                type="button"
                class="bg-background/80 absolute top-2 right-2 rounded-full p-1 backdrop-blur-sm"
                @click="editForm.imageUrl = ''"
              >
                <XIcon class="size-3" />
              </button>
            </div>
          </div>

          <!-- Checklist Items -->
          <div class="space-y-2">
            <Label>Checklist Items</Label>
            <div class="space-y-2">
              <div
                v-for="(item, idx) in editForm.items"
                :key="idx"
                class="bg-muted/30 flex items-center gap-2 rounded-md border px-3 py-2"
              >
                <Checkbox
                  :checked="item.checked"
                  @update:checked="(val: boolean) => (item.checked = val)"
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
                  @click="removeEditItem(idx)"
                >
                  <XIcon class="size-3.5" />
                </button>
              </div>
            </div>
            <div class="flex gap-2">
              <Input
                v-model="editItemLabel"
                placeholder="Add checklist item"
                class="flex-1"
                @keydown.enter.prevent="addEditItem"
              />
              <Button type="button" variant="outline" size="sm" @click="addEditItem">
                <PlusIcon class="size-4" />
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="isEditDialogOpen = false">
              Cancel
            </Button>
            <Button type="submit" :disabled="!editForm.title.trim()"> Save Changes </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
