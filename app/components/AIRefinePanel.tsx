"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import {
  Box,
  Button,
  Heading,
  Textarea,
  VStack,
  HStack,
  Text,
  useToast,
  Tag,
  TagLabel,
} from "@chakra-ui/react";

interface AIRefinePanelProps {
  promptId: string;
  onApply: (data: { title: string; content: string; category: string; tags: string[] }) => void;
}

export default function AIRefinePanel({ promptId, onApply }: AIRefinePanelProps) {
  const { token } = useAuth();
  const toast = useToast();
  const [instructions, setInstructions] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [result, setResult] = useState<{ title: string; content: string; category: string; tags: string[] } | null>(null);

  const handleRefine = async () => {
    if (!instructions.trim()) {
      toast({ title: "Please enter refinement instructions", status: "warning", duration: 3000 });
      return;
    }

    setIsRefining(true);
    try {
      const response = await fetch("/api/ai/refine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ promptId, instructions }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Refinement failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      toast({
        title: "Refinement failed",
        description: err instanceof Error ? err.message : "Could not refine prompt",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <Box
      bg="space.darkNavy"
      p={6}
      rounded="xl"
      borderWidth="1px"
      borderColor="whiteAlpha.200"
    >
      <VStack spacing={4} align="stretch">
        <Heading size="sm" bgGradient="linear(to-r, neon.blue, neon.purple)" bgClip="text">
          AI Refine
        </Heading>

        {!result ? (
          <>
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Describe how you want to improve this prompt... e.g., 'Make it more concise', 'Add examples', 'Change tone to formal'"
              minH="80px"
              bg="space.navy"
              borderColor="whiteAlpha.200"
              color="whiteAlpha.900"
              _placeholder={{ color: "whiteAlpha.500" }}
              _hover={{ borderColor: "neon.blue" }}
              _focus={{ borderColor: "neon.blue", boxShadow: "0 0 8px rgba(0, 243, 255, 0.5)" }}
            />
            <Button
              onClick={handleRefine}
              isLoading={isRefining}
              loadingText="Refining..."
              variant="cyber"
              size="sm"
            >
              Refine with AI
            </Button>
          </>
        ) : (
          <>
            <Box>
              <Text color="whiteAlpha.700" fontSize="xs" mb={1}>Refined Title</Text>
              <Text color="whiteAlpha.900" fontSize="sm" fontWeight="bold">{result.title}</Text>
            </Box>
            <Box>
              <Text color="whiteAlpha.700" fontSize="xs" mb={1}>Refined Content</Text>
              <Box bg="whiteAlpha.100" p={3} borderRadius="md">
                <Text whiteSpace="pre-wrap" color="whiteAlpha.900" fontSize="sm">
                  {result.content}
                </Text>
              </Box>
            </Box>
            {result.category && (
              <Box>
                <Text color="whiteAlpha.700" fontSize="xs" mb={1}>Category</Text>
                <Tag size="md" colorScheme="purple" borderRadius="full">
                  <TagLabel>{result.category}</TagLabel>
                </Tag>
              </Box>
            )}
            {result.tags.length > 0 && (
              <Box>
                <Text color="whiteAlpha.700" fontSize="xs" mb={1}>Tags</Text>
                <HStack wrap="wrap" spacing={1}>
                  {result.tags.map((tag) => (
                    <Tag key={tag} size="sm" colorScheme="blue" borderRadius="full">
                      <TagLabel>{tag}</TagLabel>
                    </Tag>
                  ))}
                </HStack>
              </Box>
            )}
            <HStack spacing={3}>
              <Button onClick={() => onApply(result)} variant="cyber" size="sm" flex={1}>
                Apply Changes
              </Button>
              <Button onClick={() => setResult(null)} variant="outline" colorScheme="blue" size="sm" flex={1}>
                Discard
              </Button>
            </HStack>
          </>
        )}
      </VStack>
    </Box>
  );
}
