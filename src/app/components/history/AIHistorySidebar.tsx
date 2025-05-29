'use client'

import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  HStack,
  Text,
  Badge,
  Box,
  Input,
  InputLeftElement,
  Select,
  IconButton,
  Divider,
  Spinner,
  useDisclosure,
} from '@chakra-ui/react'
import { FiFilter, FiSearch, FiClock } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'

interface AIHistoryItem {
  id: string
  action: string
  entityType: string
  entityId?: string
  details: any
  approved?: boolean
  createdAt: string
  userId: string
}

interface AIHistorySidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function AIHistorySidebar({ isOpen, onClose }: AIHistorySidebarProps) {
  const [history, setHistory] = useState<AIHistoryItem[]>([])
  const [filteredHistory, setFilteredHistory] = useState<AIHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterAction, setFilterAction] = useState('all')

  useEffect(() => {
    if (isOpen) {
      fetchHistory()
    }
  }, [isOpen])

  useEffect(() => {
    filterHistory()
  }, [history, searchTerm, filterType, filterAction])

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/ai/history')
      const data = await res.json()
      setHistory(data)
    } catch (error) {
      console.error('Failed to fetch AI history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterHistory = () => {
    let filtered = [...history]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        JSON.stringify(item.details).toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.action.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by entity type
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.entityType === filterType)
    }

    // Filter by action
    if (filterAction !== 'all') {
      filtered = filtered.filter(item => item.action === filterAction)
    }

    setFilteredHistory(filtered)
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'green'
      case 'update': return 'blue'
      case 'delete': return 'red'
      case 'suggest': return 'purple'
      case 'approve': return 'teal'
      case 'reject': return 'orange'
      case 'chat': return 'cyan'
      default: return 'gray'
    }
  }

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'task': return '✓'
      case 'goal': return '🎯'
      case 'habit': return '🔄'
      case 'routine': return '⏰'
      case 'journal': return '📝'
      case 'conversation': return '💬'
      default: return '📋'
    }
  }

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>
          <HStack>
            <FiClock />
            <Text>AI Activity History</Text>
          </HStack>
        </DrawerHeader>

        <DrawerBody>
          <VStack spacing={4} align="stretch">
            {/* Filters */}
            <Box>
              <HStack mb={3}>
                <Input
                  placeholder="Search history..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                >
                  <InputLeftElement>
                    <FiSearch />
                  </InputLeftElement>
                </Input>
              </HStack>
              <HStack>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  size="sm"
                >
                  <option value="all">All Types</option>
                  <option value="task">Tasks</option>
                  <option value="goal">Goals</option>
                  <option value="habit">Habits</option>
                  <option value="routine">Routines</option>
                  <option value="journal">Journal</option>
                  <option value="conversation">Chats</option>
                </Select>
                <Select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  size="sm"
                >
                  <option value="all">All Actions</option>
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                  <option value="suggest">Suggest</option>
                  <option value="approve">Approve</option>
                  <option value="reject">Reject</option>
                  <option value="chat">Chat</option>
                </Select>
              </HStack>
            </Box>

            <Divider />

            {/* History Items */}
            {isLoading ? (
              <Box textAlign="center" py={8}>
                <Spinner />
              </Box>
            ) : (
              <VStack spacing={3} align="stretch">
                {filteredHistory.map((item) => (
                  <Box
                    key={item.id}
                    p={3}
                    borderWidth={1}
                    borderRadius="md"
                    borderColor="gray.200"
                    _hover={{ bg: 'gray.50' }}
                  >
                    <HStack justify="space-between" mb={1}>
                      <HStack>
                        <Text fontSize="lg">{getEntityIcon(item.entityType)}</Text>
                        <Badge colorScheme={getActionColor(item.action)}>
                          {item.action}
                        </Badge>
                        {item.approved !== undefined && (
                          <Badge colorScheme={item.approved ? 'green' : 'red'}>
                            {item.approved ? 'Approved' : 'Rejected'}
                          </Badge>
                        )}
                      </HStack>
                      <Text fontSize="xs" color="gray.500">
                        {format(new Date(item.createdAt), 'MMM d, h:mm a')}
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.700">
                      {item.entityType.charAt(0).toUpperCase() + item.entityType.slice(1)}
                      {item.details.title && `: "${item.details.title}"`}
                    </Text>
                    
                    {item.details.message && (
                      <Text fontSize="xs" color="gray.600" mt={1}>
                        {item.details.message}
                      </Text>
                    )}
                    
                    {item.details.provider && (
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        AI Provider: {item.details.provider}
                      </Text>
                    )}
                  </Box>
                ))}
                
                {filteredHistory.length === 0 && (
                  <Box textAlign="center" py={8}>
                    <Text color="gray.500">No history items found</Text>
                  </Box>
                )}
              </VStack>
            )}
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}