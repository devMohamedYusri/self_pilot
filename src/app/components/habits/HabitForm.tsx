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
  Switch,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'

interface HabitFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
  initialData?: any
}

export function HabitForm({ isOpen, onClose, onSubmit, initialData }: HabitFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frequency: 'daily',
    active: true,
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        frequency: initialData.frequency || 'daily',
        active: initialData.active ?? true,
      })
    } else {
      setFormData({
        title: '',
        description: '',
        frequency: 'daily',
        active: true,
      })
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
    <ModalOverlay bg="rgba(0, 0, 0, 0.5)" />
    <ModalContent 
      bg="#F7F7F7" 
      borderRadius="lg" 
      boxShadow="0px 0px 10px rgba(0, 0, 0, 0.1)"
    >
      <form onSubmit={handleSubmit}>
        <ModalHeader 
          fontSize="2xl" 
          fontWeight="bold" 
          color="#333"
          pb={2}
        >
          {initialData ? 'Edit Habit' : 'New Habit'}
        </ModalHeader>
        <ModalCloseButton 
          top={4} 
          right={4} 
          bg="#E0E0E0" 
          _hover={{ bg: "#C0C0C0" }} 
        />
        <ModalBody px={8} py={4}>
          <VStack spacing={6}>
            <FormControl isRequired>
              <FormLabel 
                fontSize="lg" 
                fontWeight="medium" 
                color="#555"
                mb={2}
              >
                Title
              </FormLabel>
              <Input 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                bg="#FFFFFF" 
                borderColor="#D0D0D0" 
                _focus={{ borderColor: "#66CCCC" }} 
                py={2} 
                px={4} 
                fontSize="lg"
                color="#000"
              />
            </FormControl>
            <FormControl>
              <FormLabel 
                fontSize="lg" 
                fontWeight="medium" 
                color="#555"
                mb={2}
              >
                Description
              </FormLabel>
              <Textarea 
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                bg="#FFFFFF" 
                borderColor="#D0D0D0" 
                _focus={{ borderColor: "#66CCCC" }} 
                py={2} 
                px={4} 
                fontSize="lg"
                color="#000"
              />
            </FormControl>
            <FormControl>
              <FormLabel 
                fontSize="lg" 
                fontWeight="medium" 
                color="#555"
                mb={2}
              >
                Frequency
              </FormLabel>
              <Select 
                value={formData.frequency} 
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })} 
                bg="#FFFFFF" 
                borderColor="#D0D0D0" 
                _focus={{ borderColor: "#66CCCC" }} 
                py={2} 
                px={4} 
                fontSize="lg"
                color="#000"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </Select>
            </FormControl>
            <FormControl display="flex" alignItems="center">
              <FormLabel 
                fontSize="lg" 
                fontWeight="medium" 
                color="#000"
                mb="0"
              >
                Active
              </FormLabel>
              <Switch 
                isChecked={formData.active} 
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })} 
                size="lg" 
                colorScheme="teal"
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter 
          bg="#F0F0F0" 
          px={8} 
          py={4} 
          borderTop="1px solid #D0D0D0"
        >
          <Button 
            variant="outline" 
            mr={3} 
            onClick={onClose} 
            borderColor="#C0C0C0" 
            _hover={{ bg: "#E0E0E0" }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            colorScheme="teal" 
            isLoading={isLoading}
          >
            {initialData ? 'Update' : 'Create'}
          </Button>
        </ModalFooter>
      </form>
    </ModalContent>
  </Modal>
  )
}