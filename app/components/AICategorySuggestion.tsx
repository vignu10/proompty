"use client";

import { useState, useEffect, useRef } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Spinner,
  IconButton,
  useToast,
  Tooltip,
  Progress,
} from "@chakra-ui/react";
import { CloseIcon, StarIcon, CheckIcon } from "@chakra-ui/icons";
import { spacing, colors } from "@/app/theme/tokens";

interface CategorySuggestion {
  category: string;
  confidence: number;
}

interface AICategorySuggestionProps {
  content: string;
  title?: string;
  onApplyCategory: (category: string) => void;
  currentCategory?: string;
  minContentLength?: number;
}

const CONFIDENCE_LEVELS = {
  HIGH: 0.8,
  MEDIUM: 0.6,
  LOW: 0.4,
};

export default function AICategorySuggestion({
  content,
  title,
  onApplyCategory,
  currentCategory,
  minContentLength = 30,
}: AICategorySuggestionProps) {
  const [suggestion, setSuggestion] = useState<CategorySuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);
  const hasFetchedRef = useRef(false);
  const toast = useToast();

  const fetchSuggestion = async () => {
    if (content.length < minContentLength || hasFetchedRef.current) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/ai/suggest-category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token") || "",
        },
        body: JSON.stringify({ content, title }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get suggestion");
      }

      const data = await response.json();
      setSuggestion({
        category: data.category,
        confidence: data.confidence,
      });

      hasFetchedRef.current = true;
    } catch (err) {
      console.error("Error fetching category suggestion:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestion();
    }, 2000); // Wait 2 seconds after user stops typing

    return () => clearTimeout(timer);
  }, [content, title]);

  const handleApply = () => {
    if (!suggestion) return;

    onApplyCategory(suggestion.category);
    setApplied(true);

    toast({
      title: "Category applied",
      description: `Selected "${suggestion.category}" as category`,
      status: "success",
      duration: 2000,
    });
  };

  const handleRefresh = () => {
    hasFetchedRef.current = false;
    setApplied(false);
    fetchSuggestion();
  };

  const handleDismiss = () => {
    setSuggestion(null);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= CONFIDENCE_LEVELS.HIGH) return "green";
    if (confidence >= CONFIDENCE_LEVELS.MEDIUM) return "yellow";
    return "orange";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= CONFIDENCE_LEVELS.HIGH) return "High confidence";
    if (confidence >= CONFIDENCE_LEVELS.MEDIUM) return "Medium confidence";
    return "Low confidence";
  };

  if (loading) {
    return (
      <HStack spacing={spacing.sm} py={spacing.sm}>
        <Spinner size="sm" color={colors.primary[50]} />
        <Text color={colors.text.muted} fontSize="sm">
          Analyzing prompt for category...
        </Text>
      </HStack>
    );
  }

  if (!suggestion || applied) {
    return null;
  }

  const confidenceColor = getConfidenceColor(suggestion.confidence);

  return (
    <Box
      bg={`${colors.primary[50]}08`}
      borderRadius="md"
      p={spacing.sm}
      borderWidth="1px"
      borderColor={`${colors.primary[50]}30`}
    >
      <VStack spacing={spacing.sm} align="stretch">
        <HStack justify="space-between" align="center">
          <HStack spacing={spacing.sm}>
            <StarIcon color={colors.primary[50]} boxSize={4} />
            <Text fontSize="sm" fontWeight="medium" color={colors.text.primary}>
              Suggested Category
            </Text>
          </HStack>
          <HStack spacing={spacing.xs}>
            <Tooltip label="Get new suggestion">
              <IconButton
                size="xs"
                variant="ghost"
                icon={<StarIcon />}
                onClick={handleRefresh}
                aria-label="Refresh category suggestion"
              />
            </Tooltip>
            <Tooltip label="Dismiss suggestion">
              <IconButton
                size="xs"
                variant="ghost"
                icon={<CloseIcon />}
                onClick={handleDismiss}
                aria-label="Dismiss category suggestion"
              />
            </Tooltip>
          </HStack>
        </HStack>

        <VStack spacing={spacing.sm} align="stretch">
          <HStack justify="space-between" align="center">
            <Text
              fontSize="md"
              fontWeight="semibold"
              color={colors.text.primary}
            >
              {suggestion.category}
            </Text>
            <Badge
              colorScheme={confidenceColor}
              variant="subtle"
              fontSize="xs"
            >
              {Math.round(suggestion.confidence * 100)}% match
            </Badge>
          </HStack>

          <Progress
            value={suggestion.confidence * 100}
            size="sm"
            colorScheme={confidenceColor}
            borderRadius="full"
          />

          <Text fontSize="xs" color={colors.text.muted}>
            {getConfidenceLabel(suggestion.confidence)}
          </Text>

          <Button
            size="sm"
            leftIcon={<CheckIcon />}
            colorScheme="blue"
            onClick={handleApply}
            width="full"
          >
            Apply Category
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
}
