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
import { useForm, Path } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { FormField } from '@/app/types'

// Generic form field type
export type FormFieldType = 'text' | 'textarea' | 'email' | 'password' | 'number'

// Generic form field interface
// Enhanced form props with proper generics
interface EnhancedFormProps<TSchema extends z.ZodSchema> {
  schema: TSchema
  onSubmit: (data: z.infer<TSchema>) => Promise<void>
  fields: Array<FormField<z.infer<TSchema>>>
  submitLabel?: string
  onSuccess?: () => void
}

export function EnhancedForm<TSchema extends z.ZodSchema>({
  schema,
  onSubmit,
  fields,
  submitLabel = 'Submit',
  onSuccess
}: EnhancedFormProps<TSchema>) {
  type FormData = z.infer<TSchema>
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  const handleFormSubmit = async (data: FormData) => {
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

  // Helper function to get error message
  const getErrorMessage = (fieldName: Path<FormData>): string | undefined => {
    const error = errors[fieldName]
    return error?.message as string | undefined
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <VStack spacing={4}>
        {fields.map((field) => (
          <FormControl key={field.name} isInvalid={!!errors[field.name]}>
            <FormLabel>{field.label}</FormLabel>
            {field.type === 'textarea' ? (
              <Textarea
                {...register(field.name as Path<FormData>)}
                placeholder={field.placeholder}
                isDisabled={isSubmitting}
              />
            ) : (
              <Input
                {...register(field.name as Path<FormData>)}
                type={field.type}
                placeholder={field.placeholder}
                isDisabled={isSubmitting}
              />
            )}
            <FormErrorMessage>
              {getErrorMessage(field.name as Path<FormData>)}
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