"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  VStack,
  HStack,
  Text,
  Checkbox,
  useToast,
  Divider,
  Input,
  Box,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import CategorySelector, { Category } from "./CategorySelector";
import { spacing, colors } from "@/app/theme/tokens";

interface BulkCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (categoryIds: string[]) => Promise<void>;
}

export default function BulkCategoryModal({
  isOpen,
  onClose,
  onApply,
}: BulkCategoryModalProps) {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const toast = useToast();

  // Fetch categories when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        throw new Error("Failed to load categories");
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      toast({
        title: "Failed to load categories",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleApply = async () => {
    setIsLoading(true);
    try {
      await onApply(selectedCategoryIds);
      onClose();
      setSelectedCategoryIds([]);
      toast({
        title: "Categories updated successfully",
        status: "success",
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: "Failed to update categories",
        description: err instanceof Error ? err.message : "Unknown error",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay bg="rgba(0, 0, 0, 0.4)" backdropFilter="blur(8px)" />
      <ModalContent
        bg={colors.background.elevated}
        borderColor="whiteAlpha.200"
        borderWidth="1px"
        borderRadius="xl"
        boxShadow="0 8px 32px rgba(0, 243, 255, 0.1)"
      >
        <ModalHeader
          borderBottom="1px solid"
          borderColor="whiteAlpha.200"
          pb={spacing.sm}
        >
          <Text color={colors.primary[50]} fontWeight="bold">
            Set Categories for Selected Prompts
          </Text>
        </ModalHeader>

        <ModalBody py={spacing.md}>
          <VStack spacing={spacing.md} align="stretch">
            <Text color={colors.text.muted} fontSize="sm">
              Select categories to apply to all selected prompts. Existing
              categories will be replaced.
            </Text>

            {isLoadingCategories ? (
              <VStack spacing={spacing.sm} py={spacing.lg}>
                <Spinner color={colors.primary[50]} size="md" />
                <Text color={colors.text.muted} fontSize="sm">
                  Loading categories...
                </Text>
              </VStack>
            ) : categories.length === 0 ? (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <Text fontSize="sm">
                    No categories available. Create categories first to organize your prompts.
                  </Text>
                </Box>
              </Alert>
            ) : (
              <CategorySelector
                selectedCategoryIds={selectedCategoryIds}
                onCategoryChange={setSelectedCategoryIds}
                categories={categories}
                placeholder="Search categories..."
                isMultiSelect={true}
              />
            )}
          </VStack>
        </ModalBody>

        <ModalFooter
          borderTop="1px solid"
          borderColor="whiteAlpha.200"
          pt={spacing.sm}
        >
          <HStack spacing={spacing.sm} width="100%" justify="flex-end">
            <Button
              variant="ghost"
              onClick={onClose}
              color={colors.text.primary}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleApply}
              isLoading={isLoading}
              isDisabled={selectedCategoryIds.length === 0 || isLoadingCategories || categories.length === 0}
            >
              Apply Categories ({selectedCategoryIds.length})
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
