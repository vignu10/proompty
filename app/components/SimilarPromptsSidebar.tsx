"use client";

import { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Spinner,
  Button,
  Link,
  HStack,
  useToast,
  Divider,
} from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { spacing, colors } from "@/app/theme/tokens";

interface SimilarPrompt {
  id: string;
  title: string;
  score: number;
}

interface SimilarPromptsSidebarProps {
  promptId: string;
  promptTitle?: string;
  currentUserId: string;
  onViewPrompt: (promptId: string) => void;
}

export default function SimilarPromptsSidebar({
  promptId,
  promptTitle,
  currentUserId,
  onViewPrompt,
}: SimilarPromptsSidebarProps) {
  const [similar, setSimilar] = useState<SimilarPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchSimilar = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/prompts/${promptId}/similar`);

        if (!response.ok) {
          throw new Error("Failed to fetch similar prompts");
        }

        const data = await response.json();
        setSimilar(data.similar || []);
      } catch (err) {
        console.error("Error fetching similar prompts:", err);
        // Don't show toast for this error as it's not critical
      } finally {
        setLoading(false);
      }
    };

    fetchSimilar();
  }, [promptId]);

  const getSimilarityLabel = (score: number) => {
    if (score >= 0.9) return "Very similar";
    if (score >= 0.7) return "Similar";
    if (score >= 0.5) return "Related";
    return "Related";
  };

  if (loading) {
    return (
      <Box p={spacing.md}>
        <VStack spacing={spacing.sm} align="stretch">
          <Heading size="sm" color={colors.text.primary}>
            Similar Prompts
          </Heading>
          <Box py={spacing.md} textAlign="center">
            <Spinner color={colors.primary[50]} size="sm" />
          </Box>
        </VStack>
      </Box>
    );
  }

  if (similar.length === 0) {
    return null;
  }

  return (
    <Box p={spacing.md} bg={colors.background.elevated} borderRadius="lg">
      <VStack spacing={spacing.sm} align="stretch">
        <Heading size="sm" color={colors.text.primary}>
          Similar to "{promptTitle}"
        </Heading>

        <Divider borderColor="whiteAlpha.200" />

        <VStack spacing={spacing.sm} align="stretch">
          {similar.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              justifyContent="flex-start"
              textAlign="left"
              onClick={() => onViewPrompt(item.id)}
              rightIcon={<ArrowForwardIcon />}
              color={colors.text.primary}
              _hover={{
                bg: `${colors.primary[50]}15`,
              }}
            >
              <VStack spacing={spacing.xs} align="start" flex={1}>
                <Text noOfLines={2}>{item.title}</Text>
                <HStack spacing={spacing.xs}>
                  <Text fontSize="xs" color={colors.text.muted}>
                    {getSimilarityLabel(item.score)}
                  </Text>
                  <Text fontSize="xs" color={colors.primary[50]}>
                    {Math.round(item.score * 100)}% match
                  </Text>
                </HStack>
              </VStack>
            </Button>
          ))}
        </VStack>

        <Divider borderColor="whiteAlpha.200" />

        <Text fontSize="xs" color={colors.text.muted} textAlign="center">
          Based on semantic similarity
        </Text>
      </VStack>
    </Box>
  );
}
