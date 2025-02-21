'use client';

import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { AuthProvider } from './context/AuthContext';

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'gray.50',
      },
    },
  },
  colors: {
    brand: {
      50: '#f0e4ff',
      100: '#cbb2ff',
      200: '#a480ff',
      300: '#7c4dff',
      400: '#541bff',
      500: '#3b01e6',
      600: '#2d00b4',
      700: '#200082',
      800: '#130051',
      900: '#070021',
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ChakraProvider>
    </CacheProvider>
  );
}
