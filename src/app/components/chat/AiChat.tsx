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
import type { ChatMessage, AIFunction } from '@/app/types/index'

interface AIChatProps {
  onClose?: () => void
}

export function AIChat({ onClose }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'system',
      content: "Hi! I&apos;m your AI assistant. I can help you manage tasks, set goals, track habits, and more. What would you like to do today?",
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Remove unused variables or use them
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const userBg = useColorModeValue('blue.100', 'blue.900')
  const aiBg = useColorModeValue('gray.100', 'gray.800')

  // Use onClose prop
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: ChatMessage = {
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

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()

      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.content || data.message,
        timestamp: new Date(),
        functions: data.functions,
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
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
    <Flex 
      direction="column" 
      h="600px" 
      bg={bgColor}
      borderRadius="20px" 
      overflow="hidden"
      boxShadow="0 20px 40px -12px rgba(0, 0, 0, 0.15)"
      border="1px solid"
      borderColor="gray.100"
      position="relative"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "4px",
        background: "linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
        borderTopRadius: "20px"
      }}
    >
      {/* Header */}
      <Box 
        p={5} 
        borderBottom="1px" 
        borderColor="gray.100"
        bg="linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)"
        backdropFilter="blur(10px)"
      >
        <HStack spacing={4}>
          <Box position="relative">
            <Avatar 
              icon={<FiCpu />} 
              bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
              size="md"
              boxShadow="0 4px 12px rgba(102, 126, 234, 0.3)"
            />
            <Box
              position="absolute"
              bottom="-2px"
              right="-2px"
              w="12px"
              h="12px"
              bg="green.400"
              borderRadius="full"
              border="2px solid white"
              animation="pulse 2s infinite"
            />
          </Box>
          <VStack align="start" spacing={0}>
            <Text fontWeight="700" fontSize="lg" color="gray.800">
              AI Assistant
            </Text>
            <Text fontSize="xs" color="gray.500">
              Always ready to help
            </Text>
          </VStack>
          <Badge 
            colorScheme="green" 
            ml="auto"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="xs"
            fontWeight="600"
            bg="green.50"
            color="green.600"
            border="1px solid"
            borderColor="green.200"
          >
            🟢 Online
          </Badge>
        </HStack>
      </Box>

      <VStack 
        flex={1} 
        p={5} 
        overflowY="auto" 
        spacing={4} 
        align="stretch"
        bg="linear-gradient(180deg, rgba(247, 250, 252, 0.3) 0%, rgba(255, 255, 255, 0.8) 100%)"
        sx={{
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0, 0, 0, 0.1)',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(0, 0, 0, 0.2)',
          },
        }}
      >
        {messages.map((message) => (
          <HStack
            key={message.id}
            align="start"
            alignSelf={message.role === 'user' ? 'flex-end' : 'flex-start'}
            maxW="85%"
            spacing={3}
          >
            {message.role !== 'user' && (
              <Avatar
                icon={<FiCpu />}
                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                size="sm"
                boxShadow="0 2px 8px rgba(102, 126, 234, 0.2)"
              />
            )}
            <Box
              p={4}
              borderRadius={message.role === 'user' ? "20px 20px 6px 20px" : "20px 20px 20px 6px"}
              bg={
                message.role === 'user' 
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : aiBg
              }
              color={message.role === 'user' ? "white" : "gray.800"}
              boxShadow={
                message.role === 'user' 
                  ? "0 8px 25px -8px rgba(102, 126, 234, 0.4)"
                  : "0 4px 15px rgba(0, 0, 0, 0.08)"
              }
              border={message.role !== 'user' ? "1px solid" : "none"}
              borderColor="gray.100"
              position="relative"
              _before={message.role === 'user' ? {} : {
                content: '""',
                position: "absolute",
                left: "-8px",
                top: "16px",
                width: 0,
                height: 0,
                borderTop: "8px solid transparent",
                borderBottom: "8px solid transparent",
                borderRight: `8px solid ${aiBg}`,
              }}
              _after={message.role === 'user' ? {
                content: '""',
                position: "absolute",
                right: "-8px",
                top: "16px",
                width: 0,
                height: 0,
                borderTop: "8px solid transparent",
                borderBottom: "8px solid transparent",
                borderLeft: "8px solid #667eea",
              } : {}}
            >
              <Text fontSize="sm" lineHeight="1.6">
                {message.content}
              </Text>
              {message.functions && message.functions.length > 0 && (
                <Box mt={3}>
                  <Text 
                    fontSize="xs" 
                    color={message.role === 'user' ? "whiteAlpha.800" : "gray.500"} 
                    mb={2}
                    fontWeight="500"
                  >
                    🔧 Suggested actions:
                  </Text>
                  <HStack spacing={2} flexWrap="wrap">
                    {message.functions.map((func: AIFunction, idx: number) => (
                      <Badge 
                        key={idx} 
                        px={2}
                        py={1}
                        borderRadius="full"
                        fontSize="xs"
                        bg="orange.50"
                        color="orange.600"
                        border="1px solid"
                        borderColor="orange.200"
                        fontWeight="500"
                        >
                          ⚡ {func.name}
                        </Badge>
                      ))}
                    </HStack>
                  </Box>
                )}
              </Box>
              {message.role === 'user' && (
                <Avatar 
                  icon={<FiUser />} 
                  bg={userBg}
                  size="sm"
                  boxShadow="0 2px 8px rgba(107, 114, 128, 0.2)"
                />
              )}
            </HStack>
          ))}
          {isLoading && (
            <HStack spacing={3}>
              <Avatar 
                icon={<FiCpu />} 
                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
                size="sm"
                boxShadow="0 2px 8px rgba(102, 126, 234, 0.2)"
              />
              <Box 
                p={4} 
                borderRadius="20px 20px 20px 6px" 
                bg={aiBg}
                boxShadow="0 4px 15px rgba(0, 0, 0, 0.08)"
                border="1px solid"
                borderColor="gray.100"
                position="relative"
                _before={{
                  content: '""',
                  position: "absolute",
                  left: "-8px",
                  top: "16px",
                  width: 0,
                  height: 0,
                  borderTop: "8px solid transparent",
                  borderBottom: "8px solid transparent",
                  borderRight: `8px solid ${aiBg}`,
                }}
              >
                <HStack spacing={2}>
                  <Spinner size="sm" color="blue.500" thickness="2px" />
                  <Text fontSize="sm" color="gray.600">
                    AI is thinking...
                  </Text>
                </HStack>
              </Box>
            </HStack>
          )}
          <div ref={messagesEndRef} />
        </VStack>
  
        {/* Input Area */}
        <Box
          p={5}
          borderTop="1px"
          borderColor="gray.100"
          bg={bgColor}
          borderBottomRadius="20px"
        >
          <HStack spacing={3}>
            <Box flex={1} position="relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="✨ Type your message..."
                disabled={isLoading}
                border="2px solid"
                borderColor="gray.200"
                borderRadius="15px"
                bg="gray.50"
                fontSize="sm"
                py={3}
                px={4}
                pr={12}
                _hover={{
                  borderColor: "blue.300",
                  bg: "white"
                }}
                _focus={{
                  borderColor: "blue.500",
                  bg: "white",
                  boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)"
                }}
                _disabled={{
                  opacity: 0.6,
                  cursor: "not-allowed"
                }}
                color="#222"
              />
              {input && (
                <Box
                  position="absolute"
                  right="12px"
                  top="50%"
                  transform="translateY(-50%)"
                  fontSize="xs"
                  color="gray.400"
                >
                  Press Enter
                </Box>
              )}
            </Box>
            <IconButton
              aria-label="Send message"
              icon={<FiSend />}
              onClick={handleSend}
              isLoading={isLoading}
              bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              color="white"
              borderRadius="12px"
              size="lg"
              _hover={{
                bg: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 25px -8px rgba(102, 126, 234, 0.6)"
              }}
              _active={{
                transform: "translateY(-1px)"
              }}
              transition="all 0.2s"
              _disabled={{
                opacity: 0.6,
                cursor: "not-allowed",
                transform: "none"
              }}
            />
          </HStack>
        </Box>
      </Flex>
    )
  }