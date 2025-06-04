import { useState, useEffect } from 'react'
import { useToast } from '@chakra-ui/react'

interface UseCrudOptions {
  endpoint: string
  onSuccess?: () => void
}

export function useCrud<T>({ endpoint, onSuccess }: UseCrudOptions) {
  const [items, setItems] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const toast = useToast()

  const fetchItems = async () => {
    try {
      const res = await fetch(endpoint)
      const data = await res.json()
      setItems(data)
    } catch (error) { // Fixed: Now using the error variable
      console.error('Failed to fetch items:', error) // Fixed: Added error logging
      toast({
        title: 'Error',
        description: 'Failed to fetch data',
        status: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createItem = async (data: Partial<T>) => {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        await fetchItems()
        onSuccess?.()
      }
    } catch (error) { // Fixed: Now using the error variable
      console.error('Failed to create item:', error) // Fixed: Added error logging
      toast({
        title: 'Error',
        description: 'Failed to create item',
        status: 'error',
      })
    }
  }

  const updateItem = async (id: string, data: Partial<T>) => {
    try {
      const res = await fetch(`${endpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        await fetchItems()
        onSuccess?.()
      }
    } catch (error) { // Fixed: Now using the error variable
      console.error('Failed to update item:', error) // Fixed: Added error logging
      toast({
        title: 'Error',
        description: 'Failed to update item',
        status: 'error',
      })
    }
  }

  const deleteItem = async (id: string) => {
    try {
      const res = await fetch(`${endpoint}/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        await fetchItems()
        onSuccess?.()
      }
    } catch (error) { // Fixed: Now using the error variable
      console.error('Failed to delete item:', error) // Fixed: Added error logging
      toast({
        title: 'Error',
        description: 'Failed to delete item',
        status: 'error',
      })
    }
  }

  useEffect(() => {
    fetchItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Fixed: Added eslint comment to acknowledge intentional empty dependency array

  return {
    items,
    isLoading,
    createItem,
    updateItem,
    deleteItem,
    refresh: fetchItems,
  }
}