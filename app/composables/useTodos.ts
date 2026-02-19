import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type {
  Todo,
  TodoStatus,
  TodoSortBy,
  TodoSortOrder,
  TodosPagination,
  TodoListResponse,
  CreateTodoPayload,
  UpdateTodoPayload,
} from '#shared/types/todo'
import { todoListResponseSchema, todoSortBySchema, todoSortOrderSchema } from '#shared/types/todo'

// ─── Constants ───────────────────────────────────────────────────────────────

const TODOS_QUERY_KEY = ['todos'] as const
const DEFAULT_PAGE_SIZE = 9
const PAGE_SIZE_OPTIONS = [6, 9, 12, 18] as const

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'updatedAt:desc', label: 'Recently updated' },
  { value: 'title:asc', label: 'Title A-Z' },
  { value: 'title:desc', label: 'Title Z-A' },
  { value: 'status:asc', label: 'Status (A-Z)' },
] as const

const DEFAULT_PAGINATION: TodosPagination = {
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  totalItems: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function extractErrorMessage(error: unknown, fallback: string): string {
  if (typeof error !== 'object' || error === null) return fallback

  const err = error as { data?: { message?: string }; statusMessage?: string; message?: string }
  return err.data?.message ?? err.statusMessage ?? err.message ?? fallback
}

type MutationResult<T> = { success: true; data: T } | { success: false; error: string }

async function withErrorHandling<T>(
  fn: () => Promise<T>,
  fallbackMessage: string
): Promise<MutationResult<T>> {
  try {
    const data = await fn()
    return { success: true, data }
  } catch (error) {
    return { success: false, error: extractErrorMessage(error, fallbackMessage) }
  }
}

// ─── Composable ───────────────────────────────────────────────────────────────

export function useTodos() {
  const queryClient = useQueryClient()

  // State
  const searchTerm = ref('')
  const debouncedSearchTerm = refDebounced(searchTerm, 350)
  const sortBy = ref<TodoSortBy>('createdAt')
  const sortOrder = ref<TodoSortOrder>('desc')
  const page = ref(1)
  const pageSize = ref(DEFAULT_PAGE_SIZE)

  // Reset to page 1 when filters/sorting/page size change
  watch([debouncedSearchTerm, sortBy, sortOrder, pageSize], () => {
    page.value = 1
  })

  // Query
  const queryParams = computed(() => ({
    search: debouncedSearchTerm.value.trim() || undefined,
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
    page: page.value,
    pageSize: pageSize.value,
  }))

  const todosQuery = useQuery({
    queryKey: computed(() => [...TODOS_QUERY_KEY, queryParams.value]),
    queryFn: async () => {
      const response = await $fetch<TodoListResponse>('/api/todos', { query: queryParams.value })
      return todoListResponseSchema.parse(response)
    },
    placeholderData: keepPreviousData,
  })

  // Sync server-corrected page back to local state (e.g. page out of range)
  watch(
    () => todosQuery.data.value?.pagination.page,
    (serverPage) => {
      if (serverPage && serverPage !== page.value) page.value = serverPage
    }
  )

  // Mutations
  const invalidateTodos = () => queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY })

  const createTodoMutation = useMutation({
    mutationFn: (payload: CreateTodoPayload) =>
      $fetch<Todo>('/api/todos', { method: 'POST', body: payload }),
    onSuccess: async () => {
      page.value = 1
      await invalidateTodos()
    },
  })

  const updateTodoMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTodoPayload }) =>
      $fetch<Todo>(`/api/todos/${id}`, { method: 'PATCH', body: payload }),
    onSuccess: invalidateTodos,
  })

  const deleteTodoMutation = useMutation({
    mutationFn: (id: string) => $fetch<unknown>(`/api/todos/${id}`, { method: 'DELETE' }),
    onSuccess: invalidateTodos,
  })

  // Computed — Todo data
  const todosResponse = computed(() => todosQuery.data.value)
  const todos = computed(() => todosResponse.value?.data ?? [])

  const todosByStatus = computed(() => ({
    backlog: todos.value.filter((todo) => todo.status === 'backlog'),
    in_progress: todos.value.filter((todo) => todo.status === 'in_progress'),
    finished: todos.value.filter((todo) => todo.status === 'finished'),
  }))

  const totalTodos = computed(() => todos.value.length)
  const totalMatchedTodos = computed(() => pagination.value.totalItems)
  const completedTodos = computed(() => todosByStatus.value.finished.length)
  const progressPercentage = computed(() =>
    totalMatchedTodos.value ? Math.round((completedTodos.value / totalMatchedTodos.value) * 100) : 0
  )

  // Computed — Pagination
  const pagination = computed<TodosPagination>(
    () =>
      todosResponse.value?.pagination ?? {
        ...DEFAULT_PAGINATION,
        page: page.value,
        pageSize: pageSize.value,
      }
  )

  const canGoToPreviousPage = computed(() => pagination.value.hasPreviousPage)
  const canGoToNextPage = computed(() => pagination.value.hasNextPage)

  // Computed — UI state
  const isLoading = computed(() => todosQuery.isPending.value && !todosQuery.data.value)
  const isFetching = computed(() => todosQuery.isFetching.value)
  const isError = computed(() => todosQuery.isError.value)

  // Computed — Sort
  const sortValue = computed({
    get: () => `${sortBy.value}:${sortOrder.value}`,
    set: (value: string) => {
      const [nextSortBy, nextSortOrder] = value.split(':')
      const parsedSortBy = todoSortBySchema.safeParse(nextSortBy)
      const parsedSortOrder = todoSortOrderSchema.safeParse(nextSortOrder)

      if (!parsedSortBy.success || !parsedSortOrder.success) return

      sortBy.value = parsedSortBy.data
      sortOrder.value = parsedSortOrder.data
    },
  })

  // Actions — Pagination
  const goToPreviousPage = () => {
    if (canGoToPreviousPage.value) page.value -= 1
  }
  const goToNextPage = () => {
    if (canGoToNextPage.value) page.value += 1
  }

  const setPageSize = (value: string) => {
    const numericValue = Number(value)
    const isValid = Number.isInteger(numericValue) && numericValue >= 1 && numericValue <= 50
    if (isValid) pageSize.value = numericValue
  }

  // Actions — CRUD
  const fetchTodos = () => todosQuery.refetch()

  const createTodo = (payload: CreateTodoPayload) =>
    withErrorHandling(() => createTodoMutation.mutateAsync(payload), 'Failed to create todo.')

  const updateTodo = (id: string, payload: UpdateTodoPayload) =>
    withErrorHandling(
      () => updateTodoMutation.mutateAsync({ id, payload }),
      'Failed to update todo.'
    )

  const updateStatus = (id: string, status: TodoStatus) => updateTodo(id, { status })

  const deleteTodo = (id: string) =>
    withErrorHandling(() => deleteTodoMutation.mutateAsync(id), 'Failed to delete todo.')

  return {
    todos,
    todosByStatus,
    totalTodos,
    totalMatchedTodos,
    completedTodos,
    progressPercentage,
    searchTerm,
    sortValue,
    sortOptions: SORT_OPTIONS,
    page,
    pageSize,
    pagination,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    canGoToPreviousPage,
    canGoToNextPage,
    goToPreviousPage,
    goToNextPage,
    setPageSize,
    isLoading,
    isFetching,
    isError,
    fetchTodos,
    createTodo,
    updateTodo,
    updateStatus,
    deleteTodo,
  }
}
