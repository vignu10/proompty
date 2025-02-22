'use client';

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
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      toast({
        title: 'Account created successfully!',
        description: 'Redirecting to login...',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Wait for the toast to be visible before redirecting
      setTimeout(() => {
        router.push('/login');
      }, 1000);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create account',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container
      maxW="lg"
      py={{ base: '12', md: '16' }}
      px={{ base: '4', sm: '8' }}
      position="relative"
      zIndex={1}
      _before={{
        content: '""',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle at center, rgba(157, 0, 255, 0.1) 0%, transparent 50%)',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    >
      <Stack spacing="8">
        <Stack spacing="6" textAlign="center">
          <Heading 
            size={{ base: 'xl', md: '2xl' }} 
            fontWeight="bold"
            bgGradient="linear(to-r, neon.purple, neon.blue)"
            bgClip="text"
            letterSpacing="tight"
          >
            Create your account
          </Heading>
          <Text 
            color="whiteAlpha.800"
            fontSize="lg"
            letterSpacing="wide"
          >
            Start managing your AI prompts effectively
          </Text>
        </Stack>
        <Box
          py={{ base: '0', sm: '8' }}
          px={{ base: '4', sm: '10' }}
          bg="space.navy"
          borderRadius="xl"
          position="relative"
          overflow="hidden"
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 'xl',
            padding: '1px',
            background: 'linear-gradient(45deg, #9d00ff, #00f3ff)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
          sx={{
            backdropFilter: 'blur(10px)',
          }}
        >
          <form onSubmit={handleSubmit}>
            <Stack spacing="6">
              <FormControl isRequired>
                <FormLabel htmlFor="name" color="whiteAlpha.900">Name</FormLabel>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel htmlFor="email" color="whiteAlpha.900">Email</FormLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel htmlFor="password" color="whiteAlpha.900">Password</FormLabel>
                <InputGroup>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <InputRightElement>
                    <IconButton
                      variant="ghost"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowPassword(!showPassword)}
                      color="neon.purple"
                      _hover={{
                        bg: 'rgba(157, 0, 255, 0.1)',
                        color: 'neon.blue',
                      }}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <Button
                type="submit"
                variant="cyber"
                size="lg"
                fontSize="md"
                isLoading={isLoading}
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '200%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    transform: 'translateX(-100%)',
                    transition: 'transform 0.5s ease',
                  },
                  '&:hover::after': {
                    transform: 'translateX(50%)',
                  },
                }}
              >
                Sign up
              </Button>
            </Stack>
          </form>
        </Box>
        <Text textAlign="center" color="whiteAlpha.700">
          Already have an account?{' '}
          <Link 
            href="/login" 
            style={{ 
              color: '#9d00ff', 
              textDecoration: 'none',
              fontWeight: 'semibold',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#00f3ff';
              e.currentTarget.style.textShadow = '0 0 8px rgba(0, 243, 255, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#9d00ff';
              e.currentTarget.style.textShadow = 'none';
            }}
          >
            Log in
          </Link>
        </Text>
      </Stack>
    </Container>
  );
}
