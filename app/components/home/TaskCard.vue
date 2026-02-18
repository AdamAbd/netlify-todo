<script setup lang="ts">
  import { computed } from 'vue'
  import {
    ImageIcon,
    Trash2Icon,
    MoreHorizontalIcon,
    PencilIcon,
    ArrowRightIcon,
    ListChecksIcon,
  } from 'lucide-vue-next'
  import type { Todo, TodoStatus } from '#shared/types/todo'

  const props = defineProps<{
    todo: Todo
  }>()

  const emit = defineEmits<{
    edit: [todo: Todo]
    delete: [id: string]
    statusChange: [id: string, status: TodoStatus]
  }>()

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

  const previewItems = computed(() => props.todo.items?.slice(0, 3) ?? [])
  const hasItems = computed(() => Boolean(props.todo.items?.length))
  const checkedItemsCount = computed(
    () => props.todo.items?.filter((item) => item.checked).length ?? 0
  )
  const nextStatus = computed(() => getNextStatus(props.todo.status))
</script>

<template>
  <div
    class="group bg-card relative rounded-lg border p-4 shadow-sm transition-all duration-200 hover:shadow-md"
    :class="{
      'border-primary/20': todo.status === 'in_progress',
      'opacity-75': todo.status === 'finished',
    }"
  >
    <div v-if="todo.imageUrl" class="mb-3 overflow-hidden rounded-md">
      <img
        :src="todo.imageUrl"
        :alt="todo.title"
        class="h-28 w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </div>

    <div class="flex items-start justify-between gap-2">
      <h3
        class="text-sm leading-snug font-medium"
        :class="todo.status === 'finished' ? 'text-muted-foreground line-through' : ''"
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
          <DropdownMenuItem @click="emit('edit', todo)">
            <PencilIcon class="mr-2 size-4" />
            Edit
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuLabel class="text-muted-foreground text-xs">Move to</DropdownMenuLabel>
          <DropdownMenuItem
            v-for="opt in statusOptions.filter((status) => status.value !== todo.status)"
            :key="opt.value"
            @click="emit('statusChange', todo.id, opt.value)"
          >
            <ArrowRightIcon class="mr-2 size-4" />
            {{ opt.label }}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            class="text-destructive focus:text-destructive"
            @click="emit('delete', todo.id)"
          >
            <Trash2Icon class="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <p v-if="todo.description" class="text-muted-foreground mt-1 line-clamp-2 text-xs">
      {{ todo.description }}
    </p>

    <div v-if="hasItems" class="mt-3 space-y-1.5">
      <div v-for="(item, idx) in previewItems" :key="idx" class="flex items-center gap-2 text-xs">
        <Checkbox :model-value="item.checked" class="size-3.5" disabled />
        <span :class="item.checked ? 'text-muted-foreground line-through' : 'text-foreground'">
          {{ item.label }}
        </span>
      </div>
      <p v-if="todo.items!.length > 3" class="text-muted-foreground text-xs">
        +{{ todo.items!.length - 3 }} more items
      </p>
    </div>

    <div class="mt-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div v-if="hasItems" class="text-muted-foreground flex items-center gap-1 text-xs">
          <ListChecksIcon class="size-3.5" />
          {{ checkedItemsCount }}/{{ todo.items!.length }}
        </div>
        <div v-if="todo.imageUrl" class="text-muted-foreground flex items-center gap-1 text-xs">
          <ImageIcon class="size-3.5" />
        </div>
      </div>

      <Button
        v-if="nextStatus"
        variant="ghost"
        size="sm"
        class="h-7 gap-1 px-2 text-xs opacity-0 transition-opacity group-hover:opacity-100"
        @click="emit('statusChange', todo.id, nextStatus)"
      >
        <ArrowRightIcon class="size-3" />
        {{ nextStatus === 'in_progress' ? 'Start' : 'Done' }}
      </Button>
    </div>
  </div>
</template>
