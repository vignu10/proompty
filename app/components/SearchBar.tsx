"use client";

import { Input, InputGroup, InputLeftElement, Select, HStack, Spinner } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { ChangeEvent } from "react";
import { colors, spacing } from "@/app/theme/tokens";

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
    <HStack spacing={spacing.sm} width="100%">
      <InputGroup flex={1}>
        <InputLeftElement pointerEvents="none" aria-hidden="true">
          {isSearching ? (
            <Spinner size="sm" color={colors.primary[50]} aria-label="Searching..." />
          ) : (
            <SearchIcon color={colors.text.muted} />
          )}
        </InputLeftElement>
        <Input
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          variant="futuristic"
          size="lg"
          aria-label={placeholder}
          bg={colors.background.elevated}
          borderColor="whiteAlpha.200"
          color={colors.text.primary}
          _placeholder={{ color: colors.text.muted }}
          _focus={{
            borderColor: colors.primary[50],
            boxShadow: `0 0 10px ${colors.primary[50]}40`,
          }}
        />
      </InputGroup>
      {onSearchModeChange && (
        <Select
          value={searchMode}
          onChange={(e) => onSearchModeChange(e.target.value as SearchMode)}
          size="lg"
          width="160px"
          bg={colors.background.elevated}
          borderColor="whiteAlpha.200"
          color={colors.text.primary}
          _hover={{ borderColor: colors.primary[50] }}
          _focus={{
            borderColor: colors.primary[50],
            boxShadow: `0 0 10px ${colors.primary[50]}40`,
          }}
          aria-label="Select search mode"
        >
          <option value="hybrid">Hybrid</option>
          <option value="semantic">Semantic</option>
          <option value="keyword">Keyword</option>
        </Select>
      )}
    </HStack>
  );
}
