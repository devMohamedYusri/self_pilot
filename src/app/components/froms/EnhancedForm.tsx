'use client'

import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  Button,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

interface EnhancedFormProps {
  schema: z.ZodSchema
  onSubmit: (data: any) => Promise<void>
  fields: Array<{
    name: string
    label: string
    type: 'text' | 'textarea' | 'email' | 'password' | 'number'
    placeholder?: string
    required?: boolean
  }>
  submitLabel?: string
  onSuccess?: () => void
}

export function EnhancedForm({
  schema,
  onSubmit,
  fields,
  submitLabel = 'Submit',
  onSuccess
}: EnhancedFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(schema)
  })

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true)
    
    try {
      await onSubmit(data)
      toast({
        title: 'Success',
        description: 'Form submitted successfully',
        status: 'success',
        duration: 3000,
      })
      reset()
      onSuccess?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        status: 'error',
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <VStack spacing={4}>
        {fields.map((field) => (
          <FormControl key={field.name} isInvalid={!!errors[field.name]}>
            <FormLabel>{field.label}</FormLabel>
            {field.type === 'textarea' ? (
              <Textarea
                {...register(field.name)}
                placeholder={field.placeholder}
                isDisabled={isSubmitting}
              />
            ) : (
              <Input
                {...register(field.name)}
                type={field.type}
                placeholder={field.placeholder}
                isDisabled={isSubmitting}
              />
            )}
            <FormErrorMessage>
              {errors[field.name]?.message as string}
            </FormErrorMessage>
          </FormControl>
        ))}
        
        <Button
          type="submit"
          colorScheme="brand"
          width="full"
          isLoading={isSubmitting}
          loadingText="Submitting..."
        >
          {submitLabel}
        </Button>
      </VStack>
    </form>
  )
}