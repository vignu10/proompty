"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  VStack,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Text,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { spacing, colors } from "@/app/theme/tokens";

interface BulkTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (tags: string[]) => Promise<void>;
}

export default function BulkTagModal({
  isOpen,
  onClose,
  onApply,
}: BulkTagModalProps) {
  const [tagInput, setTagInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<{ name: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchAvailableTags();
    }
  }, [isOpen]);

  const fetchAvailableTags = async () => {
    try {
      const response = await fetch("/api/prompts?pageSize=100");
      if (!response.ok) {
        throw new Error("Failed to fetch tags");
      }

      const data = await response.json();
      const prompts = data.prompts || [];

      const tagCounts: Record<string, number> = {};
      prompts.forEach((prompt: any) => {
        (prompt.tags || []).forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      const uniqueTags = Object.entries(tagCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 50);

      setAvailableTags(uniqueTags);
    } catch (err) {
      console.error("Error fetching tags:", err);
    }
  };

  const handleAddTag = () => {
    const newTag = tagInput.trim();
    if (newTag && !selectedTags.includes(newTag)) {
      setSelectedTags([...selectedTags, newTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  const filteredSuggestions = availableTags.filter((tag) =>
    tag.name.toLowerCase().includes(tagInput.toLowerCase()) &&
    !selectedTags.includes(tag.name)
  );

  const handleApply = async () => {
    setIsLoading(true);
    try {
      await onApply(selectedTags);
      onClose();
      setSelectedTags([]);
      setTagInput("");
      toast({
        title: "Success",
        description: `${selectedTags.length} tags added successfully`,
        status: "success",
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to add tags",
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
        p={spacing.md}
      >
        <ModalHeader borderBottom="1px solid" borderColor="whiteAlpha.200" pb={spacing.sm}>
          <Heading size="md" color={colors.text.primary}>
            Add Tags to Selected Prompts
          </Heading>
        </ModalHeader>

        <ModalBody py={spacing.md}>
          <Text color={colors.text.muted} fontSize="sm" mb={spacing.sm}>
            Add tags to multiple prompts at once. Start typing to search existing tags, or
            create new ones.
          </Text>

          <FormControl mb={spacing.sm}>
            <FormLabel htmlFor="tag-input">Tag name</FormLabel>
            <Input
              id="tag-input"
              placeholder="Type a tag name..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              size="lg"
              bg={colors.background.primary}
              borderColor="whiteAlpha.200"
              color={colors.text.primary}
              _placeholder={{ color: colors.text.muted }}
              _focus={{
                borderColor: colors.primary[50],
                boxShadow: `0 0 8px ${colors.primary[50]}40`,
              }}
            />
          </FormControl>

          {selectedTags.length > 0 && (
            <VStack spacing={spacing.sm} mt={spacing.sm} align="stretch">
              <Text color={colors.text.muted} fontSize="sm" mb={spacing.sm}>
                Selected tags:
              </Text>
              <Wrap spacing={spacing.sm}>
                {selectedTags.map((tag) => (
                  <WrapItem key={tag}>
                    <Tag size="lg" borderRadius="full" variant="solid" colorScheme="blue">
                      <TagLabel>{tag}</TagLabel>
                      <TagCloseButton onClick={() => handleRemoveTag(tag)} />
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            </VStack>
          )}
        </ModalBody>

        <ModalFooter
          borderTop="1px solid"
          borderColor="whiteAlpha.200"
          pt={spacing.sm}
          display="flex"
          justifyContent="flex-end"
          gap={spacing.sm}
        >
          <Button
            variant="ghost"
            color={colors.text.primary}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleApply}
            isDisabled={selectedTags.length === 0 || isLoading}
            isLoading={isLoading}
          >
            Add Tags ({selectedTags.length})
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
