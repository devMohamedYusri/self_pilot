'use client'

import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
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
import { useState, useEffect } from 'react'

interface Suggestion {
  id: string
  type: 'task' | 'goal' | 'habit' | 'routine'
  data: any
  status: 'pending' | 'approved' | 'rejected'
}

export function AISuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const toast = useToast()
  useEffect(() => {
    fetchSuggestions()
  }, [])

  const fetchSuggestions = async () => {
    try {
      const res = await fetch('/api/ai/suggestions')
      const data = await res.json()
      setSuggestions(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch AI suggestions',
        status: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

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
      }
    } catch (error) {
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
      }
    } catch (error) {
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
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to undo action',
        status: 'error',
      })
    }
  }

  const getSuggestionTitle = (suggestion: Suggestion) => {
    switch (suggestion.type) {
      case 'task':
        return suggestion.data.title
      case 'goal':
        return suggestion.data.title
      case 'habit':
        return suggestion.data.title
      case 'routine':
        return suggestion.data.title
      default:
        return 'Unknown'
    }
  }

  const getSuggestionDescription = (suggestion: Suggestion) => {
    switch (suggestion.type) {
      case 'task':
        return suggestion.data.description || 'No description'
      case 'goal':
        return suggestion.data.description || `Target: ${suggestion.data.targetDate || 'Not set'}`
      case 'habit':
        return `Frequency: ${suggestion.data.frequency}`
      case 'routine':
        return `Time: ${suggestion.data.timeOfDay}, ${suggestion.data.steps?.length || 0} steps`
      default:
        return ''
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'task': return 'blue'
      case 'goal': return 'green'
      case 'habit': return 'purple'
      case 'routine': return 'orange'
      default: return 'gray'
    }
  }

  if (isLoading) {
    return (
      <Box p={4} textAlign="center">
        <Spinner />
      </Box>
    )
  }

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending')
  const processedSuggestions = suggestions.filter(s => s.status !== 'pending')

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