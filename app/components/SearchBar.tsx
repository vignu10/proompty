"use client";

import { Input, InputGroup, InputLeftElement, Select, HStack, Spinner } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { ChangeEvent } from "react";

export type SearchMode = "keyword" | "semantic" | "hybrid";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchMode?: SearchMode;
  onSearchModeChange?: (mode: SearchMode) => void;
  isSearching?: boolean;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search prompts...",
  searchMode = "hybrid",
  onSearchModeChange,
  isSearching = false,
}: SearchBarProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <HStack spacing={3} width="100%">
      <InputGroup flex={1}>
        <InputLeftElement pointerEvents="none">
          {isSearching ? (
            <Spinner size="sm" color="neon.blue" />
          ) : (
            <SearchIcon color="gray.400" />
          )}
        </InputLeftElement>
        <Input
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          variant="futuristic"
          size="lg"
          _focus={{
            borderColor: "neon.blue",
            boxShadow: "0 0 10px rgba(0, 243, 255, 0.3)",
          }}
        />
      </InputGroup>
      {onSearchModeChange && (
        <Select
          value={searchMode}
          onChange={(e) => onSearchModeChange(e.target.value as SearchMode)}
          size="lg"
          width="160px"
          bg="space.navy"
          borderColor="whiteAlpha.200"
          color="whiteAlpha.900"
          _hover={{ borderColor: "neon.blue" }}
          _focus={{
            borderColor: "neon.blue",
            boxShadow: "0 0 10px rgba(0, 243, 255, 0.3)",
          }}
        >
          <option value="hybrid">Hybrid</option>
          <option value="semantic">Semantic</option>
          <option value="keyword">Keyword</option>
        </Select>
      )}
    </HStack>
  );
}
