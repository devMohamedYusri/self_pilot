'use client'

import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Checkbox,
  Badge,
  Spinner,
  useToast,
} from '@chakra-ui/react'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import { format } from 'date-fns'
import type { Task } from '@/app/types'

interface TaskListProps {
  tasks: Task[]
  isLoading: boolean
  onUpdate: (id: string, data: Partial<Task>) => void
  onDelete: (id: string) => void
  onEdit: (task: Task) => void
}

export function TaskList({ 
  tasks, 
  isLoading, 
  onUpdate, 
  onDelete, 
  onEdit 
}: TaskListProps) {
  const toast = useToast()

  const handleToggle = async (task: Task) => {
    await onUpdate(task.id, { completed: !task.completed })
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await onDelete(id)
      toast({
        title: 'Task deleted',
        status: 'success',
        duration: 3000,
      })
    }
  }

  if (isLoading) {
    return <Spinner />
  }

  return (
    <VStack align="stretch" spacing={3}>
      {tasks.map((task) => (
        <Box
          key={task.id}
          p={4}
          bg="white"
          borderRadius="md"
          boxShadow="sm"
          borderWidth={1}
          borderColor={task.aiSuggested && !task.aiApproved ? 'orange.300' : 'gray.200'}
        >
          <HStack justify="space-between">
            <HStack flex={1}>
              <Checkbox
                isChecked={task.completed}
                onChange={() => handleToggle(task)}
              />
              <Box flex={1}>
                <HStack>
                  <Text
                    textDecoration={task.completed ? 'line-through' : 'none'}
                    color={task.completed ? 'gray.500' : 'gray.800'}
                  >
                    {task.title}
                  </Text>
                  {task.aiSuggested && !task.aiApproved && (
                    <Badge colorScheme="orange" size="sm">AI Suggested</Badge>
                  )}
                </HStack>
                {task.description && (
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    {task.description}
                  </Text>
                )}
                <HStack mt={2} spacing={4}>
                  {task.dueDate && (
                    <Text fontSize="xs" color="gray.500">
                      Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                    </Text>
                  )}
                  {task.priority && (
                    <Badge
                      colorScheme={
                        task.priority === 'high' ? 'red' :
                        task.priority === 'medium' ? 'yellow' : 'green'
                      }
                      size="sm"
                    >
                      {task.priority}
                    </Badge>
                  )}
                </HStack>
              </Box>
            </HStack>
            <HStack>
              <IconButton
                aria-label="Edit task"
                icon={<FiEdit2 />}
                size="sm"
                onClick={() => onEdit(task)}
              />
              <IconButton
                aria-label="Delete task"
                icon={<FiTrash2 />}
                size="sm"
                colorScheme="red"
                variant="ghost"
                onClick={() => handleDelete(task.id)}
              />
            </HStack>
          </HStack>
        </Box>
      ))}
    </VStack>
  )
}