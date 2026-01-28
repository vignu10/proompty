"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Textarea,
  useToast,
  VStack,
  Text,
  HStack,
  Tag,
  Flex,
  TagLabel,
  TagCloseButton,
  Spinner,
} from "@chakra-ui/react";
import AIRefinePanel from "@/app/components/AIRefinePanel";
import AISuggestions from "@/app/components/AISuggestions";

interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string | null;
  tags: string[];
  isPublic: boolean;
}

export default function EditPromptPage({ params }: { params: { id: string } }) {
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { token } = useAuth();
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    fetchPrompt();
  }, [params.id, token]);

  const fetchPrompt = async () => {
    if (!token) return;
    try {
      const response = await fetch(`/api/prompts/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch prompt");
      }

      const data = await response.json();
      setPrompt(data);
      setTitle(data.title);
      setContent(data.content);
      setCategory(data.category || "");
      setTags(data.tags || []);
      setIsPublic(data.isPublic);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load prompt",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      router.push("/prompts");
    } finally {
      setIsFetching(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleRefineApply = (data: { title: string; content: string; category: string; tags: string[] }) => {
    setTitle(data.title);
    setContent(data.content);
    if (data.category) setCategory(data.category);
    setTags(data.tags);
    toast({
      title: "AI refinement applied",
      description: "Review the changes before saving",
      status: "info",
      duration: 3000,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/prompts/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category: category.trim() || null,
          tags,
          isPublic,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update prompt");
      }

      toast({
        title: "Success",
        description: "Prompt updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      router.push("/prompts");
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to update prompt",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <Flex justify="center" align="center" minH="60vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Flex>
    );
  }

  if (!prompt) {
    return null;
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading
            size="lg"
            mb={2}
            bgGradient="linear(to-r, cyan.400, blue.500, purple.600)"
            bgClip="text"
          >
            Edit Prompt
          </Heading>
          <Text color="whiteAlpha.700" fontSize="lg" letterSpacing="wide">
            Update your prompt template
          </Text>
        </Box>

        <Box
          as="form"
          onSubmit={handleSubmit}
          bg="whiteAlpha.100"
          borderRadius="lg"
          p={8}
          boxShadow="xl"
        >
          <Stack spacing={6}>
            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a descriptive title"
                size="lg"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Visibility</FormLabel>
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

            <FormControl isRequired>
              <FormLabel>Content</FormLabel>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your prompt template here..."
                size="lg"
                minH="200px"
                resize="vertical"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Category</FormLabel>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Writing, Code, Marketing"
                size="lg"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Tags</FormLabel>
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type a tag and press Enter"
                size="lg"
                mb={2}
              />
              <HStack spacing={2} wrap="wrap">
                {tags.map((tag) => (
                  <Tag
                    key={tag}
                    size="lg"
                    borderRadius="full"
                    variant="solid"
                    bg="space.navy"
                    color="neon.blue"
                    border="1px solid"
                    borderColor="neon.blue"
                    boxShadow="0 0 10px rgba(0, 243, 255, 0.2)"
                    transition="all 0.2s ease-in-out"
                    _hover={{
                      boxShadow: "0 0 15px rgba(0, 243, 255, 0.4)",
                      transform: "translateY(-1px)",
                    }}
                  >
                    <TagLabel>{tag}</TagLabel>
                    <TagCloseButton onClick={() => handleRemoveTag(tag)} />
                  </Tag>
                ))}
              </HStack>
            </FormControl>

            <HStack spacing={4} justify="flex-end">
              <Button
                onClick={() => router.push("/prompts")}
                variant="outline"
                colorScheme="blue"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                isLoading={isLoading}
                loadingText="Updating..."
              >
                Update Prompt
              </Button>
            </HStack>
          </Stack>
        </Box>

        <AIRefinePanel promptId={params.id} onApply={handleRefineApply} />

        <AISuggestions promptId={params.id} />
      </VStack>
    </Container>
  );
}
