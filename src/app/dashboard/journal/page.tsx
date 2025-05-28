'use client'

import { useState } from 'react'
import {
  Box,
  Heading,
  Button,
  HStack,
  VStack,
  useDisclosure,
} from '@chakra-ui/react'
import { FiPlus } from 'react-icons/fi'
import { DashboardLayout } from '@/app/components/layout/DashboardLayout'
import { JournalEntryComponent } from '@/app/components/journal/JournalEntery'
import { JournalForm } from '@/app/components/journal/JournalForm'
import { useCrud } from '@/app/hooks/useCrud'

interface JournalEntry {
  id: string
  title: string
  content: string
  mood?: string
  tags: string[]
  createdAt: string
  aiAnalysis?: string
}

export default function JournalPage() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  
  const {
    items: entries,
    isLoading,
    createItem,
    updateItem,
    deleteItem,
  } = useCrud<JournalEntry>({ endpoint: '/api/journals' })

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry)
    onOpen()
  }

  const handleCloseForm = () => {
    setEditingEntry(null)
    onClose()
  }

  const handleSubmit = async (data: any) => {
    if (editingEntry) {
      await updateItem(editingEntry.id, data)
    } else {
      await createItem(data)
    }
    handleCloseForm()
  }

  return (
    <DashboardLayout>
      <Box>
        <HStack justify="space-between" mb={6}>
          <Heading>Journal</Heading>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="brand"
            onClick={onOpen}
          >
            New Entry
          </Button>
        </HStack>

        <VStack align="stretch" spacing={4}>
          {entries.map((entry) => (
            <JournalEntryComponent
              key={entry.id}
              entry={entry}
              onEdit={handleEdit}
              onDelete={deleteItem}
            />
          ))}
        </VStack>

        <JournalForm
          isOpen={isOpen}
          onClose={handleCloseForm}
          onSubmit={handleSubmit}
          initialData={editingEntry}
        />
      </Box>
    </DashboardLayout>
  )
}