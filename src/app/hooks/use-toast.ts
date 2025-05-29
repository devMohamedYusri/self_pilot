import { toast as hotToast } from 'react-hot-toast'

interface ToastOptions {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const toast = ({ title, description, variant = 'default' }: ToastOptions) => {
    const message = title ? `${title}: ${description}` : description
    if (variant === 'destructive') {
      hotToast.error(message)
    } else {
      hotToast.success(message)
    }
  }

  return { toast }
} 