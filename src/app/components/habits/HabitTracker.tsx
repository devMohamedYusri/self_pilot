'use client'

import {
  Box,
  Grid,
  GridItem,
  Text,
  HStack,
  VStack,
  IconButton,
  Badge,
  Button,
} from '@chakra-ui/react'
import { FiCheck, FiEdit2, FiTrash2 } from 'react-icons/fi'

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

interface HabitTrackerProps {
  habits: Habit[]
  onEdit: (habit: Habit) => void
  onDelete: (id: string) => void
  onComplete: (id: string) => void
}

export function HabitTracker({ habits, onEdit, onDelete, onComplete }: HabitTrackerProps) {
  return (
    <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={4}>
      {habits.map((habit) => (
        <GridItem key={habit.id}>
          <Box
            p={4}
            bg="white"
            borderRadius="md"
            borderWidth={1}
            borderColor={habit.aiSuggested && !habit.aiApproved ? 'orange.300' : 'gray.200'}
          >
            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between">
                <VStack align="start" flex={1}>
                  <HStack>
                    <Text fontWeight="bold">{habit.title}</Text>
                    {habit.aiSuggested && !habit.aiApproved && (
                      <Badge colorScheme="orange" size="sm">AI Suggested</Badge>
                    )}
                  </HStack>
                  {habit.description && (
                    <Text fontSize="sm" color="gray.600">{habit.description}</Text>
                  )}
                </VStack>
                <HStack>
                  <IconButton
                    aria-label="Edit habit"
                    icon={<FiEdit2 />}
                    size="sm"
                    onClick={() => onEdit(habit)}
                  />
                  <IconButton
                    aria-label="Delete habit"
                    icon={<FiTrash2 />}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => onDelete(habit.id)}
                  />
                </HStack>
              </HStack>

              <HStack justify="space-between">
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color="gray.500">Frequency</Text>
                  <Badge colorScheme="blue">{habit.frequency}</Badge>
                </VStack>
                <VStack align="end" spacing={0}>
                  <Text fontSize="xs" color="gray.500">Streak</Text>
                  <Text fontWeight="bold" color="orange.500">
                    {habit.streak} days
                  </Text>
                </VStack>
              </HStack>

              <Button
                leftIcon={<FiCheck />}
                colorScheme="green"
                size="sm"
                onClick={() => onComplete(habit.id)}
              >
                Mark Complete
              </Button>
            </VStack>
          </Box>
        </GridItem>
      ))}
    </Grid>
  )
}