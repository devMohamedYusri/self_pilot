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
  Select,
  Divider,
  Spinner,
} from '@chakra-ui/react'
import { FiSearch, FiClock } from 'react-icons/fi'
import { useState, useEffect, useCallback } from 'react' // Fixed: Added useCallback import
import { format } from 'date-fns'
import type { AILog, AILogAction, AILogEntityType, AIHistoryDetails } from '@/app/types/index'

interface AIHistorySidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function AIHistorySidebar({ isOpen, onClose }: AIHistorySidebarProps) {
  const [history, setHistory] = useState<AILog[]>([])
  const [filteredHistory, setFilteredHistory] = useState<AILog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<AILogEntityType | 'all'>('all')
  const [filterAction, setFilterAction] = useState<AILogAction | 'all'>('all')

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/ai/history')
      if (!res.ok) throw new Error('Failed to fetch history')
      const data: AILog[] = await res.json()
      setHistory(data)
    } catch (error) {
      console.error('Failed to fetch AI history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fixed: Wrapped filterHistory in useCallback to memoize it
  const filterHistory = useCallback(() => {
    let filtered = [...history]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item => {
        const details = item.details as AIHistoryDetails
        const detailsString = JSON.stringify(details).toLowerCase()
        return detailsString.includes(searchTerm.toLowerCase()) ||
          item.action.toLowerCase().includes(searchTerm.toLowerCase())
      })
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
  }, [history, searchTerm, filterType, filterAction]) // Fixed: Added dependencies for filterHistory

  useEffect(() => {
    if (isOpen) {
      fetchHistory()
    }
  }, [isOpen])

  // Fixed: Added filterHistory to dependency array
  useEffect(() => {
    filterHistory()
  }, [filterHistory])

  const getActionColor = (action: string): string => {
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

  const getEntityIcon = (entityType: string): string => {
    switch (entityType) {
      case 'task': return '✓'
      case 'goal': return '🎯'
      case 'habit': return '🔄'
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
                <Box position="relative" flex={1}>
                  <Input
                    placeholder="Search history..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    pl={10}
                  />
                  <Box position="absolute" left={3} top="50%" transform="translateY(-50%)">
                    <FiSearch />
                  </Box>
                </Box>
              </HStack>
              <HStack>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as AILogEntityType | 'all')}
                  size="sm"
                >
                  <option value="all">All Types</option>
                  <option value="task">Tasks</option>
                  <option value="goal">Goals</option>
                  <option value="habit">Habits</option>
                  <option value="journal">Journal</option>
                  <option value="conversation">Chats</option>
                </Select>
                <Select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value as AILogAction | 'all')}
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
                {filteredHistory.map((item) => {
                  const details = item.details as AIHistoryDetails
                  return (
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
                          {item.approved !== undefined && item.approved !== null && (
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
                        {details.title && `: "${details.title}"`}
                      </Text>
                      
                      {details.message && (
                        <Text fontSize="xs" color="gray.600" mt={1}>
                          {details.message}
                        </Text>
                      )}
                      
                      {details.provider && (
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          AI Provider: {details.provider}
                        </Text>
                      )}
                    </Box>
                  )
                })}
                
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