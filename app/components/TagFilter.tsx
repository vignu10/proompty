"use client";

import {
  Box,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Input,
  VStack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";

interface TagFilterProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  availableTags: string[];
}

export default function TagFilter({
  selectedTags,
  onTagsChange,
  availableTags,
}: TagFilterProps) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = availableTags.filter(
        (tag) =>
          tag.toLowerCase().includes(inputValue.toLowerCase()) &&
          !selectedTags.includes(tag)
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [inputValue, availableTags, selectedTags]);

  const handleTagSelect = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      onTagsChange([...selectedTags, tag]);
    }
    setInputValue("");
    setSuggestions([]);
  };

  const handleTagRemove = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <VStack align="stretch" spacing={2} w="100%">
      <Box position="relative">
        <Input
          placeholder="Filter by tags..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          borderRadius="md"
        />
        {suggestions.length > 0 && (
          <Box
            position="absolute"
            top="100%"
            left={0}
            right={0}
            zIndex={1}
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="md"
            boxShadow="sm"
            maxH="200px"
            overflowY="auto"
          >
            {suggestions.map((tag) => (
              <Box
                key={tag}
                p={2}
                cursor="pointer"
                _hover={{ bg: "gray.100" }}
                onClick={() => handleTagSelect(tag)}
              >
                <Text fontSize="sm">{tag}</Text>
              </Box>
            ))}
          </Box>
        )}
      </Box>
      <HStack spacing={2} wrap="wrap">
        {selectedTags.map((tag) => (
          <Tag
            key={tag}
            size="md"
            borderRadius="full"
            variant="solid"
            colorScheme="blue"
          >
            <TagLabel>{tag}</TagLabel>
            <TagCloseButton onClick={() => handleTagRemove(tag)} />
          </Tag>
        ))}
      </HStack>
    </VStack>
  );
}
