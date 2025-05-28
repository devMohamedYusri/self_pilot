'use client'

import { CacheProvider } from '@chakra-ui/next-js'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { AuthProvider } from './contexts/auth-context'

const theme = extendTheme({
  colors: {
    brand: {
      50: '#e3f2ff',
      100: '#b8daff',
      200: '#8cc2ff',
      300: '#60aaff',
      400: '#3492ff',
      500: '#087aff',
      600: '#0062cc',
      700: '#004a99',
      800: '#003166',
      900: '#001933',
    }
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
      }
    }
  }
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ChakraProvider>
    </CacheProvider>
  )
}