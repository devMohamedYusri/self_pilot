'use client'

import { Box, Flex } from '@chakra-ui/react'
import { Sidebar } from './Sidebar'
import { useBreakpointValue } from '@chakra-ui/react'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useBreakpointValue({ base: true, md: false })

  return (
    <Flex h="100vh">
      <Sidebar />
      <Box
        flex={1}
        ml={isMobile ? 0 : '250px'}
        p={6}
        bg="gray.50"
        overflowY="auto"
      >
        {children}
      </Box>
    </Flex>
  )
}