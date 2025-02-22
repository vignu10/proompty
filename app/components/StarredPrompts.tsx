"use client";

import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import PromptCard from "@/app/components/PromptCard";

interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  isPublic: boolean;
  userId: string;
  originalPromptId?: string | null;
  starredBy: string[];
  user: {
    name: string | null;
    email: string;
  };
}

interface StarredPromptsProps {
  userId: string;
}

export default function StarredPrompts({ userId }: StarredPromptsProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const bgColor = useColorModeValue("white", "gray.800");

  useEffect(() => {
    const fetchStarredPrompts = async () => {
      try {
        const response = await fetch(
          `/api/prompts?visibility=starred&page=1&pageSize=20&userId=${userId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch starred prompts");
        }
        const data = await response.json();
        setPrompts(data.prompts || []);
      } catch (error) {
        console.error("Error fetching starred prompts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStarredPrompts();
  }, [userId]);

  if (loading) {
    return (
      <Box p={4}>
        <Text>Loading starred prompts...</Text>
      </Box>
    );
  }

  if (prompts.length === 0) {
    return (
      <Box p={4} textAlign="center">
        <Text>You haven't starred any prompts yet.</Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <VStack spacing={4} align="stretch">
        <Heading size="md">Starred Prompts</Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              currentUserId={userId}
              onStar={async (promptId: string) => {
                try {
                  await fetch(`/api/prompts`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ promptId, action: "star" }),
                  });
                  setPrompts((prev) => prev.filter((p) => p.id !== promptId));
                } catch (error) {
                  console.error("Error unstarring prompt:", error);
                }
              }}
              onFork={async (promptId: string) => {
                try {
                  const response = await fetch(`/api/prompts`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ promptId, action: "fork" }),
                  });
                  if (!response.ok) {
                    throw new Error("Failed to fork prompt");
                  }
                } catch (error) {
                  console.error("Error forking prompt:", error);
                }
              }}
            />
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
}
