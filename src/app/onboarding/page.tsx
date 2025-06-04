'use client'

import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react'
import { OnboardingChat } from '@/app/components/onboarding/OnboardingChat'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function OnboardingPage() {
  // const { data: session, status } = useSession()
  const {status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8}>
          <Box textAlign="center">
            <Heading size="xl" color="brand.600">
              Welcome to LifePilot
            </Heading>
            <Text mt={2} color="gray.600">
            Let&apos;s personalize your experience       
           </Text>
          </Box>
          
          <Box
            bg="white"
            borderRadius="lg"
            boxShadow="lg"
            width="full"
            maxW="800px"
            height="70vh"
          >
            <OnboardingChat />
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}