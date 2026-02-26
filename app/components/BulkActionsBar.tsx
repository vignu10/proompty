"use client";

import { useState } from "react";
import { HStack, VStack, Text, useToast, IconButton } from "@chakra-ui/react";
import { DeleteIcon, StarIcon, DownloadIcon, AddIcon, CloseIcon } from "@chakra-ui/icons";
import BulkTagModal from "./BulkTagModal";
import BulkCategoryModal from "./BulkCategoryModal";
import ExportModal from "./ExportModal";
import { spacing } from "@/app/theme/tokens";

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onDelete: () => Promise<void>;
  onStar: () => Promise<void>;
  onExport: (format: "json" | "csv") => void;
  onAddTags: (tags: string[]) => Promise<void>;
  onSetCategories: (categoryIds: string[]) => Promise<void>;
}

export default function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onDelete,
  onStar,
  onExport,
  onAddTags,
  onSetCategories,
}: BulkActionsBarProps) {
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const toast = useToast();

  const handleBulkDelete = async () => {
    await onDelete();
  };

  const handleBulkStar = async () => {
    await onStar();
  };

  const handleBulkExport = (format: "json" | "csv") => {
    onExport(format);
  };

  const handleBulkAddTags = async (tags: string[]) => {
    await onAddTags(tags);
  };

  const handleBulkSetCategories = async (categoryIds: string[]) => {
    await onSetCategories(categoryIds);
  };

  return (
    <>
      <VStack
        position="fixed"
        bottom={8}
        left="50%"
        transform="translateX(-50%)"
        bg="space.darkNavy"
        borderWidth="1px"
        borderColor="whiteAlpha.200"
        borderRadius="xl"
        px={spacing.md}
        py={spacing.md}
        boxShadow="0 8px 32px rgba(0, 243, 255, 0.2)"
        zIndex={1000}
        spacing={spacing.md}
        alignItems="center"
        sx={{
          base: { display: { base: "none", md: "flex" } },
          md: { display: "flex" },
        }}
      >
        <Text color="whiteAlpha.900" fontSize="lg" fontWeight="semibold">
          {selectedCount} {selectedCount === 1 ? "prompt" : "prompts"} selected
        </Text>
        <HStack spacing={spacing.sm}>
          <IconButton
            aria-label="Delete selected prompts"
            icon={<DeleteIcon />}
            colorScheme="red"
            size="sm"
            onClick={handleBulkDelete}
          >
            Delete
          </IconButton>
          <IconButton
            aria-label="Star selected prompts"
            icon={<StarIcon />}
            colorScheme="yellow"
            size="sm"
            onClick={handleBulkStar}
          >
            Star
          </IconButton>
          <IconButton
            aria-label="Add tags to selected prompts"
            icon={<AddIcon />}
            colorScheme="blue"
            size="sm"
            onClick={() => setIsTagModalOpen(true)}
          >
            Add Tags
          </IconButton>
          <IconButton
            aria-label="Set categories for selected prompts"
            icon={<AddIcon />}
            colorScheme="purple"
            size="sm"
            onClick={() => setIsCategoryModalOpen(true)}
          >
            Set Categories
          </IconButton>
          <IconButton
            aria-label="Export selected prompts"
            icon={<DownloadIcon />}
            colorScheme="green"
            size="sm"
            onClick={() => setIsExportModalOpen(true)}
          >
            Export
          </IconButton>
          <IconButton
            aria-label="Clear selection"
            icon={<CloseIcon />}
            variant="ghost"
            color="whiteAlpha.900"
            size="sm"
            onClick={onClearSelection}
          >
            <CloseIcon />
          </IconButton>
        </HStack>
      </VStack>
      <BulkTagModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        onApply={handleBulkAddTags}
      />
      <BulkCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onApply={handleBulkSetCategories}
      />
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleBulkExport}
      />
    </>
  );
}
