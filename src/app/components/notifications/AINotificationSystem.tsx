'use client'

import {
  useToast,
  Box,
  HStack,
  VStack,
  Text,
  Button,
  IconButton,
  Badge,
  ToastId,
} from '@chakra-ui/react'
import { useRef, useEffect } from 'react'
import { FiCheck, FiX, FiInfo, FiCpu } from 'react-icons/fi'

interface AINotification {
  id: string
  type: 'suggestion' | 'action' | 'insight' | 'reminder'
  title: string
  message: string
  actionType?: 'task' | 'goal' | 'habit' | 'routine' | 'journal'
  actionData?: {
    task?: {
      title: string
      description?: string
      dueDate?: Date
      priority?: string
    }
    goal?: {
      title: string
      description?: string
      targetDate?: Date
    }
    habit?: {
      name: string
      frequency: string
      description?: string
    }
    routine?: {
      name: string
      steps: string[]
      description?: string
    }
    journal?: {
      content: string
      mood?: string
      tags?: string[]
    }
  }
  onApprove?: () => void
  onReject?: () => void
}

export function useAINotifications() {
  const toast = useToast()
  const toastIdRef = useRef<ToastId | null>(null)

  const showAISuggestion = (notification: AINotification) => {
    toastIdRef.current = toast({
      position: 'top-right',
      duration: null, // Keep it open until user action
      isClosable: true,
      render: ({ onClose }) => (
        <Box
          p={4}
          bg="white"
          boxShadow="lg"
          borderRadius="md"
          borderLeft="4px solid"
          borderColor="brand.500"
        >
          <VStack align="stretch" spacing={3}>
            <HStack>
              <IconButton
                icon={<FiCpu />}
                size="sm"
                colorScheme="brand"
                variant="ghost"
                aria-label="AI"
              />
              <VStack align="start" flex={1} spacing={0}>
                <HStack>
                  <Text fontWeight="bold">{notification.title}</Text>
                  <Badge colorScheme="purple" size="sm">AI</Badge>
                </HStack>
                <Text fontSize="sm" color="gray.600">
                  {notification.message}
                </Text>
              </VStack>
            </HStack>
            
            {notification.onApprove && (
              <HStack spacing={2}>
                <Button
                  size="sm"
                  colorScheme="green"
                  leftIcon={<FiCheck />}
                  onClick={() => {
                    notification.onApprove?.()
                    onClose()
                  }}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<FiX />}
                  onClick={() => {
                    notification.onReject?.()
                    onClose()
                  }}
                >
                  Dismiss
                </Button>
              </HStack>
            )}
          </VStack>
        </Box>
      ),
    })
  }

  const showAIAction = (message: string, status: 'success' | 'error' | 'info' = 'info') => {
    toast({
      title: 'AI Assistant',
      description: message,
      status,
      duration: 4000,
      isClosable: true,
      position: 'bottom-right',
      icon: <FiCpu />,
    })
  }

  const showAIInsight = (insight: string) => {
    toast({
      position: 'bottom',
      duration: 6000,
      render: () => (
        <Box
          p={4}
          bg="purple.50"
          borderRadius="md"
          borderWidth="1px"
          borderColor="purple.200"
        >
          <HStack>
            <IconButton
              icon={<FiInfo />}
              size="sm"
              colorScheme="purple"
              variant="ghost"
              aria-label="Insight"
            />
            <Text color="purple.800">{insight}</Text>
          </HStack>
        </Box>
      ),
    })
  }

  return {
    showAISuggestion,
    showAIAction,
    showAIInsight,
  }
}