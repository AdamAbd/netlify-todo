<script setup lang="ts">
  import type { Component } from 'vue'
  import {
    PlusIcon,
    Loader2Icon,
    CheckCircle2Icon,
    CircleDotIcon,
    CircleIcon,
  } from 'lucide-vue-next'
  import { toast } from 'vue-sonner'
  import {
    type Todo,
    type TodoStatus,
    type CreateTodoPayload,
    type UpdateTodoPayload,
    createTodoSchema,
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

  const handleCreateFromDialog = async (payload: CreateTodoPayload) => {
    const parseResult = createTodoSchema.safeParse(payload)
    if (!parseResult.success) {
      toast.error(parseResult.error.issues[0]?.message || 'Validation failed')
      return
    }

    const result = await createTodo(payload)
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
    payload: UpdateTodoPayload
  }) => {
    const parseResult = updateTodoSchema.safeParse(payload)
    if (!parseResult.success) {
      toast.error(parseResult.error.issues[0]?.message || 'Validation failed')
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
          <HomeTaskCard
            v-for="todo in todosByStatus[column.key]"
            :key="todo.id"
            :todo="todo"
            @edit="openEditDialog"
            @delete="handleDelete"
            @status-change="handleStatusChange"
          />
        </div>
      </div>
    </div>

    <HomeTodoDialog
      v-model:open="isTodoDialogOpen"
      :mode="dialogMode"
      :todo="editingTodo"
      :default-status="dialogDefaultStatus"
      @create="handleCreateFromDialog"
      @update="handleUpdateFromDialog"
    />
  </div>
</template>
