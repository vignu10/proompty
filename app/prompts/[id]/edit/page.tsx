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
import CategorySelector, { Category } from "@/app/components/CategorySelector";
import GradientText from "@/app/components/GradientText";
import { spacing, colors } from "@/app/theme/tokens";

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
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { token } = useAuth();
  const router = useRouter();
  const toast = useToast();

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

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
      // Extract category IDs from the categories array if it exists
      if (data.categories && Array.isArray(data.categories)) {
        setCategoryIds(data.categories.map((c: any) => c.category?.id || c.categoryId));
      }
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
    // Note: AI returns a single category name, but we now use categoryIds array
    // For now, we'll skip setting category from AI to avoid complexity
    setTags(data.tags);
    toast({
      title: "AI refinement applied",
      description: "Review the changes before saving",
      status: "info",
      duration: 3000,
    });
  };

  const handleSaveAsTemplate = async () => {
    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ promptId: params.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save template");
      }

      toast({
        title: "Success",
        description: "Prompt saved as template",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to save template",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
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
          categoryIds,
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
    <Container maxW="container.md" py={spacing.md}>
      <VStack spacing={spacing.lg} align="stretch">
        <Box>
          <GradientText
            as="h1"
            size="lg"
            mb={spacing.sm}
            variant="primary"
          >
            Edit Prompt
          </GradientText>
          <Text color={colors.text.muted} fontSize="lg" letterSpacing="wide">
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
              <FormLabel>Categories</FormLabel>
              <CategorySelector
                selectedCategoryIds={categoryIds}
                onCategoryChange={setCategoryIds}
                categories={categories}
                placeholder="Select categories..."
                isMultiSelect={true}
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
              <HStack spacing={spacing.sm} wrap="wrap">
                {tags.map((tag) => (
                  <Tag
                    key={tag}
                    size="lg"
                    borderRadius="full"
                    variant="solid"
                    colorScheme="blue"
                    _hover={{
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
                onClick={handleSaveAsTemplate}
                variant="outline"
                colorScheme="purple"
              >
                Save as Template
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
              <Button
                onClick={handleSaveAsTemplate}
                variant="outline"
                colorScheme="purple"
              >
                Save as Template
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
