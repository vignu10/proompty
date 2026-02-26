"use client";

import { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Heading,
  SimpleGrid,
  Text,
  Spinner,
  Button,
  HStack,
  Badge,
  useToast,
} from "@chakra-ui/react";
import { FireIcon } from "@chakra-ui/icons";
import PromptCard from "./PromptCard";
import { spacing, colors } from "@/app/theme/tokens";

type TimeWindow = "day" | "week" | "month";

interface TrendingPrompt {
  id: string;
  title: string;
  score: number;
}

interface TrendingSectionProps {
  currentUserId: string;
  onViewPrompt: (promptId: string) => void;
}

const TIME_WINDOW_LABELS: Record<TimeWindow, string> = {
  day: "Today",
  week: "This Week",
  month: "This Month",
};

export default function TrendingSection({
  currentUserId,
  onViewPrompt,
}: TrendingSectionProps) {
  const [trending, setTrending] = useState<TrendingPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("week");
  const toast = useToast();

  const fetchTrending = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/trending?timeWindow=${timeWindow}&limit=12`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch trending prompts");
      }

      const data = await response.json();
      setTrending(data.trending || []);
    } catch (err) {
      console.error("Error fetching trending:", err);
      toast({
        title: "Error",
        description: "Failed to load trending prompts",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending();
  }, [timeWindow]);

  const handleTimeWindowChange = (newWindow: TimeWindow) => {
    if (newWindow !== timeWindow) {
      setTimeWindow(newWindow);
    }
  };

  if (loading) {
    return (
      <Box py={spacing.lg} textAlign="center">
        <Spinner color={colors.primary[50]} size="md" />
      </Box>
    );
  }

  return (
    <VStack spacing={spacing.md} align="stretch">
      <HStack justify="space-between" align="center" flexWrap="wrap" gap={spacing.sm}>
        <HStack spacing={spacing.sm}>
          <FireIcon color={colors.primary[50]} boxSize={5} />
          <Heading size="md" color={colors.text.primary}>
            Trending Prompts
          </Heading>
        </HStack>

        <HStack spacing={spacing.sm}>
          {(["day", "week", "month"] as TimeWindow[]).map((tw) => (
            <Button
              key={tw}
              size="sm"
              variant={timeWindow === tw ? "solid" : "ghost"}
              colorScheme="blue"
              onClick={() => handleTimeWindowChange(tw)}
              aria-label={`Show trending from ${TIME_WINDOW_LABELS[tw]}`}
              aria-pressed={timeWindow === tw}
            >
              {TIME_WINDOW_LABELS[tw]}
            </Button>
          ))}
        </HStack>
      </HStack>

      {trending.length === 0 ? (
        <Box
          py={spacing.lg}
          textAlign="center"
          bg={colors.background.elevated}
          borderRadius="lg"
          borderWidth="1px"
          borderColor="whiteAlpha.200"
        >
          <Text color={colors.text.muted}>
            No trending prompts yet. Be the first to interact!
          </Text>
        </Box>
      ) : (
        <SimpleGrid
          columns={{ base: 1, sm: 2, lg: 3 }}
          spacing={spacing.md}
        >
          {trending.map((prompt, index) => (
            <Box key={prompt.id} position="relative">
              {index < 3 && (
                <Badge
                  position="absolute"
                  top={spacing.xs}
                  right={spacing.xs}
                  colorScheme="orange"
                  zIndex={1}
                >
                  #{index + 1}
                </Badge>
              )}
              <PromptCard
                prompt={{
                  id: prompt.id,
                  title: prompt.title,
                  content: "",
                  tags: [],
                  isPublic: true,
                  userId: "",
                  user: { name: "", email: "" },
                  starredBy: [],
                  createdAt: new Date().toISOString(),
                }}
                currentUserId={currentUserId}
                onView={onViewPrompt}
              />
            </Box>
          ))}
        </SimpleGrid>
      )}
    </VStack>
  );
}
