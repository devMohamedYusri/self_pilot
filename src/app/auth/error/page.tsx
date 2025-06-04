'use client'

import { useSearchParams } from 'next/navigation'
import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react'
import Link from 'next/link'
import { Suspense } from 'react'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'CredentialsSignin':
        return 'Invalid email or password. Please try again.'
      case 'Default':
        return 'An error occurred during authentication.'
      default:
        return 'An unknown error occurred.'
    }
  }

  return (
    <Box maxW="md" mx="auto" mt={8} p={6}>
      <VStack spacing={4} align="center" textAlign="center">
        <Heading color="red.500">Authentication Error</Heading>
        <Text>{getErrorMessage(error)}</Text>
        <Link href="/auth/signin">
          <Button colorScheme="brand">Try Again</Button>
        </Link>
      </VStack>
    </Box>
  )
}

export default function AuthError() {
  return (
    <Suspense fallback={<Box>Loading...</Box>}>
      <AuthErrorContent />
    </Suspense>
  )
}