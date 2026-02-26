"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
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
  TagLabel,
  TagCloseButton,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Flex,
  Spinner,
} from "@chakra-ui/react";
import AIPromptGenerator from "@/app/components/AIPromptGenerator";
import TemplateGallery from "@/app/components/TemplateGallery";
import CategorySelector, { Category } from "@/app/components/CategorySelector";
import GradientText from "@/app/components/GradientText";
import { spacing, colors } from "@/app/theme/tokens";

export default function NewPromptPage() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(templateId ? 2 : 0);
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

  const handleAddTag = (e: React.KeyboardEvent) => {
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

  const handleAIAccept = (data: { title: string; content: string; tags: string[]; category: string; isPublic: boolean }) => {
    setTitle(data.title);
    setContent(data.content);
    setTags(data.tags);
    // Note: AI returns a single category name, but we now use categoryIds array
    // For now, we'll skip setting category from AI to avoid complexity
    setIsPublic(data.isPublic);
    setTabIndex(0); // Switch to manual tab to review/edit
    toast({
      title: "AI-generated prompt loaded",
      description: "Review and edit before saving",
      status: "info",
      duration: 3000,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/prompts", {
        method: "POST",
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
        throw new Error(data.error || "Failed to create prompt");
      }

      toast({
        title: "Success",
        description: "Prompt created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      router.push("/prompts");
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to create prompt",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box bg={colors.background.primary} minH="calc(100vh - 64px)">
      <Container maxW="container.md" py={spacing.xl}>
        <VStack spacing={spacing.lg} align="stretch">
          <Box textAlign="center">
            <GradientText
              as="h1"
              size="xl"
              mb={spacing.md}
              letterSpacing="tight"
              variant="primary"
            >
              Create New Prompt
            </GradientText>
            <Text color={colors.text.muted} fontSize="lg">
              Create a new AI prompt template to share with the community
            </Text>
          </Box>

          <Tabs
            index={tabIndex}
            onChange={setTabIndex}
            variant="soft-rounded"
            colorScheme="blue"
          >
            <TabList mb={4}>
              <Tab color="whiteAlpha.700" _selected={{ color: "white", bg: "blue.500" }}>
                Manual
              </Tab>
              <Tab color="whiteAlpha.700" _selected={{ color: "white", bg: "blue.500" }}>
                AI Generate
              </Tab>
              <Tab color="whiteAlpha.700" _selected={{ color: "white", bg: "blue.500" }}>
                Start from Template
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel px={0}>
                <Box
                  as="form"
                  onSubmit={handleSubmit}
                  bg={colors.background.elevated}
                  p={spacing.xl}
                  rounded="2xl"
                  shadow="2xl"
                  borderWidth="1px"
                  borderColor="whiteAlpha.200"
                  position="relative"
                >
                  <Stack spacing={spacing.md}>
                    <FormControl isRequired>
                      <FormLabel color={colors.text.primary}>Title</FormLabel>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter a descriptive title"
                        size="lg"
                        maxLength={20}
                        bg={colors.background.primary}
                        borderColor="whiteAlpha.200"
                        color={colors.text.primary}
                        _placeholder={{ color: colors.text.muted }}
                        _hover={{ borderColor: colors.primary[50] }}
                        _focus={{
                          borderColor: colors.primary[50],
                          boxShadow: `0 0 8px ${colors.primary[50]}40`,
                        }}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color={colors.text.primary}>Content</FormLabel>
                      <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your prompt template here..."
                        size="lg"
                        minH="250px"
                        resize="vertical"
                        bg={colors.background.primary}
                        borderColor="whiteAlpha.200"
                        color={colors.text.primary}
                        _placeholder={{ color: colors.text.muted }}
                        _hover={{ borderColor: colors.primary[50] }}
                        _focus={{
                          borderColor: colors.primary[50],
                          boxShadow: `0 0 8px ${colors.primary[50]}40`,
                        }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel color={colors.text.primary}>Visibility</FormLabel>
                      <HStack spacing={spacing.md}>
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

                    <FormControl>
                      <FormLabel color="whiteAlpha.900">Categories</FormLabel>
                      <CategorySelector
                        selectedCategoryIds={categoryIds}
                        onCategoryChange={setCategoryIds}
                        categories={categories}
                        placeholder="Select categories..."
                        isMultiSelect={true}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel color="whiteAlpha.900">Tags</FormLabel>
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        placeholder="Type a tag and press Enter"
                        size="lg"
                        mb={spacing.sm}
                        bg={colors.background.primary}
                        borderColor="whiteAlpha.200"
                        color={colors.text.primary}
                        _placeholder={{ color: colors.text.muted }}
                        _hover={{ borderColor: colors.primary[50] }}
                        _focus={{
                          borderColor: colors.primary[50],
                          boxShadow: `0 0 8px ${colors.primary[50]}40`,
                        }}
                      />
                      <HStack spacing={2} wrap="wrap" minH="40px">
                        {tags.map((tag) => (
                          <Tag
                            key={tag}
                            size="lg"
                            borderRadius="full"
                            variant="solid"
                            colorScheme="blue"
                          >
                            <TagLabel>{tag}</TagLabel>
                            <TagCloseButton
                              onClick={() => handleRemoveTag(tag)}
                            />
                          </Tag>
                        ))}
                      </HStack>
                    </FormControl>

                    <HStack spacing={spacing.md} justify="flex-end">
                      <Button
                        variant="ghost"
                        onClick={() => router.push("/prompts")}
                        color={colors.text.primary}
                        _hover={{
                          color: colors.primary[50],
                          bg: `${colors.primary[50]}15`,
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="cyber"
                        size="lg"
                        isLoading={isLoading}
                        loadingText="Creating..."
                      >
                        Create Prompt
                      </Button>
                    </HStack>
                  </Stack>
                </Box>
              </TabPanel>

              <TabPanel px={0}>
                <AIPromptGenerator onAccept={handleAIAccept} />
              </TabPanel>

              <TabPanel px={0}>
                <TemplateGallery
                  currentUserId={token ? "user" : ""}
                  onUseTemplate={(tmplId) => {
                    // Load template data into the form
                    loadTemplateData(tmplId);
                    setTabIndex(0); // Switch to manual tab
                  }}
                  onViewTemplate={(tmplId) => {
                    router.push(`/prompts/${tmplId}`);
                  }}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>
    </Box>
  );

  const loadTemplateData = async (tmplId: string) => {
    try {
      const response = await fetch(`/api/prompts/${tmplId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load template");
      }

      const data = await response.json();
      setTitle(data.title + " (Copy)");
      setContent(data.content);
      if (data.categories) {
        setCategoryIds(data.categories.map((c: any) => c.category?.id || c.categoryId));
      }
      setTags(data.tags || []);
      setIsPublic(false); // Start as private
      toast({
        title: "Template loaded",
        description: "Edit the template and save as your own prompt",
        status: "info",
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: "Error loading template",
        description: err instanceof Error ? err.message : "Failed to load template",
        status: "error",
        duration: 5000,
      });
    }
  };
}
