"use client";

import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { ChangeEvent } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = "Search prompts..." }: SearchBarProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <InputGroup>
      <InputLeftElement pointerEvents="none">
        <SearchIcon color="gray.400" />
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
  );
}
