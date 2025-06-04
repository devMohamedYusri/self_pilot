'use client'

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import type { TaskFormData, TaskPriority } from '@/app/types'
interface TaskFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TaskFormData) => Promise<void>
  initialData?: TaskFormData
}

export function TaskForm({ isOpen, onClose, onSubmit, initialData }: TaskFormProps) {
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        dueDate: initialData.dueDate ? initialData.dueDate.split('T')[0] : '',
        priority: initialData.priority || 'medium',
      })
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSubmit({
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        priority: formData.priority as TaskPriority,
      })
      toast({
        title: initialData ? 'Task updated' : 'Task created',
        status: 'success',
        duration: 3000,
      })
      onClose()
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
      })
    } catch (error) {
      console.error("faield to save task error ", error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
  <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(8px)" />
  <ModalContent 
    bg="white" 
    borderRadius="16px" 
    boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
    border="1px solid"
    borderColor="gray.100"
    mx={4}
  >
    <form onSubmit={handleSubmit}>
      <ModalHeader 
        pb={2}
        borderBottom="1px solid"
        borderColor="gray.100"
        bg="gradient-to-r from-blue.50 to-purple.50"
        borderTopRadius="16px"
        color="gray.800"
        fontSize="xl"
        fontWeight="600"
      >
        {initialData ? '✏️ Edit Task' : '✨ New Task'}
      </ModalHeader>
      
      <ModalCloseButton 
        color="gray.500"
        _hover={{ bg: "gray.100", color: "gray.700" }}
        borderRadius="full"
        size="sm"
      />
      
      <ModalBody py={6} px={6}>
        <VStack spacing={5}>
          <FormControl isRequired>
            <FormLabel 
              color="gray.700" 
              fontSize="sm" 
              fontWeight="600"
              mb={2}
            >
              📝 Title
            </FormLabel>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              borderRadius="12px"
              border="2px solid"
              borderColor="gray.200"
              bg="gray.50"
              _hover={{ borderColor: "blue.300", bg: "white" }}
              _focus={{ 
                borderColor: "blue.500", 
                bg: "white",
                boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)"
              }}
              fontSize="md"
              py={3}
              px={4}
              placeholder="Enter task title..."
              color="#666"

            />
          </FormControl>
          
          <FormControl>
            <FormLabel 
              color="gray.700" 
              fontSize="sm" 
              fontWeight="600"
              mb={2}
            >
              📄 Description
            </FormLabel>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              borderRadius="12px"
              border="2px solid"
              borderColor="gray.200"
              bg="gray.50"
              _hover={{ borderColor: "blue.300", bg: "white" }}
              _focus={{ 
                borderColor: "blue.500", 
                bg: "white",
                boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)"
              }}
              fontSize="md"
              py={3}
              px={4}
              rows={3}
              placeholder="Add task description..."
              resize="vertical"
              color="#666"

            />
          </FormControl>
          
          <FormControl>
            <FormLabel 
              color="gray.700" 
              fontSize="sm" 
              fontWeight="600"
              mb={2}
            >
              📅 Due Date
            </FormLabel>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              borderRadius="12px"
              border="2px solid"
              borderColor="gray.200"
              bg="gray.50"
              _hover={{ borderColor: "blue.300", bg: "white" }}
              _focus={{ 
                borderColor: "blue.500", 
                bg: "white",
                boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)"
              }}
              fontSize="md"
              py={3}
              px={4}
              color="#666"
            />
          </FormControl>
          
          <FormControl>
            <FormLabel 
              color="gray.700" 
              fontSize="sm" 
              fontWeight="600"
              mb={2}
            >
              🎯 Priority
            </FormLabel>
            <Select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              borderRadius="12px"
              border="2px solid"
              borderColor="gray.200"
              bg="gray.50"
              _hover={{ borderColor: "blue.300", bg: "white" }}
              _focus={{ 
                borderColor: "blue.500", 
                bg: "white",
                boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)"
              }}
              fontSize="md"
              py={3}
              px={4}
              color="#666"
            >
              <option value="low">🟢 Low Priority</option>
              <option value="medium">🟡 Medium Priority</option>
              <option value="high">🔴 High Priority</option>
            </Select>
          </FormControl>
        </VStack>
      </ModalBody>
      
      <ModalFooter 
        pt={4}
        pb={6}
        px={6}
        borderTop="1px solid"
        borderColor="gray.100"
        bg="gray.50"
        borderBottomRadius="16px"
        gap={3}
      >
        <Button 
          variant="ghost" 
          onClick={onClose}
          borderRadius="10px"
          px={6}
          py={2}
          color="gray.600"
          bg="white"
          border="2px solid"
          borderColor="gray.200"
          fontWeight="500"
          _hover={{ 
            bg: "gray.100", 
            borderColor: "gray.300",
            transform: "translateY(-1px)"
          }}
          _active={{ transform: "translateY(0px)" }}
          transition="all 0.2s"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          isLoading={isLoading}
          borderRadius="10px"
          px={6}
          py={2}
          bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          color="white"
          fontWeight="600"
          border="none"
          _hover={{ 
            bg: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
            transform: "translateY(-2px)",
            boxShadow: "0 8px 25px -8px rgba(102, 126, 234, 0.6)"
          }}
          _active={{ transform: "translateY(-1px)" }}
          transition="all 0.2s"
          loadingText={initialData ? 'Updating...' : 'Creating...'}
        >
          {initialData ? '✓ Update Task' : '+ Create Task'}
        </Button>
      </ModalFooter>
    </form>
  </ModalContent>
</Modal>
  )
}