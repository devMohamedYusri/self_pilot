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
  VStack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'

interface GoalFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
  initialData?: any
}

export function GoalForm({ isOpen, onClose, onSubmit, initialData }: GoalFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetDate: '',
    progress: 0,
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        targetDate: initialData.targetDate ? initialData.targetDate.split('T')[0] : '',
        progress: initialData.progress || 0,
      })
    } else {
      setFormData({
        title: '',
        description: '',
        targetDate: '',
        progress: 0,
      })
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSubmit({
        ...formData,
        targetDate: formData.targetDate ? new Date(formData.targetDate).toISOString() : null,
      })
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
        color="#2C3E50"
      >
        {initialData ? 'Edit Goal' : 'New Goal'}
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
              color="#4F4F4F"
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
              color='#666'

            />
          </FormControl>
          <FormControl>
            <FormLabel 
              fontSize="lg" 
              fontWeight="medium" 
              color="#4F4F4F"
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
              color='#666'
            />
          </FormControl>
          <FormControl>
            <FormLabel 
              fontSize="lg" 
              fontWeight="medium" 
              color="#4F4F4F"
            >
              Target Date
            </FormLabel>
            <Input 
              type="date" 
              value={formData.targetDate} 
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })} 
              bg="#FFFFFF" 
              borderColor="#D0D0D0" 
              _focus={{ borderColor: "#66CCCC" }} 
              py={2} 
              px={4} 
              fontSize="lg"
              color='#666'

            />
          </FormControl>
          <FormControl>
            <FormLabel 
              fontSize="lg" 
              fontWeight="medium" 
              color="#4F4F4F"
            >
              Progress: {formData.progress}%
            </FormLabel>
            <Slider 
              value={formData.progress} 
              onChange={(value) => setFormData({ ...formData, progress: value })} 
              min={0} 
              max={100} 
              colorScheme="teal"
            >
              <SliderTrack bg="#D0D0D0" height={2} />
              <SliderFilledTrack bg="#66CCCC" />
              <SliderThumb bg="#66CCCC" />
            </Slider>
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