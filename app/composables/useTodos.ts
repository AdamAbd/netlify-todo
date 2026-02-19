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

const TODOS_QUERY_KEY = ['todos'] as const
const DEFAULT_PAGE_SIZE = 9
const PAGE_SIZE_OPTIONS = [6, 9, 12, 18] as const

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (typeof error === 'object' && error !== null) {
    const maybeError = error as {
      data?: { message?: string }
      statusMessage?: string
      message?: string
    }

    return (
      maybeError.data?.message || maybeError.statusMessage || maybeError.message || fallbackMessage
    )
  }

  return fallbackMessage
}

export function useTodos() {
  const queryClient = useQueryClient()

  const searchTerm = ref('')
  const debouncedSearchTerm = refDebounced(searchTerm, 350)
  const sortBy = ref<TodoSortBy>('createdAt')
  const sortOrder = ref<TodoSortOrder>('desc')
  const page = ref(1)
  const pageSize = ref(DEFAULT_PAGE_SIZE)

  watch([debouncedSearchTerm, sortBy, sortOrder, pageSize], () => {
    page.value = 1
  })

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
      const response = await $fetch<TodoListResponse>('/api/todos', {
        query: queryParams.value,
      })

      return todoListResponseSchema.parse(response)
    },
    placeholderData: keepPreviousData,
  })

  watch(
    () => todosQuery.data.value?.pagination.page,
    (nextPage) => {
      if (nextPage && nextPage !== page.value) {
        page.value = nextPage
      }
    }
  )

  const invalidateTodos = async () => {
    await queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY })
  }

  const createTodoMutation = useMutation({
    mutationFn: (payload: CreateTodoPayload) =>
      $fetch<Todo>('/api/todos', {
        method: 'POST',
        body: payload,
      }),
    onSuccess: async () => {
      page.value = 1
      await invalidateTodos()
    },
  })

  const updateTodoMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTodoPayload }) => {
      const endpoint = '/api/todos/' + id

      return $fetch<Todo>(endpoint, {
        method: 'PATCH',
        body: payload,
      })
    },
    onSuccess: invalidateTodos,
  })

  const deleteTodoMutation = useMutation({
    mutationFn: (id: string) => {
      const endpoint = '/api/todos/' + id

      return $fetch<void>(endpoint, {
        method: 'DELETE',
      })
    },
    onSuccess: invalidateTodos,
  })

  const todosResponse = computed(() => todosQuery.data.value)
  const todos = computed(() => todosResponse.value?.data ?? [])
  const pagination = computed<TodosPagination>(() => {
    return (
      todosResponse.value?.pagination ?? {
        page: page.value,
        pageSize: pageSize.value,
        totalItems: 0,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false,
      }
    )
  })

  const todosByStatus = computed(() => ({
    backlog: todos.value.filter((todo) => todo.status === 'backlog'),
    in_progress: todos.value.filter((todo) => todo.status === 'in_progress'),
    finished: todos.value.filter((todo) => todo.status === 'finished'),
  }))

  const totalTodos = computed(() => todos.value.length)
  const totalMatchedTodos = computed(() => pagination.value.totalItems)
  const completedTodos = computed(
    () => todos.value.filter((todo) => todo.status === 'finished').length
  )
  const progressPercentage = computed(() =>
    totalTodos.value ? Math.round((completedTodos.value / totalTodos.value) * 100) : 0
  )

  const isLoading = computed(() => todosQuery.isPending.value && !todosQuery.data.value)
  const isFetching = computed(() => todosQuery.isFetching.value)
  const isError = computed(() => todosQuery.isError.value)

  const sortOptions = [
    { value: 'createdAt:desc', label: 'Newest first' },
    { value: 'createdAt:asc', label: 'Oldest first' },
    { value: 'updatedAt:desc', label: 'Recently updated' },
    { value: 'title:asc', label: 'Title A-Z' },
    { value: 'title:desc', label: 'Title Z-A' },
    { value: 'status:asc', label: 'Status (A-Z)' },
  ] as const

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

  const canGoToPreviousPage = computed(() => pagination.value.hasPreviousPage)
  const canGoToNextPage = computed(() => pagination.value.hasNextPage)

  const goToPreviousPage = () => {
    if (!canGoToPreviousPage.value) return
    page.value -= 1
  }

  const goToNextPage = () => {
    if (!canGoToNextPage.value) return
    page.value += 1
  }

  const setPageSize = (value: string) => {
    const numericValue = Number(value)

    if (!Number.isInteger(numericValue) || numericValue < 1 || numericValue > 50) return

    pageSize.value = numericValue
  }

  const fetchTodos = async () => {
    await todosQuery.refetch()
  }

  const createTodo = async (payload: CreateTodoPayload) => {
    try {
      const createdTodo = await createTodoMutation.mutateAsync(payload)
      return { success: true as const, todo: createdTodo }
    } catch (error) {
      return {
        success: false as const,
        error: getErrorMessage(error, 'Failed to create todo.'),
      }
    }
  }

  const updateTodo = async (id: string, payload: UpdateTodoPayload) => {
    try {
      const updatedTodo = await updateTodoMutation.mutateAsync({ id, payload })
      return { success: true as const, todo: updatedTodo }
    } catch (error) {
      return {
        success: false as const,
        error: getErrorMessage(error, 'Failed to update todo.'),
      }
    }
  }

  const updateStatus = async (id: string, status: TodoStatus) => {
    return updateTodo(id, { status })
  }

  const deleteTodo = async (id: string) => {
    try {
      await deleteTodoMutation.mutateAsync(id)
      return { success: true as const }
    } catch (error) {
      return {
        success: false as const,
        error: getErrorMessage(error, 'Failed to delete todo.'),
      }
    }
  }

  return {
    todos,
    todosByStatus,
    totalTodos,
    totalMatchedTodos,
    completedTodos,
    progressPercentage,
    isLoading,
    isFetching,
    isError,
    searchTerm,
    sortValue,
    sortOptions,
    page,
    pageSize,
    pagination,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    canGoToPreviousPage,
    canGoToNextPage,
    goToPreviousPage,
    goToNextPage,
    setPageSize,
    fetchTodos,
    createTodo,
    updateTodo,
    updateStatus,
    deleteTodo,
  }
}
