<script setup lang="ts">
  import type { Component } from 'vue'
  import {
    PlusIcon,
    Loader2Icon,
    ImageIcon,
    Trash2Icon,
    CheckCircle2Icon,
    CircleDotIcon,
    CircleIcon,
    MoreHorizontalIcon,
    PencilIcon,
    ArrowRightIcon,
    ListChecksIcon,
  } from 'lucide-vue-next'
  import { toast } from 'vue-sonner'
  import {
    type Todo,
    type TodoStatus,
    type TodoItem,
    type CreateTodoPayload,
    updateTodoSchema,
  } from '#shared/types/todo'

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

  const isTodoDialogOpen = ref(false)
  const dialogMode = ref<'create' | 'edit'>('create')
  const dialogDefaultStatus = ref<TodoStatus>('backlog')
  const editingTodo = ref<Todo | null>(null)

  watch(isTodoDialogOpen, (open) => {
    if (!open) {
      editingTodo.value = null
      dialogDefaultStatus.value = 'backlog'
    }
  })

  const openCreateDialog = (status: TodoStatus = 'backlog') => {
    dialogMode.value = 'create'
    editingTodo.value = null
    dialogDefaultStatus.value = status
    isTodoDialogOpen.value = true
  }

  const openEditDialog = (todo: Todo) => {
    dialogMode.value = 'edit'
    editingTodo.value = todo
    isTodoDialogOpen.value = true
  }

  const handleCreateFromDialog = async (values: CreateTodoPayload) => {
    const result = await createTodo(values)
    if (result.success) {
      isTodoDialogOpen.value = false
      toast.success('Task created successfully')
    } else {
      toast.error(result.error)
    }
  }

  const handleUpdateFromDialog = async ({
    id,
    payload,
  }: {
    id: string
    payload: CreateTodoPayload
  }) => {
    const parseResult = updateTodoSchema.safeParse(payload)
    if (!parseResult.success) {
      toast.error(parseResult.error.errors[0]?.message || 'Validation failed')
      return
    }

    const result = await updateTodo(id, parseResult.data)
    if (result.success) {
      isTodoDialogOpen.value = false
      toast.success('Task updated successfully')
    } else {
      toast.error(result.error)
    }
  }

  const handleDelete = async (id: string) => {
    await deleteTodo(id)
  }

  const handleStatusChange = async (id: string, status: TodoStatus) => {
    await updateStatus(id, status)
  }

  // Column config
  const columns: { key: TodoStatus; label: string; icon: Component; dotColor: string }[] = [
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

  const openCreateForBacklog = () => {
    openCreateDialog('backlog')
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
      <Button class="gap-2" @click="openCreateDialog()">
        <PlusIcon class="size-4" />
        Add Task
      </Button>
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
                  <DropdownMenuItem @click="openEditDialog(todo)">
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
                <Checkbox :model-value="item.checked" class="size-3.5" disabled />
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

    <SharedTodoDialog
      v-model:open="isTodoDialogOpen"
      :mode="dialogMode"
      :todo="editingTodo"
      :default-status="dialogDefaultStatus"
      @create="handleCreateFromDialog"
      @update="handleUpdateFromDialog"
    />
  </div>
</template>
