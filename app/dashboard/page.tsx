// app/dashboard/page.tsx
'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Button,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Prompt {
  id: string;
  title: string;
  content: string;
  category?: string;
  tags: string[];
  createdAt: string;
}

export default function DashboardPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await fetch('/api/prompts', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch prompts');
        }

        const data = await res.json();
        setPrompts(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch prompts',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompts();
  }, [router, toast]);

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Text>Loading...</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <Heading size="lg" mb={2}>Your Prompts</Heading>
        <Button colorScheme="blue" onClick={() => router.push('/prompts/new')}>
          Create New Prompt
        </Button>
      </Box>

      {prompts.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Text fontSize="lg" color="gray.600">
            You haven't created any prompts yet.
          </Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {prompts.map((prompt) => (
            <Box
              key={prompt.id}
              p={6}
              bg="white"
              boxShadow="md"
              borderRadius="lg"
              cursor="pointer"
              onClick={() => router.push(`/prompts/${prompt.id}`)}
              _hover={{ transform: 'translateY(-2px)', transition: 'all 0.2s' }}
            >
              <Heading size="md" mb={2}>{prompt.title}</Heading>
              <Text noOfLines={3} color="gray.600" mb={4}>
                {prompt.content}
              </Text>
              {prompt.category && (
                <Text fontSize="sm" color="gray.500" mb={2}>
                  Category: {prompt.category}
                </Text>
              )}
              {prompt.tags.length > 0 && (
                <Box>
                  {prompt.tags.map((tag, index) => (
                    <Box
                      key={index}
                      as="span"
                      px={2}
                      py={1}
                      mr={2}
                      mb={2}
                      bg="blue.50"
                      color="blue.600"
                      borderRadius="full"
                      fontSize="sm"
                      display="inline-block"
                    >
                      {tag}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}
