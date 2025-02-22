"use client";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  VStack,
  HStack,
  Tag,
  useToast,
  Box,
  Flex,
  Heading,
  IconButton,
  Tooltip,
  TagLabel,
} from "@chakra-ui/react";
import { CopyIcon, StarIcon, RepeatIcon } from "@chakra-ui/icons";

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

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt | null;
  currentUserId?: string;
  onStar?: (promptId: string) => Promise<void>;
  onFork?: (promptId: string) => Promise<void>;
}

export default function PromptModal({
  isOpen,
  onClose,
  prompt,
  currentUserId,
  onStar,
  onFork,
}: PromptModalProps) {
  const toast = useToast();

  if (!prompt) return null;

  const isStarred = currentUserId && prompt.starredBy?.includes(currentUserId);
  const isOwnPrompt = currentUserId === prompt.userId;

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content);
    toast({
      title: "Prompt copied!",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleStar = async () => {
    if (!currentUserId || !onStar) return;
    try {
      await onStar(prompt.id);
      toast({
        title: prompt.starredBy.includes(currentUserId)
          ? "Removed from starred"
          : "Added to starred",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to update star status",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleFork = async () => {
    if (!currentUserId || !onFork) return;
    try {
      await onFork(prompt.id);
      toast({
        title: "Prompt forked successfully!",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to fork prompt",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent bg="gray.900" borderColor="whiteAlpha.200" boxShadow="xl">
        <Box
          position="sticky"
          top={0}
          zIndex={1}
          borderBottom="1px"
          borderColor="whiteAlpha.200"
          p={4}
        >
          <Flex justify="space-between" align="center">
            <Heading size="lg" color="whiteAlpha.900">
              {prompt.title}
            </Heading>
            <HStack spacing={2}>
              {currentUserId && !isOwnPrompt && (
                <>
                  <Tooltip
                    label={isStarred ? "Remove from starred" : "Add to starred"}
                  >
                    <IconButton
                      aria-label="Star prompt"
                      icon={<StarIcon />}
                      colorScheme={isStarred ? "yellow" : "whiteAlpha"}
                      variant="ghost"
                      onClick={handleStar}
                    />
                  </Tooltip>
                  <Tooltip label="Fork this prompt">
                    <IconButton
                      aria-label="Fork prompt"
                      icon={<RepeatIcon />}
                      colorScheme="whiteAlpha"
                      variant="ghost"
                      onClick={handleFork}
                    />
                  </Tooltip>
                </>
              )}
              <Tooltip label="Copy prompt">
                <IconButton
                  aria-label="Copy prompt"
                  icon={<CopyIcon />}
                  colorScheme="white"
                  variant="ghost"
                  onClick={handleCopy}
                />
              </Tooltip>
              <ModalCloseButton position="static" color="whiteAlpha.800" />
            </HStack>
          </Flex>
        </Box>

        <ModalBody p={6}>
          <VStack align="stretch" spacing={4}>
            {prompt.originalPromptId && (
              <Text fontSize="sm" color="whiteAlpha.700">
                Forked from another prompt
              </Text>
            )}

            <Box bg="whiteAlpha.100" p={4} borderRadius="md">
              <Text whiteSpace="pre-wrap" color="whiteAlpha.900">
                {prompt.content}
              </Text>
            </Box>

            <HStack wrap="wrap" spacing={2}>
              {prompt.tags?.map((tag) => (
                <Tag key={tag} size="md" variant="subtle" colorScheme="blue">
                  <TagLabel>{tag}</TagLabel>
                </Tag>
              ))}
            </HStack>

            <Text fontSize="sm" color="whiteAlpha.700">
              Created by {prompt.user.name || prompt.user.email}
            </Text>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
