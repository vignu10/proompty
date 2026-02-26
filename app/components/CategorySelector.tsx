"use client";

import { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  useColorModeValue,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverHeader,
  PopoverArrow,
  PopoverCloseButton,
  Wrap,
  WrapItem,
  Input,
  Text,
} from "@chakra-ui/react";

export interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string | null;
  icon?: string | null;
}

interface CategorySelectorProps {
  selectedCategoryIds: string[];
  onCategoryChange: (categoryIds: string[]) => void;
  categories: Category[];
  placeholder?: string;
  isMultiSelect?: boolean;
}

export default function CategorySelector({
  selectedCategoryIds,
  onCategoryChange,
  categories,
  placeholder = "Select categories",
  isMultiSelect = true,
}: CategorySelectorProps) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const borderColor = useColorModeValue("white", "gray.200");
  const hoverBg = useColorModeValue("rgba(0, 0, 0, 0.05)", "rgba(0, 0, 0, 0.08)");

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = categories.filter((cat) =>
        cat.name.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selectedCategoryIds.includes(cat.id)
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [inputValue, categories, selectedCategoryIds]);

  const handleCategoryToggle = (categoryId: string) => {
    if (isMultiSelect) {
      if (selectedCategoryIds.includes(categoryId)) {
        onCategoryChange(selectedCategoryIds.filter((id) => id !== categoryId));
      } else {
        onCategoryChange([...selectedCategoryIds, categoryId]);
      }
    }
    setIsOpen(false);
  };

  const handleRemoveCategory = (categoryId: string) => {
    onCategoryChange(selectedCategoryIds.filter((id) => id !== categoryId));
    setIsOpen(false);
  };

  const getCategoryColor = (categoryId: string): string => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return "blue";

    // Map category names to colors
    const colorMap: Record<string, string> = {
      writing: "#00f3ff",
      code: "#9d00ff",
      marketing: "#10b981",
      design: "#f59e0b",
      business: "#d97706",
      education: "#eab308",
      creative: "#ef4444",
      productivity: "#00e5ff",
      research: "#06b6d4",
      other: "#9ca3af",
    };

    return colorMap[category.slug] || "#00f3ff";
  };

  const selectedLabel = selectedCategoryIds.length > 0
    ? `${selectedCategoryIds.length} categories selected`
    : "Select categories";

  return (
    <VStack align="stretch" spacing={2} w="100%">
      <Box position="relative">
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          borderRadius="md"
          size="lg"
          bg="space.navy"
          borderColor="whiteAlpha.200"
          color="whiteAlpha.900"
          _placeholder={{ color: "whiteAlpha.500" }}
          _focus={{
            borderColor: "#00f3ff",
            boxShadow: "0 0 8px rgba(0, 243, 255, 0.3)",
          }}
        />

        {suggestions.length > 0 && (
          <Box
            position="absolute"
            top="100%"
            left={0}
            right={0}
            zIndex={10}
            bg="space.navy"
            borderWidth="1px"
            borderColor="whiteAlpha.200"
            borderRadius="md"
            maxH="200px"
            overflowY="auto"
            boxShadow="lg"
          >
            {suggestions.map((cat) => (
              <Box
                key={cat.id}
                p={3}
                cursor="pointer"
                _hover={{ bg: hoverBg }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCategoryToggle(cat.id);
                }}
              >
                <Text color="whiteAlpha.900" fontSize="sm">
                  {cat.name}
                </Text>
              </Box>
            ))}
          </Box>
        )}

        <Popover
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          placement="bottom-start"
          closeOnBlur={true}
        >
          <PopoverTrigger>
            <Box
              cursor="pointer"
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="md"
              p={3}
              aria-label={selectedLabel}
            >
              <Text color="whiteAlpha.900">
                {selectedCategoryIds.length > 0
                  ? `${selectedCategoryIds.length} selected`
                  : placeholder}
              </Text>
            </Box>
          </PopoverTrigger>

          <PopoverContent
            w="300px"
            maxH="400px"
            overflowY="auto"
            bg="space.darkNavy"
            borderWidth="1px"
            borderColor="whiteAlpha.200"
            borderRadius="lg"
            boxShadow="xl"
            p={4}
          >
            <PopoverHeader borderBottom="1px solid" borderColor="whiteAlpha.200" pb={3}>
              <Text color="whiteAlpha.900" fontWeight="semibold">
                Select Categories
              </Text>
            </PopoverHeader>

            <PopoverBody py={3}>
              <VStack align="stretch" spacing={2}>
                {categories.map((cat) => {
                  const isSelected = selectedCategoryIds.includes(cat.id);

                  return (
                    <Box
                      key={cat.id}
                      p={3}
                      cursor="pointer"
                      borderRadius="md"
                      bg={isSelected ? "rgba(0, 243, 255, 0.1)" : "transparent"}
                      _hover={{ bg: hoverBg }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCategoryToggle(cat.id);
                      }}
                    >
                      <HStack justify="space-between" align="center">
                        <Text color="whiteAlpha.900" fontSize="sm">
                          {cat.name}
                        </Text>
                        {isSelected && (
                          <Tag
                            size="sm"
                            borderRadius="full"
                            variant="solid"
                            colorScheme="blue"
                            mr={2}
                          >
                            <TagLabel>{cat.name}</TagLabel>
                            <TagCloseButton onClick={() => handleRemoveCategory(cat.id)} />
                          </Tag>
                        )}
                      </HStack>
                    </Box>
                  );
                })}
              </VStack>
            </PopoverBody>
          </PopoverContent>
        </Popover>

        {selectedCategoryIds.length > 0 && (
          <Wrap spacing={2} mt={3}>
            {selectedCategoryIds.map((catId) => {
              const cat = categories.find((c) => c.id === catId);
              return (
                <WrapItem key={catId}>
                  <Tag
                    size="lg"
                    borderRadius="full"
                    variant="solid"
                    colorScheme="blue"
                  >
                    <TagLabel>{cat?.name || "Category"}</TagLabel>
                    <TagCloseButton onClick={() => handleRemoveCategory(catId)} />
                  </Tag>
                </WrapItem>
              );
            })}
          </Wrap>
        )}
      </Box>
    </VStack>
  );
}
