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
  userId: string
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
