'use client'

import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  IconButton,
  Avatar,
  Flex,
  useColorModeValue,
  Spinner,
  Badge,
} from '@chakra-ui/react'
import { FiSend, FiUser, FiCpu } from 'react-icons/fi'
import { useState, useRef, useEffect } from 'react'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  functions?: any[]
  status?: 'pending' | 'approved' | 'rejected'
}

interface AIChatProps {
  onClose?: () => void
}

export function AIChat({ onClose }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'system',
      content: "Hi! I'm your AI assistant. I can help you manage tasks, set goals, track habits, and more. What would you like to do today?",
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const userBg = useColorModeValue('blue.100', 'blue.900')
  const aiBg = useColorModeValue('gray.100', 'gray.800')

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          message: input,
        }),
      })

      const data = await response.json()

      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.content || data.message,
        timestamp: new Date(),
        functions: data.functions,
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Flex direction="column" h="600px" bg={bgColor} borderRadius="lg" overflow="hidden">
      <Box p={4} borderBottom="1px" borderColor="gray.200">
        <HStack>
          <Avatar icon={<FiCpu />} bg="brand.500" size="sm" />
          <Text fontWeight="bold">AI Assistant</Text>
          <Badge colorScheme="green" ml="auto">Online</Badge>
        </HStack>
      </Box>

      <VStack flex={1} p={4} overflowY="auto" spacing={4} align="stretch">
        {messages.map((message) => (
          <HStack
            key={message.id}
            align="start"
            alignSelf={message.role === 'user' ? 'flex-end' : 'flex-start'}
            maxW="80%"
          >
            {message.role !== 'user' && (
              <Avatar
                icon={message.role === 'system' ? <FiCpu /> : <FiCpu />}
                bg="brand.500"
                size="sm"
              />
            )}
            <Box
              p={3}
              borderRadius="lg"
              bg={message.role === 'user' ? userBg : aiBg}
            >
              <Text>{message.content}</Text>
              {message.functions && message.functions.length > 0 && (
                <Box mt={2}>
                  <Text fontSize="xs" color="gray.500" mb={1}>
                    Suggested actions:
                  </Text>
                  {message.functions.map((func, idx) => (
                    <Badge key={idx} mr={1} colorScheme="orange">
                      {func.name}
                    </Badge>
                  ))}
                </Box>
              )}
            </Box>
            {message.role === 'user' && (
              <Avatar icon={<FiUser />} bg="gray.500" size="sm" />
            )}
          </HStack>
        ))}
        {isLoading && (
          <HStack>
            <Avatar icon={<FiCpu />} bg="brand.500" size="sm" />
            <Box p={3} borderRadius="lg" bg={aiBg}>
              <Spinner size="sm" />
            </Box>
          </HStack>
        )}
        <div ref={messagesEndRef} />
      </VStack>

      <HStack p={4} borderTop="1px" borderColor="gray.200">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <IconButton
          aria-label="Send message"
          icon={<FiSend />}
          onClick={handleSend}
          isLoading={isLoading}
          colorScheme="brand"
        />
      </HStack>
    </Flex>
  )
}