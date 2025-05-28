'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Spinner,
  Center,
} from '@chakra-ui/react'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="brand.500" />
      </Center>
    )
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="container.xl" pt={20}>
        <VStack spacing={8} align="center" textAlign="center">
          <Heading
            fontSize={{ base: '4xl', md: '6xl' }}
            fontWeight="bold"
            color="brand.600"
          >
            LifePilot
          </Heading>
          
          <Text
            fontSize={{ base: 'lg', md: 'xl' }}
            color="gray.600"
            maxW="600px"
          >
            Your AI-powered personal assistant for managing tasks, goals, habits, 
            and routines. Take control of your life with intelligent suggestions 
            and seamless organization.
          </Text>

          <HStack spacing={4} pt={4}>
            <Link href="/auth/signin">
              <Button size="lg" colorScheme="brand">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline" colorScheme="brand">
                Sign Up
              </Button>
            </Link>
          </HStack>

          <Box pt={12}>
            <VStack spacing={4} align="start">
              <Text fontWeight="bold" fontSize="lg" color="gray.700">
                Features:
              </Text>
              <VStack align="start" spacing={2} color="gray.600">
                <Text>✓ AI-powered task and goal suggestions</Text>
                <Text>✓ Smart habit tracking with streaks</Text>
                <Text>✓ Customizable daily routines</Text>
                <Text>✓ Personal journal with mood tracking</Text>
                <Text>✓ Real-time sync across devices</Text>
              </VStack>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}