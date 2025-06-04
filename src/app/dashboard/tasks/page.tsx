'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Heading,
  Button,
  HStack,
  useDisclosure,
} from '@chakra-ui/react'
import { FiPlus } from 'react-icons/fi'
import { DashboardLayout } from '@/app/components/layout/DashboardLayout'
import { TaskList } from '@/app/components/tasks/TaskList'
import { TaskForm } from '@/app/components/tasks/TaskForm'
import type { Task, TaskFormData } from '@/app/types'

export default function TasksPage() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks')
      if (!res.ok) throw new Error('Failed to fetch tasks')
      const data: Task[] = await res.json()
      setTasks(data)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (data: TaskFormData) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        }),
      })
      if (!res.ok) throw new Error('Failed to create task')
      await fetchTasks()
      onClose()
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const handleUpdate = async (id: string, data: Partial<TaskFormData>) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        }),
      })
      if (!res.ok) throw new Error('Failed to update task')
      await fetchTasks()
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete task')
      await fetchTasks()
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    onOpen()
  }

  const handleCloseForm = () => {
    setEditingTask(null)
    onClose()
  }

  const handleSubmit = async (data: TaskFormData) => {
    if (editingTask) {
      await handleUpdate(editingTask.id, data)
    } else {
      await handleCreate(data)
    }
  }

  // Convert Task to TaskFormData
  const convertTaskToFormData = (task: Task | null): TaskFormData | undefined => {
    if (!task) return undefined
    
    return {
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate 
        ? new Date(task.dueDate).toISOString().split('T')[0] 
        : null,
      priority: (task.priority as 'low' | 'medium' | 'high') || null,
      completed: task.completed,
    }
  }

  return (
    <DashboardLayout>
      <Box>
        <HStack justify="space-between" mb={6}>
          <Heading>Tasks</Heading>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="brand"
            onClick={onOpen}
          >
            New Task
          </Button>
        </HStack>

        <TaskList
          tasks={tasks as Task[]}
          isLoading={isLoading}
          onUpdate={handleUpdate as (id: string, data: Partial<Task>) => void}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />

        <TaskForm
          isOpen={isOpen}
          onClose={handleCloseForm}
          onSubmit={handleSubmit}
          initialData={convertTaskToFormData(editingTask)}
        />
      </Box>
    </DashboardLayout>
  )
}