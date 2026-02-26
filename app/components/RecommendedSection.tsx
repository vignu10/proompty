"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  VStack,
  Heading,
  SimpleGrid,
  Text,
  Spinner,
  Button,
  HStack,
  useToast,
} from "@chakra-ui/react";
import { ChevronRightIcon, RefreshIcon } from "@chakra-ui/icons";
import PromptCard from "./PromptCard";
import { spacing, colors } from "@/app/theme/tokens";

interface RecommendedPrompt {
  id: string;
  title: string;
  score: number;
}

interface RecommendedSectionProps {
  currentUserId: string;
  onViewPrompt: (promptId: string) => void;
}

export default function RecommendedSection({
  currentUserId,
  onViewPrompt,
}: RecommendedSectionProps) {
  const [recommendations, setRecommendations] = useState<RecommendedPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const fetchRecommendations = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    try {
      const refreshParam = refresh ? "?refresh=true" : "";
      const response = await fetch(`/api/recommendations${refreshParam}`, {
        headers: {
          Authorization: localStorage.getItem("token") || "",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      toast({
        title: "Error",
        description: "Failed to load recommendations",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [currentUserId]);

  const handleRefresh = () => {
    fetchRecommendations(true);
  };

  const handleViewAll = () => {
    router.push("/prompts?filter=recommended");
  };

  if (loading) {
    return (
      <Box py={spacing.lg} textAlign="center">
        <Spinner color={colors.primary[50]} size="md" />
      </Box>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <VStack spacing={spacing.md} align="stretch">
      <HStack justify="space-between" align="center">
        <Heading size="md" color={colors.text.primary}>
          Recommended for You
        </Heading>
        <HStack spacing={spacing.sm}>
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<RefreshIcon />}
            onClick={handleRefresh}
            isLoading={refreshing}
            aria-label="Refresh recommendations"
          >
            Refresh
          </Button>
          <Button
            size="sm"
            variant="ghost"
            rightIcon={<ChevronRightIcon />}
            onClick={handleViewAll}
          >
            View All
          </Button>
        </HStack>
      </HStack>

      <SimpleGrid
        columns={{ base: 1, sm: 2, lg: 3 }}
        spacing={spacing.md}
      >
        {recommendations.slice(0, 6).map((rec) => (
          <Box key={rec.id}>
            <PromptCard
              prompt={{
                id: rec.id,
                title: rec.title,
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
    </VStack>
  );
}
