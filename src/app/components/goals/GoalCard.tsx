'use client'

import {
  Box,
  Card,
  CardBody,
  Progress,
  Text,
  HStack,
  VStack,
  IconButton,
  Badge,
} from '@chakra-ui/react'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import { format } from 'date-fns'
import type { Goal } from '@/app/types'
interface GoalCardProps {
  goal: Goal
  onEdit: (goal: Goal) => void
  onDelete: (id: string) => void
  onUpdateProgress: (id: string, progress: number) => void
}

// export function GoalCard({ goal, onEdit, onDelete, onUpdateProgress }: GoalCardProps) {
export function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  return (
    <Card>
      <CardBody>
        <VStack align="stretch" spacing={3}>
          <HStack justify="space-between">
            <VStack align="start" flex={1}>
              <HStack>
                <Text fontWeight="bold" fontSize="lg">{goal.title}</Text>
                {goal.aiSuggested && !goal.aiApproved && (
                  <Badge colorScheme="orange" size="sm">AI Suggested</Badge>
                )}
              </HStack>
              {goal.description && (
                <Text fontSize="sm" color="gray.600">{goal.description}</Text>
              )}
            </VStack>
            <HStack>
              <IconButton
                aria-label="Edit goal"
                icon={<FiEdit2 />}
                size="sm"
                onClick={() => onEdit(goal)}
              />
              <IconButton
                aria-label="Delete goal"
                icon={<FiTrash2 />}
                size="sm"
                colorScheme="red"
                variant="ghost"
                onClick={() => onDelete(goal.id)}
              />
            </HStack>
          </HStack>

          <Box>
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" color="gray.600">Progress</Text>
              <Text fontSize="sm" fontWeight="bold">{goal.progress}%</Text>
            </HStack>
            <Progress
              value={goal.progress}
              colorScheme={goal.completed ? 'green' : 'brand'}
              size="sm"
              borderRadius="full"
            />
          </Box>

          {goal.targetDate && (
            <Text fontSize="xs" color="gray.500">
              Target: {format(new Date(goal.targetDate), 'MMM d, yyyy')}
            </Text>
          )}
        </VStack>
      </CardBody>
    </Card>
  )
}