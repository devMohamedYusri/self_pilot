'use client'

import { Box, Heading } from '@chakra-ui/react'
import { DashboardLayout } from '@/app/components/layout/DashboardLayout'
import { AIChat } from '@/app/components/chat/AiChat'

export default function ChatPage() {
  return (
    <DashboardLayout>
      <Box maxW="800px" mx="auto">
        <Heading mb={6}>AI Assistant</Heading>
        <AIChat />
      </Box>
    </DashboardLayout>
  )
}