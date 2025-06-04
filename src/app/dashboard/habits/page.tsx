'use client'

import { useState } from 'react'
import {
  Box,
  Heading,
  Button,
  HStack,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { FiPlus } from 'react-icons/fi'
import { DashboardLayout } from '@/app/components/layout/DashboardLayout'
import { HabitTracker } from '@/app/components/habits/HabitTracker'
import { HabitForm } from '@/app/components/habits/HabitForm'
import { useCrud } from '@/app/hooks/useCrud'
import { HabitFormData } from '@/app/types'

interface Habit {
  id: string
  title: string
  description?: string
  frequency: string
  streak: number
  active: boolean
  aiSuggested: boolean
  aiApproved?: boolean
}

export default function HabitsPage() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const toast = useToast()
  
  const {
    items: habits,
    // isLoading,
    createItem,
    updateItem,
    deleteItem,
  } = useCrud<Habit>({ endpoint: '/api/habits' })

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit)
    onOpen()
  }

  const handleCloseForm = () => {
    setEditingHabit(null)
    onClose()
  }

  const handleSubmit = async (data: HabitFormData) => {
    if (editingHabit) {
      await updateItem(editingHabit.id, data as Partial<Habit>)
    } else {
      await createItem(data)
    }
    handleCloseForm()
  }

  const handleComplete = async (id: string) => {
    const habit = habits.find(h => h.id === id)
    if (habit) {
      await updateItem(id, { streak: habit.streak + 1 })
      toast({
        title: 'Great job!',
        description: `${habit.title} completed. Streak: ${habit.streak + 1} days!`,
        status: 'success',
        duration: 3000,
      })
    }
  }

  return (
    <DashboardLayout>
      <Box>
        <HStack justify="space-between" mb={6}>
          <Heading>Habits</Heading>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="brand"
            onClick={onOpen}
          >
            New Habit
          </Button>
        </HStack>

        <HabitTracker
          habits={habits}
          onEdit={handleEdit}
          onDelete={deleteItem}
          onComplete={handleComplete}
        />

        <HabitForm
          isOpen={isOpen}
          onClose={handleCloseForm}
          onSubmit={handleSubmit}
          initialData={editingHabit as import('@/app/types').Habit | undefined}
        />
      </Box>
    </DashboardLayout>
  )
}