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
} from "@chakra-ui/react";
import { StarIcon, RepeatIcon, ViewIcon, EditIcon } from "@chakra-ui/icons";

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
}

export default function PromptCard({ prompt, currentUserId, onStar, onFork, onView, onEdit }: PromptCardProps) {
  const bgColor = useColorModeValue("white", "gray.800");
  const isStarred = prompt.starredBy.includes(currentUserId);
  const isOwnPrompt = currentUserId === prompt.userId;

  return (
    <Box
      p={5}
      shadow="md"
      borderWidth="1px"
      borderRadius="lg"
      bg={bgColor}
      position="relative"
    >
      <HStack justify="space-between" align="start" mb={2}>
        <Heading size="md">{prompt.title}</Heading>
        <HStack spacing={2}>
          <Tooltip label="View details">
            <IconButton
              aria-label="View prompt"
              icon={<ViewIcon />}
              colorScheme="blue"
              onClick={() => onView(prompt.id)}
            />
          </Tooltip>
          {isOwnPrompt && (
            <Tooltip label="Edit prompt">
              <IconButton
                aria-label="Edit prompt"
                icon={<EditIcon />}
                colorScheme="green"
                onClick={() => onEdit(prompt.id)}
              />
            </Tooltip>
          )}
          {!isOwnPrompt && (
            <>
              <Tooltip label={isStarred ? "Remove from starred" : "Add to starred"}>
                <IconButton
                  aria-label={isStarred ? "Unstar prompt" : "Star prompt"}
                  icon={<StarIcon />}
                  colorScheme={isStarred ? "yellow" : "gray"}
                  onClick={() => onStar(prompt.id)}
                />
              </Tooltip>
              {onFork && (
                <Tooltip label="Fork this prompt">
                  <IconButton
                    aria-label="Fork prompt"
                    icon={<RepeatIcon />}
                    colorScheme="gray"
                    onClick={() => onFork(prompt.id)}
                  />
                </Tooltip>
              )}
            </>
          )}
        </HStack>
      </HStack>
      
      {prompt.originalPromptId && (
        <Text fontSize="sm" color="gray.500" mb={2}>
          Forked from another prompt
        </Text>
      )}

      <Text noOfLines={3} mb={4}>
        {prompt.content}
      </Text>

      <HStack spacing={2} wrap="wrap">
        {prompt.tags.map((tag) => (
          <Tag key={tag} size="sm" colorScheme="blue">
            <TagLabel>{tag}</TagLabel>
          </Tag>
        ))}
      </HStack>

      <Text fontSize="sm" color="gray.500" mt={2}>
        By {prompt.user.name || prompt.user.email}
      </Text>
    </Box>
  );
}
