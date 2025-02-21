'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Link as ChakraLink } from '@chakra-ui/next-js';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast({
        title: 'Login successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      router.push('/prompts');
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to login',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
      <Stack spacing="8">
        <Stack spacing="6" textAlign="center">
          <Heading size={{ base: 'xl', md: '2xl' }} fontWeight="extrabold" color="gray.900">
            Sign in to your account
          </Heading>
        </Stack>

        <Box
          py={{ base: '0', sm: '8' }}
          px={{ base: '4', sm: '10' }}
          bg={{ base: 'transparent', sm: 'white' }}
          boxShadow={{ base: 'none', sm: 'md' }}
          borderRadius={{ base: 'none', sm: 'xl' }}
        >
          <form onSubmit={handleSubmit}>
            <Stack spacing="6">
              <Stack spacing="5">
                <FormControl>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </FormControl>
              </Stack>

              <Button
                type="submit"
                colorScheme="brand"
                size="lg"
                fontSize="md"
                isLoading={isLoading}
              >
                Sign in
              </Button>

              <VStack spacing="1">
                <Text color="gray.600">
                  Don&apos;t have an account?{' '}
                  <ChakraLink
                    href="/signup"
                    color="brand.500"
                    fontWeight="semibold"
                    _hover={{ color: 'brand.600' }}
                  >
                    Sign up
                  </ChakraLink>
                </Text>
              </VStack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Container>
  );
}
