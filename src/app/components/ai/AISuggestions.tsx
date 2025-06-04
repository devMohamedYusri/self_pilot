'use client'

import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  Card,
  CardBody,
  CardHeader,
  Heading,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { FiCheck, FiX, FiRefreshCw } from 'react-icons/fi'
import { useState, useEffect, useCallback } from 'react' // Fixed: Added useCallback import
import { Habit, Task, Goal } from '@/app/types'

// Fixed: Removed unused type definition
// type SuggestionData = Task | Goal | Habit

// Base suggestion interface
interface BaseSuggestion {
  id: string
  status: 'pending' | 'approved' | 'rejected'
}

// Discriminated union for type-safe suggestions
type Suggestion = 
  | (BaseSuggestion & { type: 'task'; data: Task })
  | (BaseSuggestion & { type: 'goal'; data: Goal })
  | (BaseSuggestion & { type: 'habit'; data: Habit })

export function AISuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const toast = useToast()
  
  // Fixed: Wrapped fetchSuggestions in useCallback to memoize it
  const fetchSuggestions = useCallback(async () => {
    try {
      const res = await fetch('/api/ai/suggestions')
      if (!res.ok) throw new Error('Failed to fetch suggestions')
      const data: Suggestion[] = await res.json()
      setSuggestions(data)
    } catch (error) { // Fixed: Now using the error variable
      console.error('Error fetching AI suggestions:', error) // Fixed: Added error logging
      toast({
        title: 'Error',
        description: 'Failed to fetch AI suggestions',
        status: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast]) // Fixed: Added toast as dependency

  // Fixed: Added fetchSuggestions to dependency array
  useEffect(() => {
    fetchSuggestions()
  }, [fetchSuggestions])

  const handleApprove = async (suggestion: Suggestion) => {
    try {
      const res = await fetch(`/api/ai/suggestions/${suggestion.id}/approve`, {
        method: 'POST',
      })

      if (res.ok) {
        toast({
          title: 'Approved',
          description: `${suggestion.type} has been approved and added`,
          status: 'success',
        })
        fetchSuggestions()
      } else {
        throw new Error('Failed to approve')
      }
    } catch (error) { // Fixed: Now using the error variable
      console.error('Error approving suggestion:', error) // Fixed: Added error logging
      toast({
        title: 'Error',
        description: 'Failed to approve suggestion',
        status: 'error',
      })
    }
  }

  const handleReject = async (suggestion: Suggestion) => {
    try {
      const res = await fetch(`/api/ai/suggestions/${suggestion.id}/reject`, {
        method: 'POST',
      })

      if (res.ok) {
        toast({
          title: 'Rejected',
          description: 'Suggestion has been rejected',
          status: 'info',
        })
        fetchSuggestions()
      } else {
        throw new Error('Failed to reject')
      }
    } catch (error) { // Fixed: Now using the error variable
      console.error('Error rejecting suggestion:', error) // Fixed: Added error logging
      toast({
        title: 'Error',
        description: 'Failed to reject suggestion',
        status: 'error',
      })
    }
  }

  const handleUndo = async (suggestion: Suggestion) => {
    try {
      const res = await fetch(`/api/ai/suggestions/${suggestion.id}/undo`, {
        method: 'POST',
      })

      if (res.ok) {
        toast({
          title: 'Undone',
          description: 'Action has been reversed',
          status: 'info',
        })
        fetchSuggestions()
      } else {
        throw new Error('Failed to undo')
      }
    } catch (error) { // Fixed: Now using the error variable
      console.error('Error undoing action:', error) // Fixed: Added error logging
      toast({
        title: 'Error',
        description: 'Failed to undo action',
        status: 'error',
      })
    }
  }

  const getSuggestionTitle = (suggestion: Suggestion): string => {
    return suggestion.data.title
  }

  const getSuggestionDescription = (suggestion: Suggestion): string => {
    switch (suggestion.type) {
      case 'task':
        return suggestion.data.description || 'No description'
      case 'goal':
        return suggestion.data.description || `Target: ${suggestion.data.targetDate || 'Not set'}`
      case 'habit':
        return `Frequency: ${suggestion.data.frequency}`
      default:
        // This should never happen due to exhaustive type checking
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _exhaustive: never = suggestion // Fixed: Added eslint comment for intentional unused variable
        return ''
    }
  }

  const getTypeColor = (type: Suggestion['type']): string => {
    switch (type) {
      case 'task': return 'blue'
      case 'goal': return 'green'
      case 'habit': return 'purple'
      default:
        // This should never happen due to exhaustive type checking
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _exhaustive: never = type // Fixed: Added eslint comment for intentional unused variable
        return 'gray'
    }
  }

  if (isLoading) {
    return (
      <Box p={4} textAlign="center">
        <Spinner />
      </Box>
    )
  }

  const pendingSuggestions = suggestions.filter((s): s is Suggestion => s.status === 'pending')
  const processedSuggestions = suggestions.filter((s): s is Suggestion => s.status !== 'pending')

  return (
    <VStack spacing={4} align="stretch">
      {pendingSuggestions.length === 0 && processedSuggestions.length === 0 ? (
        <Alert status="info">
          <AlertIcon />
          No AI suggestions at the moment. Chat with the AI assistant to get personalized suggestions!
        </Alert>
      ) : (
        <>
          {pendingSuggestions.length > 0 && (
            <Card>
              <CardHeader>
                <Heading size="md">Pending AI Suggestions</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  {pendingSuggestions.map((suggestion) => (
                    <Box
                      key={suggestion.id}
                      p={4}
                      borderWidth={1}
                      borderRadius="md"
                      borderColor="orange.300"
                      bg="orange.50"
                    >
                      <HStack justify="space-between" mb={2}>
                        <HStack>
                          <Badge colorScheme={getTypeColor(suggestion.type)}>
                            {suggestion.type}
                          </Badge>
                          <Text fontWeight="bold">{getSuggestionTitle(suggestion)}</Text>
                        </HStack>
                        <HStack>
                          <IconButton
                            aria-label="Approve"
                            icon={<FiCheck />}
                            size="sm"
                            colorScheme="green"
                            onClick={() => handleApprove(suggestion)}
                          />
                          <IconButton
                            aria-label="Reject"
                            icon={<FiX />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleReject(suggestion)}
                          />
                        </HStack>
                      </HStack>
                      <Text fontSize="sm" color="gray.600">
                        {getSuggestionDescription(suggestion)}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          )}

          {processedSuggestions.length > 0 && (
            <Card>
              <CardHeader>
                <Heading size="md">Recent Actions</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  {processedSuggestions.slice(0, 5).map((suggestion) => (
                    <Box
                      key={suggestion.id}
                      p={3}
                      borderWidth={1}
                      borderRadius="md"
                      opacity={0.7}
                    >
                      <HStack justify="space-between">
                        <HStack>
                          <Badge
                            colorScheme={suggestion.status === 'approved' ? 'green' : 'red'}
                          >
                            {suggestion.status}
                          </Badge>
                          <Text fontSize="sm">{getSuggestionTitle(suggestion)}</Text>
                        </HStack>
                        <IconButton
                          aria-label="Undo"
                          icon={<FiRefreshCw />}
                          size="xs"
                          variant="ghost"
                          onClick={() => handleUndo(suggestion)}
                        />
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          )}
        </>
      )}
    </VStack>
  )
}