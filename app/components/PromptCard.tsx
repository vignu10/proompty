"use client";

import {
  Box,
  Heading,
  Text,
  HStack,
  Tag,
  TagLabel,
  IconButton,
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
}

interface PromptCardProps {
  prompt: Prompt;
  currentUserId: string;
  onStar: (promptId: string) => Promise<void>;
  onFork?: (promptId: string) => Promise<void>;
  onView: (promptId: string) => void;
  onEdit: (promptId: string) => void;
  onDelete?: (promptId: string) => Promise<void>;
}

export default function PromptCard({ prompt, currentUserId, onStar, onFork, onView, onEdit, onDelete }: PromptCardProps) {
  const bgColor = useColorModeValue("white", "gray.800");
  const isStarred = prompt.starredBy.includes(currentUserId);
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
      _hover={{ shadow: 'lg' }}
    >
      <Box mb={6} position="relative">
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
                <IconButton
                  aria-label="Edit prompt"
                  icon={<EditIcon />}
                  size="sm"
                  colorScheme="green"
                  variant="ghost"
                  onClick={() => onEdit(prompt.id)}
                />
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
                <IconButton
                  aria-label={isStarred ? "Unstar prompt" : "Star prompt"}
                  icon={<StarIcon />}
                  size="sm"
                  colorScheme={isStarred ? "yellow" : "gray"}
                  variant="ghost"
                  onClick={() => onStar(prompt.id)}
                />
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

      <Text noOfLines={3} mb={4}>
        {prompt.content}
      </Text>

      <Box mt="auto">
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
