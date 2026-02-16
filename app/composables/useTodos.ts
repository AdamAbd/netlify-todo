export type TodoStatus = 'backlog' | 'in_progress' | 'finished'

export interface TodoItem {
  label: string
  checked: boolean
}

export interface Todo {
  id: string
  title: string
  description?: string
  status: TodoStatus
  items: TodoItem[]
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

export interface CreateTodoPayload {
  title: string
  description?: string
  status?: TodoStatus
  items?: TodoItem[]
  imageUrl?: string
}

export interface UpdateTodoPayload {
  title?: string
  description?: string
  status?: TodoStatus
  items?: TodoItem[]
  imageUrl?: string
}

export function useTodos() {
  const todos = useState<Todo[]>('todos', () => [])
  const isLoading = useState<boolean>('todosLoading', () => false)

  const todosByStatus = computed(() => ({
    backlog: todos.value.filter((t) => t.status === 'backlog'),
    in_progress: todos.value.filter((t) => t.status === 'in_progress'),
    finished: todos.value.filter((t) => t.status === 'finished'),
  }))

  const totalTodos = computed(() => todos.value.length)
  const completedTodos = computed(() => todos.value.filter((t) => t.status === 'finished').length)
  const progressPercentage = computed(() =>
    totalTodos.value ? Math.round((completedTodos.value / totalTodos.value) * 100) : 0
  )

  const fetchTodos = async () => {
    isLoading.value = true
    try {
      const data = await $fetch<Todo[]>('/api/todos')
      todos.value = data
    } catch (error) {
      console.error('Failed to fetch todos:', error)
    } finally {
      isLoading.value = false
    }
  }

  const createTodo = async (payload: CreateTodoPayload) => {
    try {
      const data = await $fetch<Todo>('/api/todos', {
        method: 'POST',
        body: payload,
      })
      todos.value.unshift(data)
      return { success: true, todo: data }
    } catch (error: any) {
      return {
        success: false,
        error: error?.data?.message || 'Failed to create todo.',
      }
    }
  }

  const updateTodo = async (id: string, payload: UpdateTodoPayload) => {
    try {
      const data = await $fetch<Todo>(`/api/todos/${id}`, {
        method: 'PATCH',
        body: payload,
      })
      const index = todos.value.findIndex((t) => t.id === id)
      if (index !== -1) todos.value[index] = data
      return { success: true, todo: data }
    } catch (error: any) {
      return {
        success: false,
        error: error?.data?.message || 'Failed to update todo.',
      }
    }
  }

  const updateStatus = async (id: string, status: TodoStatus) => {
    return updateTodo(id, { status })
  }

  const deleteTodo = async (id: string) => {
    try {
      await $fetch(`/api/todos/${id}`, { method: 'DELETE' })
      todos.value = todos.value.filter((t) => t.id !== id)
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error?.data?.message || 'Failed to delete todo.',
      }
    }
  }

  return {
    todos,
    isLoading,
    todosByStatus,
    totalTodos,
    completedTodos,
    progressPercentage,
    fetchTodos,
    createTodo,
    updateTodo,
    updateStatus,
    deleteTodo,
  }
}
