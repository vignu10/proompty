"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Grid,
  Spinner,
  Button,
  useToast,
  Input,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  TagCloseButton,
} from "@chakra-ui/react";
import { SearchIcon, ViewIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import TemplateCard, { Template, Category } from "./TemplateCard";
import { motion } from "framer-motion";
import { spacing, colors } from "@/app/theme/tokens";

interface TemplateGalleryProps {
  currentUserId: string;
  onUseTemplate: (templateId: string) => void;
  onViewTemplate: (templateId: string) => void;
}

export default function TemplateGallery({
  currentUserId,
  onUseTemplate,
  onViewTemplate,
}: TemplateGalleryProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const toast = useToast();
  const gridRef = useRef<HTMLDivElement>(null);

  const fetchTemplates = async (pageNum = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        pageSize: "12",
      });

      if (searchQuery.trim()) {
        params.append("search", searchQuery);
      }

      if (selectedCategoryIds.length > 0) {
        params.append("categories", selectedCategoryIds.join(","));
      }

      const response = await fetch(`/api/templates?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch templates");
      }

      const data = await response.json();
      setTemplates(data.prompts || []);
      setTotalPages(Math.ceil((data.total || 0) / 12));
      setFocusedIndex(-1); // Reset focus when templates change
    } catch (err) {
      console.error("Error fetching templates:", err);
      toast({
        title: "Error",
        description: "Failed to load templates",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchTemplates();
    fetchCategories();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchTemplates(1);
      } else {
        setPage(1);
        fetchTemplates(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategoryIds]);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleUseTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/prompts/${templateId}/use-template`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token") || "",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to use template");
      }

      onUseTemplate(templateId);
      toast({
        title: "Template used!",
        description: "A new prompt has been created from template",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to use template",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (templates.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight":
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev < templates.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
        case "ArrowLeft":
          e.preventDefault();
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;
        case "Home":
          e.preventDefault();
          setFocusedIndex(0);
          break;
        case "End":
          e.preventDefault();
          setFocusedIndex(templates.length - 1);
          break;
        case "Enter":
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < templates.length) {
            onViewTemplate(templates[focusedIndex].id);
          }
          break;
      }
    },
    [templates, focusedIndex, onViewTemplate]
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 10,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <VStack
      spacing={spacing.lg}
      align="stretch"
      p={spacing.md}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="Template gallery"
    >
      <HStack justify="space-between" align="center" flexWrap="wrap" gap={spacing.md}>
        <VStack align="start" spacing={spacing.xs}>
          <Heading size="xl" color={colors.primary[50]}>
            Template Gallery
          </Heading>
          <Text color={colors.text.muted} fontSize="md">
            Browse and use community-created templates
          </Text>
        </VStack>

        <Button
          leftIcon={<ViewIcon />}
          variant="outline"
          colorScheme="blue"
          onClick={() => {
            setSearchQuery("");
            setSelectedCategoryIds([]);
            fetchTemplates(1);
          }}
          aria-label="Refresh templates"
        >
          Refresh
        </Button>
      </HStack>

      {/* Search and Filters */}
      <VStack spacing={spacing.sm} align="stretch">
        <Input
          placeholder="Search templates... (Press Enter to search)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          bg={colors.background.elevated}
          borderColor="whiteAlpha.200"
          color={colors.text.primary}
          _placeholder={{ color: colors.text.muted }}
          _focus={{
            borderColor: colors.primary[50],
            boxShadow: `0 0 8px ${colors.primary[50]}40`,
          }}
          aria-label="Search templates"
        />

        {categories.length > 0 && (
          <Wrap spacing={spacing.xs}>
            {categories.map((cat) => (
              <WrapItem key={cat.id}>
                <Tag
                  size="md"
                  variant={selectedCategoryIds.includes(cat.id) ? "solid" : "subtle"}
                  colorScheme={cat.color || "blue"}
                  cursor="pointer"
                  onClick={() => handleCategoryToggle(cat.id)}
                  tabIndex={0}
                  role="checkbox"
                  aria-checked={selectedCategoryIds.includes(cat.id)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleCategoryToggle(cat.id);
                    }
                  }}
                >
                  <TagLabel>{cat.name}</TagLabel>
                  {selectedCategoryIds.includes(cat.id) && (
                    <TagCloseButton />
                  )}
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        )}
      </VStack>

      {loading ? (
        <Box py={spacing.xl} textAlign="center">
          <Spinner
            size="xl"
            color={colors.primary[50]}
            thickness="4px"
            aria-label="Loading templates"
          />
        </Box>
      ) : templates.length === 0 ? (
        <Box
          py={spacing.xl}
          textAlign="center"
          bg={colors.background.elevated}
          borderRadius="xl"
          borderWidth="1px"
          borderColor="whiteAlpha.200"
          role="status"
          aria-live="polite"
        >
          <Heading size="md" color={colors.text.primary} mb={spacing.sm}>
            {searchQuery || selectedCategoryIds.length > 0
              ? "No templates found"
              : "No templates yet"}
          </Heading>
          <Text color={colors.text.muted} fontSize="md">
            {searchQuery || selectedCategoryIds.length > 0
              ? "Try adjusting your search or filters"
              : "Be the first to save a prompt as a template!"}
          </Text>
        </Box>
      ) : (
        <>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ width: "100%" }}
          >
            <Grid
              ref={gridRef}
              templateColumns={{
                base: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              }}
              gap={spacing.md}
              role="list"
              aria-label={`Template grid showing ${templates.length} templates`}
            >
              {templates.map((template, index) => (
                <motion.div
                  key={template.id}
                  variants={cardVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  role="listitem"
                >
                  <TemplateCard
                    template={template}
                    currentUserId={currentUserId}
                    onUseTemplate={handleUseTemplate}
                    onView={onViewTemplate}
                    isFocused={focusedIndex === index}
                    onFocus={() => setFocusedIndex(index)}
                    index={index}
                  />
                </motion.div>
              ))}
            </Grid>
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <HStack
              spacing={spacing.sm}
              justify="center"
              mt={spacing.md}
              role="navigation"
              aria-label="Template pagination"
            >
              <Button
                leftIcon={<ChevronLeftIcon />}
                onClick={() => {
                  const newPage = Math.max(1, page - 1);
                  setPage(newPage);
                  fetchTemplates(newPage);
                  (document.activeElement as HTMLElement)?.focus();
                }}
                isDisabled={page === 1}
                variant="outline"
                size="sm"
                colorScheme="blue"
                aria-label="Go to previous page"
              >
                Previous
              </Button>

              <Text
                color={colors.text.muted}
                aria-label={`Currently on page ${page} of ${totalPages}`}
              >
                Page <strong>{page}</strong> of <strong>{totalPages}</strong>
              </Text>

              <Button
                rightIcon={<ChevronRightIcon />}
                onClick={() => {
                  const newPage = Math.min(totalPages, page + 1);
                  setPage(newPage);
                  fetchTemplates(newPage);
                  (document.activeElement as HTMLElement)?.focus();
                }}
                isDisabled={page === totalPages}
                variant="outline"
                size="sm"
                colorScheme="blue"
                aria-label="Go to next page"
              >
                Next
              </Button>
            </HStack>
          )}
        </>
      )}
    </VStack>
  );
}
