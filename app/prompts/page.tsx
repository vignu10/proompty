"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Fuse from 'fuse.js';
import { useRouter } from "next/navigation";
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
  const [allPrompts, setAllPrompts] = useState<Prompt[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Configure Fuse instance with search options
  const fuse = useMemo(() => new Fuse(allPrompts, {
    keys: [
      { name: 'title', weight: 0.7 },
      { name: 'content', weight: 0.5 },
      { name: 'tags', weight: 0.3 }
    ],
    threshold: 0.4,
    includeScore: true,
    shouldSort: true,
  }), [allPrompts]);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibility, setVisibility] = useState<PromptVisibility>("all");
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

  // Fetch all prompts for search functionality
  const fetchAllPrompts = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('visibility', visibility);
      const response = await fetch(`/api/prompts?${queryParams.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error("Failed to fetch all prompts");
      }

      const data = await response.json();
      setAllPrompts(data.prompts);
    } catch (err) {
      console.error("Error fetching all prompts:", err);
    }
  }, [visibility, token]);

  // Fetch paginated prompts
  const fetchPrompts = useCallback(async () => {
    if (isSearching) return; // Don't fetch when searching

    try {
      const queryParams = new URLSearchParams();
      
      queryParams.set('page', currentPage.toString());
      queryParams.set('pageSize', pageSize.toString());
      
      if (visibility === "private" && user?.email) {
        queryParams.set('userId', user.email);
      } else {
        queryParams.set('visibility', visibility);
      }

      const response = await fetch(`/api/prompts?${queryParams.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
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
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get("filter");
    if (filterParam === "private") {
      setVisibility("private");
    }
  }, []); // Only run on mount

  // Handle search with Fuse.js and pagination
  useEffect(() => {
    const hasSearchQuery = searchQuery.trim().length > 0;
    setIsSearching(hasSearchQuery);

    if (hasSearchQuery) {
      const searchResults = fuse.search(searchQuery);
      const results = searchResults.map(result => result.item);
      
      setTotalPrompts(results.length);
      setTotalPages(Math.ceil(results.length / pageSize));

      // Apply pagination to search results
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      setFilteredPrompts(results.slice(start, end));
    } else {
      // When not searching, rely on server-side pagination
      fetchPrompts();
    }
  }, [searchQuery, fuse, currentPage, pageSize]);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Fetch all prompts when visibility changes
  useEffect(() => {
    fetchAllPrompts();
  }, [visibility, fetchAllPrompts]);

  useEffect(() => {
    setLoading(true);
    if (visibility === "private") {
      router.push("/prompts?filter=my-prompts", undefined);
    } else if (visibility === "public") {
      router.push("/prompts?filter=public", undefined);
    } else {
      router.push("/prompts", undefined);
    }
    setCurrentPage(1); // Reset to first page when visibility changes
    fetchPrompts();
  }, [visibility, router]);

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
          <VStack spacing={6} width="100%">
            <Flex justify="space-between" align="center" width="100%" flexWrap="wrap" gap={4}>
              <Box>
                <Heading size="lg" mb={2} className="gradient-text">
                  {visibility === "public"
                    ? "Public Prompts"
                    : visibility === "private"
                    ? "My Prompts"
                    : "All Prompts"}
                </Heading>
                <Text color="whiteAlpha.700" fontSize="lg" letterSpacing="wide">
                  {totalPrompts}{" "}
                  {visibility === "private"
                    ? "of your prompts"
                    : visibility === "public"
                    ? "public prompts"
                    : "total prompts"}
                </Text>
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
            </Flex>

            <Flex width="100%" gap={4} align="center">
              <Box flex={1}>
                <SearchBar
                  value={searchQuery}
                  onChange={(value) => {
                    setSearchQuery(value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by title or content..."
                />
              </Box>
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
            </Flex>
          </VStack>

          {filteredPrompts.length === 0 ? (
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
            <VStack spacing={6}>
              <Grid
                templateColumns={{
                  base: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                  lg: "repeat(3, minmax(0, 1fr))",
                }}
                gap={6}
                width="100%"
              >
                {filteredPrompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  currentUserId={user?.id || ""}
                  onView={(promptId) => {
                    const selectedPrompt = prompts.find(
                      (p) => p.id === promptId
                    );
                    if (selectedPrompt) {
                      setSelectedPrompt(selectedPrompt);
                      onViewOpen();
                    }
                  }}
                  onEdit={(promptId) => {
                    router.push(`/prompts/${promptId}/edit`);
                  }}
                  onDelete={async (promptId) => {
                    if (!user) return;
                    
                    try {
                      const response = await fetch(`/api/prompts/${promptId}`, {
                        method: 'DELETE',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                        },
                      });

                      if (!response.ok) {
                        throw new Error('Failed to delete prompt');
                      }

                      setPrompts(prompts.filter(p => p.id !== promptId));
                      toast({
                        title: 'Prompt deleted',
                        status: 'success',
                        duration: 3000,
                        isClosable: true,
                      });
                    } catch (error) {
                      toast({
                        title: 'Error',
                        description: 'Failed to delete prompt',
                        status: 'error',
                        duration: 3000,
                        isClosable: true,
                      });
                    }
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

              {filteredPrompts.length > 0 && (
                <Box>
                  <HStack spacing={2} justify="center" pt={4}>
                    <Button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      isDisabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                      colorScheme="blue"
                    >
                      Previous
                    </Button>
                    
                    <Text fontSize="sm" color="whiteAlpha.800">
                      Page {currentPage} of {totalPages}
                    </Text>

                    <Button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      isDisabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                      colorScheme="blue"
                    >
                      Next
                    </Button>
                  </HStack>

                  <Text fontSize="sm" color="whiteAlpha.700" textAlign="center" mt={2}>
                    {searchQuery.trim() ? 'Found' : 'Showing'} {totalPrompts > 0 ? `${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, totalPrompts)} of ${totalPrompts}` : '0'} prompts
                    {searchQuery.trim() && ' matching your search'}
                  </Text>
                </Box>
              )}
            </VStack>
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
