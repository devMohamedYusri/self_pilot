'use client'

import {
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  VStack,
  HStack,
  Box,
  Spinner,
  Text,
  Center,
} from '@chakra-ui/react'

export function TaskSkeleton() {
  return (
    <Box p={4} bg="white" borderRadius="md" boxShadow="sm">
      <HStack spacing={3}>
        <SkeletonCircle size="8" />
        <VStack flex={1} align="stretch" spacing={2}>
          <Skeleton height="20px" width="60%" />
          <SkeletonText noOfLines={2} spacing={2} />
        </VStack>
      </HStack>
    </Box>
  )
}

export function ChatMessageSkeleton() {
  return (
    <HStack align="start" spacing={3}>
      <SkeletonCircle size="10" />
      <Box flex={1}>
        <Skeleton height="60px" borderRadius="lg" />
      </Box>
    </HStack>
  )
}

export function CardSkeleton() {
  return (
    <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
      <VStack align="stretch" spacing={4}>
        <Skeleton height="24px" width="40%" />
        <SkeletonText noOfLines={3} spacing={3} />
        <HStack justify="flex-end" spacing={2}>
          <Skeleton height="32px" width="80px" />
          <Skeleton height="32px" width="80px" />
        </HStack>
      </VStack>
    </Box>
  )
}

export function FullPageLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <Center h="100vh">
      <VStack spacing={4}>
        <Spinner size="xl" color="brand.500" thickness="4px" />
        <Text color="gray.600">{message}</Text>
      </VStack>
    </Center>
  )
}

export function AIThinkingLoader() {
  return (
    <HStack spacing={2} p={3} bg="purple.50" borderRadius="md">
      <Spinner size="sm" color="purple.500" />
      <Text fontSize="sm" color="purple.700">AI is thinking...</Text>
    </HStack>
  )
}