"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import {
  Box,
  Button,
  Heading,
  VStack,
  Text,
  List,
  ListItem,
  ListIcon,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";

interface AISuggestionsProps {
  promptId: string;
}

export default function AISuggestions({ promptId }: AISuggestionsProps) {
  const { token } = useAuth();
  const toast = useToast();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ promptId }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to get suggestions");
      }

      const data = await response.json();
      setSuggestions(data.suggestions);
      setHasLoaded(true);
    } catch (err) {
      toast({
        title: "Failed to get suggestions",
        description: err instanceof Error ? err.message : "Something went wrong",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box mt={4}>
      {!hasLoaded ? (
        <Button
          onClick={fetchSuggestions}
          isLoading={isLoading}
          loadingText="Analyzing..."
          variant="outline"
          colorScheme="blue"
          size="sm"
        >
          Get AI Suggestions
        </Button>
      ) : (
        <Box bg="whiteAlpha.50" p={4} borderRadius="md" borderWidth="1px" borderColor="whiteAlpha.200">
          <Heading size="xs" color="neon.blue" mb={3}>
            Improvement Suggestions
          </Heading>
          <List spacing={2}>
            {suggestions.map((suggestion, i) => (
              <ListItem key={i} fontSize="sm" color="whiteAlpha.900">
                <ListIcon as={CheckCircleIcon} color="neon.blue" />
                {suggestion}
              </ListItem>
            ))}
          </List>
          <Button
            onClick={fetchSuggestions}
            isLoading={isLoading}
            variant="ghost"
            size="xs"
            mt={3}
            color="whiteAlpha.700"
          >
            Refresh
          </Button>
        </Box>
      )}
    </Box>
  );
}
