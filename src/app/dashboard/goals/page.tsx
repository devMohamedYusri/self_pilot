'use client'

import { useState } from 'react'
import {
  Box,
  Heading,
  Button,
  HStack,
  Grid,
  useDisclosure,
} from '@chakra-ui/react'
import { FiPlus } from 'react-icons/fi'
import { DashboardLayout } from '@/app/components/layout/DashboardLayout'
import { GoalCard } from '@/app/components/goals/GoalCard'
import { GoalForm } from '@/app/components/goals/GoalForm'
import { useCrud } from '@/app/hooks/useCrud'
import type { Goal } from '@/app/types'
export default function GoalsPage() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  
  const {
    items: goals,
    // isLoading,
    createItem,
    updateItem,
    deleteItem,
  } = useCrud<Goal>({ endpoint: '/api/goals' })

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    onOpen()
  }

  const handleCloseForm = () => {
    setEditingGoal(null)
    onClose()
  }

  const handleSubmit = async (data: import('@/app/types').GoalFormData) => {
    if (editingGoal) {
      await updateItem(editingGoal.id, data as Partial<Goal>)
    } else {
      await createItem(data as Partial<Goal>)
    }
    handleCloseForm()
  }

  return (
    <DashboardLayout>
      <Box>
        <HStack justify="space-between" mb={6}>
          <Heading>Goals</Heading>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="brand"
            onClick={onOpen}
          >
            New Goal
          </Button>
        </HStack>

        <Grid templateColumns="repeat(auto-fill, minmax(350px, 1fr))" gap={4}>
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal as Goal}
              onEdit={handleEdit}
              onDelete={deleteItem}
              onUpdateProgress={(id, progress) => 
                updateItem(id, { progress })
              }
            />
          ))}
        </Grid>

        <GoalForm
          isOpen={isOpen}
          onClose={handleCloseForm}
          onSubmit={handleSubmit} 
          initialData={editingGoal as Goal | undefined}
        />
      </Box>
    </DashboardLayout>
  )
}