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

interface Task {
  id: string
  title: string
  description?: string
  status: string
  dueDate?: string
  completed: boolean
  aiSuggested: boolean
}

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
      const data = await res.json()
      setTasks(data)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (data: any) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
        await fetchTasks()
      }
    }
  
    const handleUpdate = async (id: string, data: any) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        await fetchTasks()
      }
    }
  
    const handleDelete = async (id: string) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        await fetchTasks()
      }
    }
  
    const handleEdit = (task: any) => {
      setEditingTask(task)
      onOpen()
    }
  
    const handleCloseForm = () => {
      setEditingTask(null)
      onClose()
    }
  
    const handleSubmit = async (data: any) => {
      if (editingTask) {
        await handleUpdate(editingTask.id, data)
      } else {
        await handleCreate(data)
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
            tasks={tasks}
            isLoading={isLoading}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
  
          <TaskForm
            isOpen={isOpen}
            onClose={handleCloseForm}
            onSubmit={handleSubmit}
            initialData={editingTask}
          />
        </Box>
      </DashboardLayout>
    )
  }