'use client'

import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Avatar,
  Progress,
  useToast,
  Flex,
  IconButton,
} from '@chakra-ui/react'
import { useState, useRef, useEffect } from 'react'
import { FiSend, FiCpu } from 'react-icons/fi'
import { useRouter } from 'next/navigation'

interface OnboardingStep {
  id: string
  question: string
  type: 'text' | 'choice' | 'multiChoice'
  options?: string[]
  key: string
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: '1',
    question: "Hi! I'm your AI assistant. What should I call you?",
    type: 'text',
    key: 'name'
  },
  {
    id: '2',
    question: "Great to meet you! What are your main goals for using LifePilot?",
    type: 'multiChoice',
    options: ['Productivity', 'Health & Fitness', 'Personal Growth', 'Work-Life Balance', 'Learning', 'Creativity'],
    key: 'goals'
  },
  {
    id: '3',
    question: "What's your biggest challenge right now?",
    type: 'text',
    key: 'challenge'
  },
  {
    id: '4',
    question: "When are you most productive during the day?",
    type: 'choice',
    options: ['Early Morning (5-8 AM)', 'Morning (8-12 PM)', 'Afternoon (12-5 PM)', 'Evening (5-9 PM)', 'Night (9 PM-12 AM)'],
    key: 'productiveTime'
  },
  {
    id: '5',
    question: "How would you like me to help you? I can be more hands-on or just provide gentle guidance.",
    type: 'choice',
    options: ['Be proactive - suggest and create tasks for me', 'Guide me - make suggestions but let me decide', 'Minimal - only help when I ask'],
    key: 'aiMode'
  }
]

export function OnboardingChat() {
  const [currentStep, setCurrentStep] = useState(0)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [messages, setMessages] = useState<Array<{role: 'ai' | 'user', content: string}>>([])
  const [input, setInput] = useState('')
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const toast = useToast()

  useEffect(() => {
    // Start with first question
    setMessages([{
      role: 'ai',
      content: onboardingSteps[0].question
    }])
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleResponse = async () => {
    const step = onboardingSteps[currentStep]
    let response: any = input

    if (step.type === 'choice') {
      response = selectedOptions[0]
    } else if (step.type === 'multiChoice') {
      response = selectedOptions
    }

    if (!response || (Array.isArray(response) && response.length === 0)) {
      toast({
        title: 'Please provide an answer',
        status: 'warning',
        duration: 2000,
      })
      return
    }

    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      content: Array.isArray(response) ? response.join(', ') : response
    }])

    // Save response
    setResponses(prev => ({ ...prev, [step.key]: response }))

    // Clear input
    setInput('')
    setSelectedOptions([])

    // Move to next step or complete
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(prev => prev + 1)
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'ai',
          content: onboardingSteps[currentStep + 1].question
        }])
      }, 500)
    } else {
      await completeOnboarding()
    }
  }

  const completeOnboarding = async () => {
    setIsProcessing(true)
    setMessages(prev => [...prev, {
      role: 'ai',
      content: "Perfect! I'm setting up your personalized workspace..."
    }])

    try {
      // Send onboarding data to API
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responses)
      })

      if (res.ok) {
        const data = await res.json()
        
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'ai',
            content: `All set! I've created ${data.tasksCreated} initial tasks and ${data.goalsCreated} goals based on your responses. Let's get started!`
          }])
        }, 1000)

        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete onboarding',
        status: 'error',
      })
    } finally {
      setIsProcessing(false)
    }
  }
  const handleOptionToggle = (option: string) => {
    const step = onboardingSteps[currentStep]
    if (step.type === 'choice') {
      setSelectedOptions([option])
    } else if (step.type === 'multiChoice') {
      setSelectedOptions(prev => 
        prev.includes(option) 
          ? prev.filter(o => o !== option)
          : [...prev, option]
      )
    }
  }

  const currentStepData = onboardingSteps[currentStep]
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100

  return (
    <Box maxW="800px" mx="auto" h="100vh" display="flex" flexDirection="column">
      <Box p={4}>
        <Progress value={progress} colorScheme="brand" borderRadius="full" />
        <Text fontSize="sm" color="gray.600" mt={2} textAlign="center">
          Step {currentStep + 1} of {onboardingSteps.length}
        </Text>
      </Box>

      <VStack flex={1} p={4} overflowY="auto" spacing={4} align="stretch">
        {messages.map((message, idx) => (
          <HStack
            key={idx}
            align="start"
            alignSelf={message.role === 'user' ? 'flex-end' : 'flex-start'}
            maxW="70%"
          >
            {message.role === 'ai' && (
              <Avatar icon={<FiCpu />} bg="brand.500" size="sm" />
            )}
            <Box
              p={3}
              borderRadius="lg"
              bg={message.role === 'user' ? 'blue.100' : 'gray.100'}
            >
                            <Text>{message.content}</Text>
            </Box>
          </HStack>
        ))}
        
        {isProcessing && (
          <HStack>
            <Avatar icon={<FiCpu />} bg="brand.500" size="sm" />
            <Box p={3} borderRadius="lg" bg="gray.100">
              <Text>Processing...</Text>
            </Box>
          </HStack>
        )}
        
        <div ref={messagesEndRef} />
      </VStack>

      <Box p={4} borderTop="1px" borderColor="gray.200">
        {currentStepData && (currentStepData.type === 'choice' || currentStepData.type === 'multiChoice') ? (
          <VStack spacing={2}>
            {currentStepData.options?.map((option) => (
              <Button
                key={option}
                onClick={() => handleOptionToggle(option)}
                variant={selectedOptions.includes(option) ? 'solid' : 'outline'}
                colorScheme="brand"
                width="full"
                justifyContent="start"
              >
                {option}
              </Button>
            ))}
            <Button
              onClick={handleResponse}
              colorScheme="brand"
              width="full"
              isDisabled={selectedOptions.length === 0}
            >
              Continue
            </Button>
          </VStack>
        ) : (
          <HStack>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleResponse()}
              placeholder="Type your answer..."
              isDisabled={isProcessing}
            />
            <IconButton
              aria-label="Send"
              icon={<FiSend />}
              onClick={handleResponse}
              colorScheme="brand"
              isDisabled={!input.trim() || isProcessing}
            />
          </HStack>
        )}
      </Box>
    </Box>
  )
}