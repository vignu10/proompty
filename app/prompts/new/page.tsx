"use client";

import { useState } from "react";
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
  TagLabel,
  TagCloseButton,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
import AIPromptGenerator from "@/app/components/AIPromptGenerator";

export default function NewPromptPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const { token } = useAuth();
  const router = useRouter();
  const toast = useToast();

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
    if (data.category) setCategory(data.category);
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
          category: category.trim() || null,
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
    <Box bg="space.navy" minH="calc(100vh - 64px)">
      <Container maxW="container.md" py={12}>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center">
            <Heading
              size="xl"
              mb={3}
              bgGradient="linear(to-r, neon.blue, neon.purple)"
              bgClip="text"
              letterSpacing="tight"
            >
              Create New Prompt
            </Heading>
            <Text color="whiteAlpha.800" fontSize="lg">
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
            </TabList>

            <TabPanels>
              <TabPanel px={0}>
                <Box
                  as="form"
                  onSubmit={handleSubmit}
                  bg="space.darkNavy"
                  p={10}
                  rounded="2xl"
                  shadow="2xl"
                  borderWidth="1px"
                  borderColor="whiteAlpha.200"
                  backdropFilter="blur(10px)"
                  position="relative"
                  _before={{
                    content: '""',
                    position: "absolute",
                    top: "-1px",
                    left: 0,
                    right: 0,
                    height: "1px",
                    background:
                      "linear-gradient(90deg, transparent, rgba(0, 243, 255, 0.5), transparent)",
                  }}
                  _after={{
                    content: '""',
                    position: "absolute",
                    bottom: "-1px",
                    left: 0,
                    right: 0,
                    height: "1px",
                    background:
                      "linear-gradient(90deg, transparent, rgba(0, 243, 255, 0.5), transparent)",
                  }}
                >
                  <Stack spacing={6}>
                    <FormControl isRequired>
                      <FormLabel color="whiteAlpha.900">Title</FormLabel>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter a descriptive title"
                        size="lg"
                        maxLength={20}
                        bg="space.navy"
                        borderColor="whiteAlpha.200"
                        color="whiteAlpha.900"
                        _placeholder={{ color: "whiteAlpha.500" }}
                        _hover={{ borderColor: "neon.blue" }}
                        _focus={{
                          borderColor: "neon.blue",
                          boxShadow: "0 0 8px rgba(0, 243, 255, 0.5)",
                        }}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color="whiteAlpha.900">Content</FormLabel>
                      <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your prompt template here..."
                        size="lg"
                        minH="250px"
                        resize="vertical"
                        bg="space.navy"
                        borderColor="whiteAlpha.200"
                        color="whiteAlpha.900"
                        _placeholder={{ color: "whiteAlpha.500" }}
                        _hover={{ borderColor: "neon.blue" }}
                        _focus={{
                          borderColor: "neon.blue",
                          boxShadow: "0 0 8px rgba(0, 243, 255, 0.5)",
                        }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel color="whiteAlpha.900">Visibility</FormLabel>
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

                    <FormControl>
                      <FormLabel color="whiteAlpha.900">Category</FormLabel>
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
                        _focus={{
                          borderColor: "neon.blue",
                          boxShadow: "0 0 8px rgba(0, 243, 255, 0.5)",
                        }}
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
                        mb={3}
                        bg="space.navy"
                        borderColor="whiteAlpha.200"
                        color="whiteAlpha.900"
                        _placeholder={{ color: "whiteAlpha.500" }}
                        _hover={{ borderColor: "neon.blue" }}
                        _focus={{
                          borderColor: "neon.blue",
                          boxShadow: "0 0 8px rgba(0, 243, 255, 0.5)",
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

                    <HStack spacing={4} justify="flex-end">
                      <Button
                        variant="ghost"
                        onClick={() => router.push("/prompts")}
                        color="whiteAlpha.900"
                        _hover={{
                          color: "neon.blue",
                          textShadow: "0 0 8px rgba(0, 243, 255, 0.5)",
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
                        _hover={{ filter: "brightness(1.2)" }}
                        transition="all 0.2s"
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
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>
    </Box>
  );
}
