'use client'

import {
  Box,
  VStack,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  useDisclosure,
  useBreakpointValue,
  Flex,
  Text,
  Icon,
} from '@chakra-ui/react'
import { 
  FiMenu, 
  FiHome, 
  FiCheckSquare, 
  FiTarget, 
  FiRepeat,
  FiBook,
  FiMessageSquare,
  FiSettings,
  FiClock
} from 'react-icons/fi'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { name: 'Dashboard', icon: FiHome, href: '/dashboard' },
  { name: 'Tasks', icon: FiCheckSquare, href: '/dashboard/tasks' },
  { name: 'Goals', icon: FiTarget, href: '/dashboard/goals' },
  { name: 'Habits', icon: FiRepeat, href: '/dashboard/habits' },
  { name: 'Routines', icon: FiClock, href: '/dashboard/routines' },
  { name: 'Journal', icon: FiBook, href: '/dashboard/journal' },
  { name: 'AI Assistant', icon: FiMessageSquare, href: '/dashboard/chat' },
  { name: 'Settings', icon: FiSettings, href: '/dashboard/settings' },
]

export function Sidebar() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const pathname = usePathname()

  const SidebarContent = () => (
    <VStack spacing={1} align="stretch" w="full">
      <Box p={4}>
        <Text fontSize="2xl" fontWeight="bold" color="brand.600">
          LifePilot
        </Text>
      </Box>
      {navItems.map((item) => (
        <Link key={item.name} href={item.href}>
          <Flex
            align="center"
            p={3}
            mx={2}
            borderRadius="md"
            cursor="pointer"
            bg={pathname === item.href ? 'brand.50' : 'transparent'}
            color={pathname === item.href ? 'brand.600' : 'gray.600'}
            _hover={{ bg: 'gray.100' }}
            onClick={onClose}
          >
            <Icon as={item.icon} mr={3} />
            <Text>{item.name}</Text>
          </Flex>
        </Link>
      ))}
    </VStack>
  )

  if (isMobile) {
    return (
      <>
        <IconButton
          aria-label="Open menu"
          icon={<FiMenu />}
          onClick={onOpen}
          position="fixed"
          top={4}
          left={4}
          zIndex={20}
        />
        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerBody p={0}>
              <SidebarContent />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </>
    )
  }

  return (
    <Box
      w="250px"
      bg="white"
      borderRight="1px"
      borderColor="gray.200"
      h="100vh"
      position="fixed"
      left={0}
      top={0}
    >
      <SidebarContent />
    </Box>
  )
}