<script setup lang="ts">
  import type { Component } from 'vue'
  import {
    PlusIcon,
    Loader2Icon,
    SearchIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
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
    totalMatchedTodos,
    completedTodos,
    progressPercentage,
    isLoading,
    isFetching,
    searchTerm,
    sortValue,
    sortOptions,
    pageSize,
    pageSizeOptions,
    pagination,
    canGoToPreviousPage,
    canGoToNextPage,
    goToPreviousPage,
    goToNextPage,
    setPageSize,
    createTodo,
    updateTodo,
    updateStatus,
    deleteTodo,
  } = useTodos()

  const handleSortChange = (value: string) => {
    sortValue.value = value
  }

  const handlePageSizeChange = (value: string) => {
    setPageSize(value)
  }

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

    const result = await createTodo(parseResult.data)
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
    const result = await deleteTodo(id)
    if (!result.success) {
      toast.error(result.error)
    }
  }

  const handleStatusChange = async (id: string, status: TodoStatus) => {
    const result = await updateStatus(id, status)
    if (!result.success) {
      toast.error(result.error)
    }
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
          Showing {{ totalTodos }} of {{ totalMatchedTodos }} tasks · {{ completedTodos }}
          completed on this page
        </p>
      </div>
      <Button class="gap-2" @click="openCreateDialog()">
        <PlusIcon class="size-4" />
        Add Task
      </Button>
    </div>

    <div class="grid gap-3 sm:grid-cols-[1fr_220px_140px]">
      <div class="relative">
        <SearchIcon class="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          v-model="searchTerm"
          class="pl-9"
          placeholder="Search by title or description..."
          type="search"
        />
      </div>

      <Select
        :model-value="sortValue"
        @update:model-value="(value) => handleSortChange(String(value))"
      >
        <SelectTrigger class="w-full">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="option in sortOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Select
        :model-value="String(pageSize)"
        @update:model-value="(value) => handlePageSizeChange(String(value))"
      >
        <SelectTrigger class="w-full">
          <SelectValue placeholder="Per page" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="size in pageSizeOptions" :key="size" :value="String(size)">
            {{ size }} / page
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Progress bar -->
    <div class="space-y-2">
      <div class="flex items-center justify-between text-sm">
        <span class="text-muted-foreground">Overall progress</span>
        <div class="flex items-center gap-2">
          <span v-if="isFetching" class="text-muted-foreground flex items-center gap-1 text-xs">
            <Loader2Icon class="size-3 animate-spin" />
            Updating...
          </span>
          <span class="font-medium">{{ progressPercentage }}%</span>
        </div>
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

    <div class="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p class="text-muted-foreground text-sm">
        Page {{ pagination.page }} of {{ pagination.totalPages || 1 }}
      </p>
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="!canGoToPreviousPage || isFetching"
          @click="goToPreviousPage"
        >
          <ArrowLeftIcon class="mr-1 size-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="!canGoToNextPage || isFetching"
          @click="goToNextPage"
        >
          Next
          <ArrowRightIcon class="ml-1 size-4" />
        </Button>
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
