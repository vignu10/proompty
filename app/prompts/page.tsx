"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  Checkbox,
  IconButton as ChakraIconButton,
} from "@chakra-ui/react";
import SearchBar, { SearchMode } from "../components/SearchBar";
import PromptCard from "../components/PromptCard";
import PromptModal from "../components/PromptModal";
import CategorySelector, { Category } from "../components/CategorySelector";
import BulkActionsBar from "../components/BulkActionsBar";
import GradientText from "../components/GradientText";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { spacing, colors } from "@/app/theme/tokens";
import { motion } from "framer-motion";

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
  categories?: {
    category: Category;
    sortOrder: number;
  }[];
}

type PromptVisibility = "all" | "public" | "private";

export default function PromptsPage() {
  const { user, token } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>("hybrid");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibility, setVisibility] = useState<PromptVisibility>("all");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedPromptIds, setSelectedPromptIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPrompts, setTotalPrompts] = useState(0);
  const pageSize = 10;
  const toast = useToast();
  const router = useRouter();
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
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

  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
        mass: 0.8,
      },
    },
  };

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

  // Fetch paginated prompts
  const fetchPrompts = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams();

      queryParams.set("page", currentPage.toString());
      queryParams.set("pageSize", pageSize.toString());

      if (visibility === "private" && user?.email) {
        queryParams.set("userId", user.email);
      } else {
        queryParams.set("visibility", visibility);
      }

      // Add category filter if any categories are selected
      if (selectedCategoryIds.length > 0) {
        queryParams.set("categoryIds", selectedCategoryIds.join(","));
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
  }, [token, visibility, currentPage, user, toast, selectedCategoryIds]);

  // API-based search with debounce
  const performSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setIsSearching(false);
        fetchPrompts();
        return;
      }

      setIsSearching(true);
      try {
        const queryParams = new URLSearchParams({
          q: query,
          mode: searchMode,
          limit: "20",
        });

        const response = await fetch(`/api/search?${queryParams.toString()}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const data = await response.json();
        setFilteredPrompts(data.prompts);
        setTotalPrompts(data.total);
        setTotalPages(1);
        setCurrentPage(1);
      } catch (err) {
        console.error("Search error:", err);
        toast({
          title: "Search failed",
          description: "Could not perform search. Showing all prompts.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        fetchPrompts();
      } finally {
        setIsSearching(false);
      }
    },
    [searchMode, token, toast, fetchPrompts]
  );

  // Debounced search handler
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
      searchTimerRef.current = setTimeout(() => {
        performSearch(value);
      }, 300);
    },
    [performSearch]
  );

  // Re-search when mode changes
  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  }, [searchMode]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get("filter");
    if (filterParam === "private") {
      setVisibility("private");
    }
  }, []); // Only run on mount

  // Fetch prompts when not searching
  useEffect(() => {
    if (!searchQuery.trim()) {
      fetchPrompts();
    }
  }, [fetchPrompts]);

  useEffect(() => {
    setLoading(true);
    if (visibility === "private") {
      router.push("/prompts?filter=my-prompts", undefined);
    } else if (visibility === "public") {
      router.push("/prompts?filter=public", undefined);
    } else {
      router.push("/prompts", undefined);
    }
    setCurrentPage(1);
    setSearchQuery("");
    fetchPrompts();
  }, [visibility, router]);

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

  // Bulk action handlers
  const handleClearSelection = () => {
    setSelectedPromptIds([]);
  };

  const handleTogglePromptSelection = (promptId: string) => {
    setSelectedPromptIds((prev) =>
      prev.includes(promptId)
        ? prev.filter((id) => id !== promptId)
        : [...prev, promptId]
    );
  };

  const handleSelectAll = () => {
    const allIds = filteredPrompts.map((p) => p.id);
    setSelectedPromptIds(allIds);
  };

  const handleBulkDelete = async () => {
    if (!user || selectedPromptIds.length === 0) return;

    try {
      const response = await fetch("/api/prompts/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "delete",
          promptIds: selectedPromptIds,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete prompts");
      }

      const result = await response.json();

      setPrompts(prompts.filter((p) => !selectedPromptIds.includes(p.id)));
      setFilteredPrompts(
        filteredPrompts.filter((p) => !selectedPromptIds.includes(p.id))
      );
      setSelectedPromptIds([]);

      toast({
        title: "Success",
        description: `${result.success} prompts deleted successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete prompts",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleBulkStar = async () => {
    if (!user || selectedPromptIds.length === 0) return;

    try {
      const response = await fetch("/api/prompts/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "star",
          promptIds: selectedPromptIds,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to star prompts");
      }

      const result = await response.json();
      setSelectedPromptIds([]);

      toast({
        title: "Success",
        description: `${result.success} prompts starred successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to star prompts",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleBulkExport = (format: "json" | "csv") => {
    if (selectedPromptIds.length === 0) return;

    const promptsToExport = filteredPrompts.filter((p) =>
      selectedPromptIds.includes(p.id)
    );

    if (format === "json") {
      const dataStr = JSON.stringify(promptsToExport, null, 2);
      const dataBlob = new Blob([dataStr], {
        type: "application/json",
      });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `prompts-export-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === "csv") {
      const headers = ["Title", "Content", "Tags", "Categories"];
      const rows = promptsToExport.map((p) => [
        `"${p.title.replace(/"/g, '""')}"`,
        `"${p.content.replace(/"/g, '""')}"`,
        `"${(p.tags || []).join(", ")}"`,
        `"${(p.categories || [])
          .map((pc) => pc.category.name)
          .join(", ")}"`,
      ]);
      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      const dataBlob = new Blob([csvContent], {
        type: "text/csv",
      });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `prompts-export-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleBulkAddTags = async (tags: string[]) => {
    if (!user) return;

    try {
      const response = await fetch("/api/prompts/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "addTags",
          promptIds: selectedPromptIds,
          tags,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add tags");
      }

      await fetchPrompts();
      setSelectedPromptIds([]);
    } catch (error) {
      throw error;
    }
  };

  const handleBulkSetCategories = async (categoryIds: string[]) => {
    if (!user) return;

    try {
      const response = await fetch("/api/prompts/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "setCategories",
          promptIds: selectedPromptIds,
          categoryIds,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to set categories");
      }

      await fetchPrompts();
      setSelectedPromptIds([]);
    } catch (error) {
      throw error;
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
      {/* Main Content */}
      <Container {...containerStyles}>
          <VStack spacing={8} align="stretch">
          <VStack spacing={6} width="100%">
            <Flex
              justify="space-between"
              align="center"
              width="100%"
              flexWrap="wrap"
              gap={4}
            >
              <Box>
                <Heading size="lg" mb={2} className="gradient-text">
                  {visibility === "public"
                    ? "Public Prompts"
                    : visibility === "private"
                    ? "My Prompts"
                    : "All Prompts"}
                </Heading>
                <Text
                  color="whiteAlpha.700"
                  fontSize="lg"
                  letterSpacing="wide"
                >
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
                  onChange={handleSearchChange}
                  placeholder="Search by title, content, or meaning..."
                  searchMode={searchMode}
                  onSearchModeChange={setSearchMode}
                  isSearching={isSearching}
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

            {/* Category Filter */}
            {categories.length > 0 && (
              <Box width="100%">
                <CategorySelector
                  selectedCategoryIds={selectedCategoryIds}
                  onCategoryChange={(ids) => {
                    setSelectedCategoryIds(ids);
                    setCurrentPage(1);
                  }}
                  categories={categories}
                  placeholder="Filter by categories..."
                  isMultiSelect={true}
                />
              </Box>
            )}

            {/* Select All & Selection Info */}
            <Flex justify="space-between" align="center" width="100%">
              <Checkbox
                isChecked={
                  selectedPromptIds.length > 0 &&
                  selectedPromptIds.length === filteredPrompts.length
                }
                isIndeterminate={
                  selectedPromptIds.length > 0 &&
                  selectedPromptIds.length < filteredPrompts.length
                }
                onChange={handleSelectAll}
                colorScheme="blue"
                size="md"
              >
                <Text color="whiteAlpha.900" ml={2}>
                  {selectedPromptIds.length > 0
                    ? `${selectedPromptIds.length} of ${filteredPrompts.length} selected`
                    : "Select All"}
                </Text>
              </Checkbox>

              {selectedPromptIds.length > 0 && (
                <Text
                  color={colors.text.muted}
                  fontSize="sm"
                  cursor="pointer"
                  onClick={handleClearSelection}
                  _hover={{ color: colors.primary[50] }}
                >
                  Clear selection
                </Text>
              )}
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
                {searchQuery.trim()
                  ? "No Results Found"
                  : visibility === "public"
                  ? "No Public Prompts Yet"
                  : visibility === "private"
                  ? "No Private Prompts Yet"
                  : "No Prompts Yet"}
              </Heading>
              <Text color="whiteAlpha.800" fontSize="lg" mb={6}>
                {searchQuery.trim()
                  ? "Try adjusting your search query or switching search mode."
                  : user
                  ? "Create your first prompt to get started!"
                  : "Sign in to create and manage your own prompts."}
              </Text>
              {!searchQuery.trim() &&
                (user ? (
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
                ))}
            </Box>
          ) : (
            <VStack spacing={6}>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{ width: "100%" }}
              >
                <Grid
                  templateColumns={{
                    base: "1fr",
                    md: "repeat(2, minmax(0, 1fr))",
                    lg: "repeat(3, minmax(0, 1fr))",
                  }}
                  gap={6}
                  width="100%"
                >
                  {filteredPrompts.map((prompt, index) => (
                    <motion.div
                      key={prompt.id}
                      variants={cardVariants}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <PromptCard
                        key={prompt.id}
                        prompt={prompt}
                        currentUserId={user?.id || ""}
                        isSelected={selectedPromptIds.includes(prompt.id)}
                        onToggleSelect={handleTogglePromptSelection}
                        onView={(promptId) => {
                          const found =
                            filteredPrompts.find((p) => p.id === promptId) ||
                            prompts.find((p) => p.id === promptId);
                          if (found) {
                            setSelectedPrompt(found);
                            onViewOpen();
                          }
                        }}
                        onEdit={(promptId) => {
                          router.push(`/prompts/${promptId}/edit`);
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
                    </motion.div>
                  ))}
                </Grid>
              </motion.div>

              {filteredPrompts.length > 0 && !searchQuery.trim() && (
                <Box>
                  <HStack spacing={2} justify="center" pt={4}>
                    <Button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
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
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(totalPages, prev + 1)
                        )
                      }
                      isDisabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                      colorScheme="blue"
                    >
                      Next
                    </Button>
                  </HStack>

                  <Text
                    fontSize="sm"
                    color="whiteAlpha.700"
                    textAlign="center"
                    mt={2}
                  >
                    Showing{" "}
                    {totalPrompts > 0
                      ? `${(currentPage - 1) * pageSize + 1} - ${Math.min(
                          currentPage * pageSize,
                          totalPrompts
                        )} of ${totalPrompts}`
                      : "0"}{" "}
                    prompts
                  </Text>
                </Box>
              )}

              {searchQuery.trim() && filteredPrompts.length > 0 && (
                <Text
                  fontSize="sm"
                  color="whiteAlpha.700"
                  textAlign="center"
                  mt={2}
                >
                  Found {totalPrompts} prompts matching your search
                </Text>
              )}
            </VStack>
          )}

          {/* Bulk Actions Bar */}
          {selectedPromptIds.length > 0 && (
            <BulkActionsBar
              selectedCount={selectedPromptIds.length}
              onClearSelection={handleClearSelection}
              onDelete={handleBulkDelete}
              onStar={handleBulkStar}
              onExport={handleBulkExport}
              onAddTags={handleBulkAddTags}
              onSetCategories={handleBulkSetCategories}
            />
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
                bg={colors.background.elevated}
                borderColor="whiteAlpha.200"
                borderWidth="1px"
                borderRadius="xl"
                boxShadow="0 8px 32px rgba(0, 243, 255, 0.1)"
                _dark={{
                  bg: colors.background.elevated,
                }}
              >
                <AlertDialogHeader
                  fontSize="lg"
                  fontWeight="bold"
                  borderBottom="1px solid"
                  borderColor="whiteAlpha.200"
                  pb={spacing.sm}
                >
                  <GradientText variant="primary">Delete Prompt</GradientText>
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
