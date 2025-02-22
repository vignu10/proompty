"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  IconButton,
  Tag,
  Text,
  VStack,
  useToast,
  Spinner,
  Badge,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Stack,
  HStack,
  Tooltip,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import SearchBar from "../components/SearchBar";
import PromptCard from "../components/PromptCard";
import PromptModal from "../components/PromptModal";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { useRouter } from "next/navigation";
import {
  containerStyles,
  gradientTextStyles,
  featureCardStyles,
} from "../styles/components";

interface User {
  name: string | null;
  email: string;
}

interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  isPublic: boolean;
  userId: string;
  user: User;
  starredBy: string[];
  originalPromptId?: string | null;
}

type PromptVisibility = "all" | "public" | "private";

export default function PromptsPage() {
  const { user, token } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibility, setVisibility] = useState<PromptVisibility>("public");
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPrompts, setTotalPrompts] = useState(0);
  const pageSize = 10;
  const toast = useToast();
  const router = useRouter();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const {
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onClose: onViewClose,
  } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  const fetchPrompts = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams({
        visibility,
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      });

      const response = await fetch(`/api/prompts?${queryParams.toString()}`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to fetch prompts");
      }

      const data = await response.json();
      setPrompts(data.prompts);
      setFilteredPrompts(data.prompts);
      setTotalPages(data.pagination.totalPages);
      setTotalPrompts(data.pagination.total);
    } catch (err) {
      console.error("Error fetching prompts:", err);
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to load prompts",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [token, visibility, currentPage, user, toast]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when visibility changes
  }, [visibility]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const handleDeleteClick = (promptId: string) => {
    setSelectedPromptId(promptId);
    onDeleteOpen();
  };

  const deletePrompt = async () => {
    if (!selectedPromptId || !token) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/prompts/${selectedPromptId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to delete prompt");
      }

      setPrompts(prompts.filter((prompt) => prompt.id !== selectedPromptId));
      setFilteredPrompts(
        filteredPrompts.filter((prompt) => prompt.id !== selectedPromptId)
      );

      toast({
        title: "Success",
        description: "Prompt deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } catch (err) {
      console.error("Error deleting prompt:", err);
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to delete prompt",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setIsDeleting(false);
      onDeleteClose();
      setSelectedPromptId(null);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="60vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Flex>
    );
  }

  return (
    <>
      <Container {...containerStyles}>
        <VStack spacing={8} align="stretch">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <Box>
              <Heading size="lg" mb={2} className="gradient-text">
                {visibility === "public"
                  ? "Public Prompts"
                  : visibility === "private"
                  ? "My Prompts"
                  : "All Prompts"}
              </Heading>
              <Text color="whiteAlpha.700" fontSize="lg" letterSpacing="wide">
                {prompts.length}{" "}
                {visibility === "private"
                  ? "private prompts"
                  : visibility === "public"
                  ? "public prompts"
                  : "total prompts"}
              </Text>
            </Box>
            <HStack spacing={4} wrap="wrap">
              <Box className="select-container" minW="150px">
                <select
                  className="select-field"
                  value={visibility}
                  onChange={(e) =>
                    setVisibility(e.target.value as PromptVisibility)
                  }
                >
                  <option value="public">Public Prompts</option>
                  {user && (
                    <>
                      <option value="all">All Prompts</option>
                      <option value="private">My Prompts</option>
                    </>
                  )}
                </select>
              </Box>
              {user && (
                <Button
                  leftIcon={<AddIcon />}
                  className="button-primary"
                  onClick={() => router.push("/prompts/new")}
                >
                  Create Prompt
                </Button>
              )}
            </HStack>
          </Flex>

          {prompts.length === 0 ? (
            <Box
              textAlign="center"
              p={8}
              borderRadius="xl"
              className="prompt-card"
            >
              <Heading size="md" mb={4} className="gradient-text">
                {visibility === "public"
                  ? "No Public Prompts Yet"
                  : visibility === "private"
                  ? "No Private Prompts Yet"
                  : "No Prompts Yet"}
              </Heading>
              <Text color="whiteAlpha.800" fontSize="lg" mb={6}>
                {user
                  ? "Create your first prompt to get started!"
                  : "Sign in to create and manage your own prompts."}
              </Text>
              {user ? (
                <Button
                  leftIcon={<AddIcon />}
                  className="button-primary"
                  onClick={() => router.push("/prompts/new")}
                >
                  Create First Prompt
                </Button>
              ) : (
                <Button
                  className="button-primary"
                  onClick={() => router.push("/login")}
                >
                  Sign In
                </Button>
              )}
            </Box>
          ) : (
            <Grid
              templateColumns={{
                base: "1fr",
                md: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              }}
              gap={6}
            >
              {prompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  currentUserId={user?.id || ""}
                  onView={(promptId) => {
                    const selectedPrompt = prompts.find(p => p.id === promptId);
                    if (selectedPrompt) {
                      setSelectedPrompt(selectedPrompt);
                      onViewOpen();
                    }
                  }}
                  onEdit={(promptId) => {
                    router.push(`/prompts/${promptId}/edit`);
                  }}
                  onStar={async (promptId) => {
                    if (!user) {
                      toast({
                        title: "Please log in",
                        description: "You need to be logged in to star prompts",
                        status: "warning",
                        duration: 3000,
                        isClosable: true,
                      });
                      return;
                    }

                    try {
                      const response = await fetch("/api/prompts", {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ promptId, action: "star" }),
                      });

                      if (!response.ok) {
                        throw new Error("Failed to star prompt");
                      }

                      const updatedPrompt = await response.json();
                      setPrompts(
                        prompts.map((p) =>
                          p.id === promptId ? updatedPrompt : p
                        )
                      );
                      setFilteredPrompts(
                        filteredPrompts.map((p) =>
                          p.id === promptId ? updatedPrompt : p
                        )
                      );

                      const isStarred = updatedPrompt.starredBy.includes(
                        user.id
                      );
                      toast({
                        title: isStarred
                          ? "Prompt starred"
                          : "Prompt unstarred",
                        status: "success",
                        duration: 2000,
                        isClosable: true,
                      });
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to star prompt",
                        status: "error",
                        duration: 3000,
                        isClosable: true,
                      });
                    }
                  }}
                  onFork={
                    prompt.isPublic
                      ? async (promptId) => {
                          if (!user) {
                            toast({
                              title: "Please log in",
                              description:
                                "You need to be logged in to fork prompts",
                              status: "warning",
                              duration: 3000,
                              isClosable: true,
                            });
                            return;
                          }

                          try {
                            const response = await fetch("/api/prompts", {
                              method: "PUT",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({
                                promptId,
                                action: "fork",
                              }),
                            });

                            if (!response.ok) {
                              throw new Error("Failed to fork prompt");
                            }

                            const forkedPrompt = await response.json();
                            setPrompts([forkedPrompt, ...prompts]);
                            setFilteredPrompts([
                              forkedPrompt,
                              ...filteredPrompts,
                            ]);

                            toast({
                              title: "Prompt forked successfully",
                              description: "You can find it in your prompts",
                              status: "success",
                              duration: 2000,
                              isClosable: true,
                            });
                          } catch (error) {
                            toast({
                              title: "Error",
                              description: "Failed to fork prompt",
                              status: "error",
                              duration: 3000,
                              isClosable: true,
                            });
                          }
                        }
                      : undefined
                  }
                />
              ))}
            </Grid>
          )}

          <AlertDialog
            isOpen={isDeleteOpen}
            leastDestructiveRef={cancelRef}
            onClose={onDeleteClose}
            isCentered
          >
            <AlertDialogOverlay
              bg="rgba(0, 0, 0, 0.4)"
              backdropFilter="blur(8px)"
            >
              <AlertDialogContent
                bg="space.navy"
                borderColor="whiteAlpha.200"
                borderWidth="1px"
                borderRadius="xl"
                boxShadow="0 8px 32px rgba(0, 243, 255, 0.1)"
                _dark={{
                  bg: "space.navy",
                }}
              >
                <AlertDialogHeader
                  fontSize="lg"
                  fontWeight="bold"
                  bgGradient="linear(to-r, neon.blue, neon.purple)"
                  bgClip="text"
                  borderBottom="1px solid"
                  borderColor="whiteAlpha.200"
                  pb={4}
                >
                  Delete Prompt
                </AlertDialogHeader>

                <AlertDialogBody py={6}>
                  <Text color="whiteAlpha.900">
                    Are you sure you want to delete this prompt? This action
                    cannot be undone.
                  </Text>
                </AlertDialogBody>

                <AlertDialogFooter
                  borderTop="1px solid"
                  borderColor="whiteAlpha.200"
                  pt={4}
                >
                  <Button
                    ref={cancelRef}
                    onClick={onDeleteClose}
                    variant="ghost"
                    _hover={{
                      bg: "whiteAlpha.100",
                    }}
                    isDisabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={deletePrompt}
                    ml={3}
                    variant="solid"
                    bg="red.500"
                    color="white"
                    _hover={{
                      bg: "red.600",
                      transform: "scale(1.02)",
                    }}
                    _active={{
                      bg: "red.700",
                    }}
                    isLoading={isDeleting}
                    loadingText="Deleting..."
                  >
                    Delete
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
        </VStack>
        <PromptModal
          isOpen={isViewOpen}
          onClose={onViewClose}
          prompt={selectedPrompt}
        />
      </Container>
    </>
  );
}
