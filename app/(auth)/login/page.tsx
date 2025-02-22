"use client";

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
  VStack,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useAuth } from '@/app/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: "Login successful!",
        description: "Redirecting to dashboard...",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setTimeout(() => router.push("/prompts"), 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to login",
        status: "error",
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
      py={{ base: "12", md: "16" }}
      px={{ base: "4", sm: "8" }}
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
        background: 'radial-gradient(circle at center, rgba(0, 243, 255, 0.1) 0%, transparent 50%)',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    >
      <Stack spacing="8">
        <Stack spacing="6" textAlign="center">
          <Heading 
            size={{ base: "xl", md: "2xl" }} 
            fontWeight="bold"
            bgGradient="linear(to-r, neon.blue, neon.purple)"
            bgClip="text"
            letterSpacing="tight"
          >
            Welcome back
          </Heading>
          <Text 
            color="whiteAlpha.800"
            fontSize="lg"
            letterSpacing="wide"
          >
            Sign in to access your prompts
          </Text>
        </Stack>
        <Box
          py={{ base: "0", sm: "8" }}
          px={{ base: "4", sm: "10" }}
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
            background: 'linear-gradient(45deg, #00f3ff, #9d00ff)',
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
                <FormLabel htmlFor="email">Email</FormLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel htmlFor="password">Password</FormLabel>
                <InputGroup>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <InputRightElement>
                    <IconButton
                      variant="ghost"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowPassword(!showPassword)}
                      color="neon.blue"
                      _hover={{
                        bg: 'rgba(0, 243, 255, 0.1)',
                        color: 'neon.purple',
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
                Sign in
              </Button>
              <VStack spacing="1">
                <Text color="whiteAlpha.700">
                  Don&apos;t have an account?{" "}
                  <ChakraLink
                    href="/signup"
                    color="neon.blue"
                    fontWeight="semibold"
                    _hover={{ 
                      color: "neon.purple",
                      textShadow: '0 0 8px rgba(157, 0, 255, 0.5)',
                    }}
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
