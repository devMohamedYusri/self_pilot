'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
  Alert,
  AlertIcon,
  Link as ChakraLink,
  Text,
} from '@chakra-ui/react'
import Link from 'next/link'

export default function SignIn() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const error = searchParams.get('error')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })
      
      if (result?.error) {
        toast({
          title: 'Error',
          description: 'Invalid email or password',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) { // Fixed: Now using the error variable
      console.error('Login error:', error) // Fixed: Added error logging
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box maxW="md" mx="auto" mt={8} p={6}>
      <VStack spacing={6}>
        <Heading>Sign In</Heading>
        
        {error && (
          <Alert status="error">
            <AlertIcon />
            Authentication failed. Please check your credentials.
          </Alert>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input 
                name="email" 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input 
                name="password" 
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
              />
            </FormControl>
            <Button
              type="submit"
              colorScheme="brand"
              width="full"
              isLoading={isLoading}
              loadingText="Signing in..."
            >
              Sign In
            </Button>
          </VStack>
        </form>

        <Text>
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup">
            <ChakraLink color="brand.500">Sign up</ChakraLink>
          </Link>
        </Text>
      </VStack>
    </Box>
  )
}