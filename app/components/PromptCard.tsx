"use client";

import {
  Box,
  Heading,
  Text,
  HStack,
  Tag,
  TagLabel,
  IconButton,
  Checkbox,
  useColorModeValue,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Button,
  Center,
  VStack,
} from "@chakra-ui/react";
import { StarIcon, RepeatIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { CategoryBadges } from "./CategoryBadge";

export interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string | null;
  icon?: string | null;
}

interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  isPublic: boolean;
  userId: string;
  originalPromptId?: string | null;
  starredBy: string[];
  user: {
    name: string | null;
    email: string;
  };
  categories?: {
    category: Category;
    sortOrder: number;
  }[];
}

interface PromptCardProps {
  prompt: Prompt;
  currentUserId: string;
  onStar?: (promptId: string) => Promise<void>;
  onFork?: (promptId: string) => Promise<void>;
  onView: (promptId: string) => void;
  onEdit?: (promptId: string) => void;
  onDelete?: (promptId: string) => Promise<void>;
  isSelected?: boolean;
  onToggleSelect?: (promptId: string) => void;
}

export default function PromptCard({
  prompt,
  currentUserId,
  onStar,
  onFork,
  onView,
  onEdit,
  onDelete,
  isSelected,
  onToggleSelect
}: PromptCardProps) {
  const bgColor = useColorModeValue("white", "gray.800");
  const isStarred = prompt.starredBy?.includes(currentUserId);
  const isOwnPrompt = currentUserId === prompt.userId;

  return (
    <Box
      as="article"
      p={5}
      shadow="md"
      borderWidth="1px"
      borderRadius="lg"
      bg={bgColor}
      position="relative"
      onClick={() => onView(prompt.id)}
      cursor="pointer"
      height="100%"
      display="flex"
      flexDirection="column"
      _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
      transition="all 0.2s"
      borderColor={isSelected ? "blue.400" : undefined}
    >
      {/* Selection Checkbox */}
      {onToggleSelect && (
        <Checkbox
          position="absolute"
          top={2}
          left={2}
          zIndex={10}
          isChecked={isSelected}
          onChange={() => onToggleSelect(prompt.id)}
          onClick={(e) => e.stopPropagation()}
          colorScheme="blue"
          size="lg"
          aria-label={`Select ${prompt.title}`}
          _focusVisible={{
            boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)",
            ring: "2px",
            ringColor: "blue.400",
          }}
        />
      )}

      <Box mb={6} position="relative" flex="none" pl={onToggleSelect ? 8 : 0}>
        <Heading size="md" pr={24}>{prompt.title}</Heading>

        <Box
          position="absolute"
          top={0}
          right={0}
          onClick={(e) => e.stopPropagation()}
        >
          <HStack spacing={1}>
            {isOwnPrompt ? (
              <>
                {onEdit && (
                  <IconButton
                    aria-label="Edit prompt"
                    icon={<EditIcon />}
                    size="sm"
                    colorScheme="green"
                    variant="ghost"
                    onClick={() => onEdit(prompt.id)}
                  />
                )}
                {onDelete && (
                  <IconButton
                    aria-label="Delete prompt"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => onDelete(prompt.id)}
                  />
                )}
              </>
            ) : (
              <>
                {onStar && (
                  <IconButton
                    aria-label={isStarred ? "Unstar prompt" : "Star prompt"}
                    icon={<StarIcon />}
                    size="sm"
                    colorScheme={isStarred ? "yellow" : "gray"}
                    variant="ghost"
                    onClick={() => onStar(prompt.id)}
                  />
                )}
                {onFork && (
                  <IconButton
                    aria-label="Clone prompt"
                    icon={<RepeatIcon />}
                    size="sm"
                    colorScheme="gray"
                    variant="ghost"
                    onClick={() => onFork(prompt.id)}
                  />
                )}
              </>
            )}
          </HStack>
        </Box>
      </Box>

      {prompt.originalPromptId && (
        <Text fontSize="sm" color="gray.500" mb={2}>
          Forked from another prompt
        </Text>
      )}

      <Text noOfLines={3} mb={4} flex="1">
        {prompt.content}
      </Text>

      <Box mt="auto" flex="none">
        {prompt.categories && prompt.categories.length > 0 && (
          <HStack spacing={2} wrap="wrap" mb={3}>
            <CategoryBadges
              categories={prompt.categories.map((pc) => pc.category)}
              size="sm"
              variant="subtle"
              maxDisplay={3}
            />
          </HStack>
        )}

        <HStack spacing={2} wrap="wrap" mb={3}>
          {prompt.tags.map((tag) => (
            <Tag key={tag} size="sm" colorScheme="blue">
              <TagLabel>{tag}</TagLabel>
            </Tag>
          ))}
        </HStack>

        <Text fontSize="sm" color="gray.500">
          By {prompt.user.name || prompt.user.email}
        </Text>
      </Box>
    </Box>
  );
}
