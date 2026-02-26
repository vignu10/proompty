"use client";

import { useState, useEffect, useRef } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  Spinner,
  IconButton,
  useToast,
  Tooltip,
} from "@chakra-ui/react";
import { AddIcon, CloseIcon, StarIcon } from "@chakra-ui/icons";
import { spacing, colors } from "@/app/theme/tokens";

interface AITagSuggestionsProps {
  content: string;
  title?: string;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  currentTags: string[];
  minContentLength?: number;
}

export default function AITagSuggestions({
  content,
  title,
  onAddTag,
  onRemoveTag,
  currentTags,
  minContentLength = 20,
}: AITagSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const hasFetchedRef = useRef(false);
  const toast = useToast();

  const fetchSuggestions = async () => {
    if (content.length < minContentLength || hasFetchedRef.current) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/ai/suggest-tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token") || "",
        },
        body: JSON.stringify({ content, title }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get suggestions");
      }

      const data = await response.json();
      const filteredSuggestions = (data.tags || []).filter(
        (tag: string) => !currentTags.includes(tag)
      );
      setSuggestions(filteredSuggestions);

      if (filteredSuggestions.length > 0) {
        setShowSuggestions(true);
      }

      hasFetchedRef.current = true;
    } catch (err) {
      console.error("Error fetching tag suggestions:", err);
      // Don't show toast for auto-suggestions as they're not critical
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 1500); // Wait 1.5 seconds after user stops typing

    return () => clearTimeout(timer);
  }, [content, title]);

  const handleAddSuggestedTag = (tag: string) => {
    onAddTag(tag);
    setSuggestions((prev) => prev.filter((t) => t !== tag));
  };

  const handleRefresh = () => {
    hasFetchedRef.current = false;
    fetchSuggestions();
  };

  const filteredSuggestions = suggestions.filter(
    (tag) => !currentTags.includes(tag)
  );

  if (loading) {
    return (
      <HStack spacing={spacing.sm} py={spacing.sm}>
        <Spinner size="sm" color={colors.primary[50]} />
        <Text color={colors.text.muted} fontSize="sm">
          Generating tag suggestions...
        </Text>
      </HStack>
    );
  }

  if (!showSuggestions || filteredSuggestions.length === 0) {
    return null;
  }

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
              Suggested Tags
            </Text>
          </HStack>
          <HStack spacing={spacing.xs}>
            <Tooltip label="Refresh suggestions">
              <IconButton
                size="xs"
                variant="ghost"
                icon={<StarIcon />}
                onClick={handleRefresh}
                aria-label="Refresh tag suggestions"
              />
            </Tooltip>
            <Tooltip label="Dismiss suggestions">
              <IconButton
                size="xs"
                variant="ghost"
                icon={<CloseIcon />}
                onClick={() => setShowSuggestions(false)}
                aria-label="Dismiss tag suggestions"
              />
            </Tooltip>
          </HStack>
        </HStack>

        <Wrap spacing={spacing.xs}>
          {filteredSuggestions.map((tag) => (
            <WrapItem key={tag}>
              <Tag
                size="md"
                variant="subtle"
                colorScheme="blue"
                cursor="pointer"
                onClick={() => handleAddSuggestedTag(tag)}
                _hover={{
                  variant: "solid",
                }}
              >
                <TagLabel>{tag}</TagLabel>
                <Box
                  as={AddIcon}
                  boxSize={3}
                  ml={spacing.xs}
                  opacity={0.7}
                />
              </Tag>
            </WrapItem>
          ))}
        </Wrap>

        <Text fontSize="xs" color={colors.text.muted}>
          Click to add tags to your prompt
        </Text>
      </VStack>
    </Box>
  );
}
