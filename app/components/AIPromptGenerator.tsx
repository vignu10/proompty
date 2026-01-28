"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Textarea,
  VStack,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Text,
  useToast,
  Spinner,
} from "@chakra-ui/react";

interface AIPromptGeneratorProps {
  onAccept: (data: { title: string; content: string; tags: string[]; category: string; isPublic: boolean }) => void;
}

export default function AIPromptGenerator({ onAccept }: AIPromptGeneratorProps) {
  const { token } = useAuth();
  const toast = useToast();
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [generatedTitle, setGeneratedTitle] = useState("");
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);
  const [hasResult, setHasResult] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (hasResult) {
        if (newTag && !generatedTags.includes(newTag)) {
          setGeneratedTags([...generatedTags, newTag]);
          setTagInput("");
        }
      } else {
        if (newTag && !tags.includes(newTag)) {
          setTags([...tags, newTag]);
          setTagInput("");
        }
      }
    }
  };

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast({ title: "Please enter a description", status: "warning", duration: 3000 });
      return;
    }

    setIsGenerating(true);
    setHasResult(false);

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ description, category: category || undefined, tags: tags.length > 0 ? tags : undefined }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Generation failed");
      }

      const data = await response.json();
      setGeneratedTitle(data.title);
      setGeneratedContent(data.content);
      if (data.category) setCategory(data.category);
      // Merge AI-returned tags with user-provided tags, deduplicating
      const aiTags: string[] = data.tags || [];
      const merged = [...new Set([...tags, ...aiTags])];
      setGeneratedTags(merged);
      setHasResult(true);
    } catch (err) {
      toast({
        title: "Generation failed",
        description: err instanceof Error ? err.message : "Could not generate prompt",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStreamGenerate = async () => {
    if (!description.trim()) {
      toast({ title: "Please enter a description", status: "warning", duration: 3000 });
      return;
    }

    setIsStreaming(true);
    setGeneratedContent("");
    setGeneratedTitle("Generated Prompt");
    setGeneratedTags(tags);
    setHasResult(true);

    abortRef.current = new AbortController();

    try {
      const response = await fetch("/api/ai/generate/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ description, category: category || undefined, tags: tags.length > 0 ? tags : undefined }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) throw new Error("Stream failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No reader");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                setGeneratedContent((prev) => prev + parsed.content);
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      toast({ title: "Streaming failed", status: "error", duration: 3000 });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleAccept = () => {
    onAccept({ title: generatedTitle, content: generatedContent, tags: generatedTags, category, isPublic });
  };

  const handleRegenerate = () => {
    setGeneratedContent("");
    setGeneratedTitle("");
    setGeneratedTags([]);
    handleGenerate();
  };

  return (
    <Box
      bg="space.darkNavy"
      p={6}
      rounded="xl"
      borderWidth="1px"
      borderColor="whiteAlpha.200"
    >
      <VStack spacing={5} align="stretch">
        <Heading size="md" bgGradient="linear(to-r, neon.blue, neon.purple)" bgClip="text">
          AI Prompt Generator
        </Heading>

        {/* Description - AI instruction input */}
        <FormControl isRequired>
          <FormLabel color="whiteAlpha.900" fontSize="sm">
            Describe what you want the prompt to do
          </FormLabel>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., A prompt that helps users write professional emails with a formal tone..."
            minH={hasResult ? "80px" : "100px"}
            bg="space.navy"
            borderColor="whiteAlpha.200"
            color="whiteAlpha.900"
            _placeholder={{ color: "whiteAlpha.500" }}
            _hover={{ borderColor: "neon.blue" }}
            _focus={{ borderColor: "neon.blue", boxShadow: "0 0 8px rgba(0, 243, 255, 0.5)" }}
          />
        </FormControl>

        {/* Title - editable after generation */}
        {hasResult && (
          <FormControl isRequired>
            <FormLabel color="whiteAlpha.900" fontSize="sm">Title</FormLabel>
            <Input
              value={generatedTitle}
              onChange={(e) => setGeneratedTitle(e.target.value)}
              placeholder="Enter a descriptive title"
              size="lg"
              maxLength={20}
              bg="space.navy"
              borderColor="whiteAlpha.200"
              color="whiteAlpha.900"
              _placeholder={{ color: "whiteAlpha.500" }}
              _hover={{ borderColor: "neon.blue" }}
              _focus={{ borderColor: "neon.blue", boxShadow: "0 0 8px rgba(0, 243, 255, 0.5)" }}
            />
          </FormControl>
        )}

        {/* Content - shown after generation */}
        {hasResult && (
          <FormControl isRequired>
            <FormLabel color="whiteAlpha.900" fontSize="sm">Content</FormLabel>
            <Box bg="whiteAlpha.100" p={4} borderRadius="md" minH="150px" position="relative">
              <Text whiteSpace="pre-wrap" color="whiteAlpha.900" fontSize="sm">
                {generatedContent}
                {isStreaming && <Spinner size="xs" ml={1} color="neon.blue" />}
              </Text>
            </Box>
          </FormControl>
        )}

        {/* Visibility */}
        <FormControl>
          <FormLabel color="whiteAlpha.900" fontSize="sm">Visibility</FormLabel>
          <HStack spacing={4}>
            <Button
              flex="1"
              variant={isPublic ? "solid" : "outline"}
              colorScheme="blue"
              onClick={() => setIsPublic(true)}
              _hover={{ transform: "translateY(-1px)" }}
            >
              Public
            </Button>
            <Button
              flex="1"
              variant={!isPublic ? "solid" : "outline"}
              colorScheme="blue"
              onClick={() => setIsPublic(false)}
              _hover={{ transform: "translateY(-1px)" }}
            >
              Private
            </Button>
          </HStack>
        </FormControl>

        {/* Category */}
        <FormControl>
          <FormLabel color="whiteAlpha.900" fontSize="sm">Category</FormLabel>
          <Input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., Writing, Code, Marketing"
            size="lg"
            bg="space.navy"
            borderColor="whiteAlpha.200"
            color="whiteAlpha.900"
            _placeholder={{ color: "whiteAlpha.500" }}
            _hover={{ borderColor: "neon.blue" }}
            _focus={{ borderColor: "neon.blue", boxShadow: "0 0 8px rgba(0, 243, 255, 0.5)" }}
          />
        </FormControl>

        {/* Tags */}
        <FormControl>
          <FormLabel color="whiteAlpha.900" fontSize="sm">Tags</FormLabel>
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Type a tag and press Enter"
            size="lg"
            mb={3}
            bg="space.navy"
            borderColor="whiteAlpha.200"
            color="whiteAlpha.900"
            _placeholder={{ color: "whiteAlpha.500" }}
            _hover={{ borderColor: "neon.blue" }}
            _focus={{ borderColor: "neon.blue", boxShadow: "0 0 8px rgba(0, 243, 255, 0.5)" }}
          />
          <HStack spacing={2} wrap="wrap" minH="40px">
            {(hasResult ? generatedTags : tags).map((tag) => (
              <Tag key={tag} size="lg" borderRadius="full" variant="solid" colorScheme="blue">
                <TagLabel>{tag}</TagLabel>
                <TagCloseButton
                  onClick={() => {
                    if (hasResult) {
                      setGeneratedTags(generatedTags.filter((t) => t !== tag));
                    } else {
                      setTags(tags.filter((t) => t !== tag));
                    }
                  }}
                />
              </Tag>
            ))}
          </HStack>
        </FormControl>

        {/* Action buttons */}
        {!hasResult ? (
          <HStack spacing={3}>
            <Button
              onClick={handleGenerate}
              isLoading={isGenerating}
              loadingText="Generating..."
              variant="cyber"
              flex={1}
            >
              Generate
            </Button>
            <Button
              onClick={handleStreamGenerate}
              isLoading={isStreaming}
              loadingText="Streaming..."
              variant="outline"
              colorScheme="blue"
              flex={1}
            >
              Stream Generate
            </Button>
          </HStack>
        ) : (
          <HStack spacing={3}>
            <Button onClick={handleAccept} variant="cyber" flex={1} isDisabled={isStreaming}>
              Accept
            </Button>
            <Button
              onClick={handleRegenerate}
              isLoading={isGenerating}
              loadingText="Regenerating..."
              variant="outline"
              colorScheme="blue"
              flex={1}
              isDisabled={isStreaming}
            >
              Regenerate
            </Button>
            <Button
              onClick={() => { setHasResult(false); setGeneratedContent(""); setGeneratedTitle(""); setGeneratedTags([]); }}
              variant="ghost"
              color="whiteAlpha.700"
              isDisabled={isStreaming}
            >
              Start Over
            </Button>
          </HStack>
        )}
      </VStack>
    </Box>
  );
}
