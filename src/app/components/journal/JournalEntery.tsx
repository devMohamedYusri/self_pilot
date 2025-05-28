'use client'

import {
  Box,
  VStack,
  HStack,
  Text,
  Tag,
  IconButton,
  Collapse,
  useDisclosure,
  Badge,
} from '@chakra-ui/react'
import { FiChevronDown, FiChevronUp, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { format } from 'date-fns'

interface JournalEntry {
  id: string
  title: string
  content: string
  mood?: string
  tags: string[]
  createdAt: string
  aiAnalysis?: string
}

interface JournalEntryProps {
  entry: JournalEntry
  onEdit: (entry: JournalEntry) => void
  onDelete: (id: string) => void
}

export function JournalEntryComponent({ entry, onEdit, onDelete }: JournalEntryProps) {
  const { isOpen, onToggle } = useDisclosure()

  return (
    <Box
      p={4}
      bg="white"
      borderRadius="md"
      borderWidth={1}
      borderColor="gray.200"
    >
      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between">
          <VStack align="start" flex={1}>
            <Text fontWeight="bold" fontSize="lg">{entry.title}</Text>
            <HStack spacing={2}>
              <Text fontSize="sm" color="gray.500">
                {format(new Date(entry.createdAt), 'MMM d, yyyy h:mm a')}
              </Text>
              {entry.mood && (
                <Badge colorScheme="purple">{entry.mood}</Badge>
              )}
            </HStack>
          </VStack>
          <HStack>
            <IconButton
              aria-label="Expand entry"
              icon={isOpen ? <FiChevronUp /> : <FiChevronDown />}
              size="sm"
              variant="ghost"
              onClick={onToggle}
            />
            <IconButton
              aria-label="Edit entry"
              icon={<FiEdit2 />}
              size="sm"
              onClick={() => onEdit(entry)}
            />
            <IconButton
              aria-label="Delete entry"
              icon={<FiTrash2 />}
              size="sm"
              colorScheme="red"
              variant="ghost"
              onClick={() => onDelete(entry.id)}
            />
          </HStack>
        </HStack>

        <Text noOfLines={isOpen ? undefined : 2} color="gray.700">
          {entry.content}
        </Text>

        <Collapse in={isOpen}>
          <VStack align="stretch" spacing={3} mt={3}>
            {entry.aiAnalysis && (
              <Box p={3} bg="blue.50" borderRadius="md">
                <Text fontSize="sm" fontWeight="bold" color="blue.700" mb={1}>
                  AI Insights
                </Text>
                <Text fontSize="sm" color="blue.600">
                  {entry.aiAnalysis}
                </Text>
              </Box>
            )}
            
            {entry.tags.length > 0 && (
              <HStack wrap="wrap" spacing={2}>
                {entry.tags.map((tag, index) => (
                  <Tag key={index} size="sm" colorScheme="gray">
                    {tag}
                  </Tag>
                ))}
              </HStack>
            )}
          </VStack>
        </Collapse>
      </VStack>
    </Box>
  )
}