"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  IconButton,
  Tag,
  Text,
  VStack,
  useToast,
  Spinner,
  Badge,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Stack,
  HStack,
  Tooltip,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { useRouter } from "next/navigation";
import {
  containerStyles,
  gradientTextStyles,
  featureCardStyles,
} from "../styles/components";

interface User {
  name: string | null;
  email: string;
}

interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string | null;
  tags: string[];
  createdAt: string;
  isPublic: boolean;
  userId: string;
  user: User;
}

export default function PromptsPage() {
  const { user, token } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const toast = useToast();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetchPrompts();
  }, [token]);

  const fetchPrompts = async () => {
    try {
      const response = await fetch("/api/prompts", {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      });

      if (!response.ok) {
        throw new Error("Failed to fetch prompts");
      }

      const data = await response.json();
      setPrompts(data);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load prompts",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setSelectedPromptId(id);
    onOpen();
  };

  const deletePrompt = async () => {
    if (!selectedPromptId) return;

    try {
      const response = await fetch(`/api/prompts/${selectedPromptId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete prompt");
      }

      setPrompts(prompts.filter((prompt) => prompt.id !== selectedPromptId));
      toast({
        title: "Success",
        description: "Prompt deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete prompt",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      onClose();
      setSelectedPromptId(null);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="60vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Flex>
    );
  }

  return (
    <Container {...containerStyles}>
      <VStack spacing={8} align="stretch">
        <Flex justify="space-between" align="center">
          <Box>
            <Heading size="lg" mb={2} {...gradientTextStyles}>
              {user ? "My Prompts" : "Public Prompts"}
            </Heading>
            <Text color="whiteAlpha.700" fontSize="lg" letterSpacing="wide">
              {prompts.length}{" "}
              {user ? "prompts in your collection" : "public prompts available"}
            </Text>
          </Box>
          <Button
            leftIcon={<AddIcon />}
            variant="cyber"
            size="lg"
            onClick={() => router.push("/prompts/new")}
          >
            Create New Prompt
          </Button>
        </Flex>

        {prompts.length === 0 ? (
          <Text fontSize="lg" textAlign="center">
            You don't have any prompts yet. Create your first prompt to get
            started!
          </Text>
        ) : (
          <Grid
            templateColumns={{
              base: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            }}
            gap={6}
            sx={{
              "& > *": {
                transform: "perspective(1000px) rotateX(5deg)",
                transition: "transform 0.3s ease-in-out",
                "&:hover": {
                  transform:
                    "perspective(1000px) rotateX(0deg) translateY(-10px)",
                },
              },
            }}
          >
            {prompts.map((prompt) => (
              <Card key={prompt.id} size="lg" {...featureCardStyles.container}>
                <Box {...featureCardStyles.wrapper}>
                  <CardHeader>
                    <Flex justify="space-between" align="start" mb={2}>
                      <Heading size="md" noOfLines={2} flex={1} color="white">
                        {prompt.title}
                      </Heading>
                      <Badge
                        ml={2}
                        bg={prompt.isPublic ? "green.500" : "orange.500"}
                        color="white"
                        px={2}
                        py={1}
                        borderRadius="md"
                        fontSize="xs"
                        textTransform="uppercase"
                        letterSpacing="wide"
                        sx={{
                          boxShadow: prompt.isPublic
                            ? "0 0 10px rgba(72, 187, 120, 0.3)"
                            : "0 0 10px rgba(237, 137, 54, 0.3)",
                        }}
                      >
                        {prompt.isPublic ? "Public" : "Private"}
                      </Badge>
                    </Flex>
                    {prompt.user && (
                      <Text fontSize="sm" color="whiteAlpha.700">
                        By {prompt.user.name || prompt.user.email}
                      </Text>
                    )}
                  </CardHeader>

                  <CardBody>
                    <Stack spacing={4}>
                      <Text noOfLines={3} color="whiteAlpha.800">
                        {prompt.content}
                      </Text>

                      {prompt.category && (
                        <Badge
                          bg="neon.purple"
                          color="white"
                          alignSelf="start"
                          sx={{
                            boxShadow: "0 0 10px rgba(157, 0, 255, 0.3)",
                          }}
                        >
                          {prompt.category}
                        </Badge>
                      )}

                      {prompt.tags.length > 0 && (
                        <Flex gap={2} wrap="wrap">
                          {prompt.tags.map((tag, index) => (
                            <Tag
                              key={index}
                              size="md"
                              bg="space.navy"
                              color="neon.blue"
                              border="1px solid"
                              borderColor="neon.blue"
                              boxShadow="0 0 10px rgba(0, 243, 255, 0.2)"
                              _hover={{
                                transform: "translateY(-1px)",
                                boxShadow: "0 0 15px rgba(0, 243, 255, 0.4)",
                              }}
                            >
                              {tag}
                            </Tag>
                          ))}
                        </Flex>
                      )}
                    </Stack>
                  </CardBody>

                  <CardFooter>
                    <HStack spacing={2} justify="flex-end" width="100%">
                      {user && prompt.userId === user.id && (
                        <>
                          <Tooltip label="Edit prompt">
                            <IconButton
                              aria-label="Edit prompt"
                              icon={<EditIcon />}
                              variant="neon"
                              onClick={() =>
                                router.push(`/prompts/${prompt.id}/edit`)
                              }
                              sx={{
                                "&:hover": {
                                  transform: "rotate(15deg) scale(1.1)",
                                },
                              }}
                            />
                          </Tooltip>
                          <Tooltip label="Delete prompt">
                            <IconButton
                              icon={<DeleteIcon />}
                              aria-label="Delete prompt"
                              variant="ghost"
                              color="red.400"
                              onClick={() => handleDeleteClick(prompt.id)}
                              sx={{
                                "&:hover": {
                                  bg: "rgba(229, 62, 62, 0.2)",
                                  color: "red.300",
                                  transform: "rotate(-15deg) scale(1.1)",
                                },
                              }}
                            />
                          </Tooltip>
                        </>
                      )}
                    </HStack>
                  </CardFooter>
                </Box>
              </Card>
            ))}
          </Grid>
        )}

        <AlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent
              bg="space.navy"
              borderColor="whiteAlpha.200"
              sx={{
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: "-2px",
                  left: "-2px",
                  right: "-2px",
                  bottom: "-2px",
                  background: "linear-gradient(45deg, #00f3ff, #9d00ff)",
                  zIndex: -1,
                  opacity: 0.2,
                },
              }}
            >
              <AlertDialogHeader
                fontSize="lg"
                fontWeight="bold"
                bgGradient="linear(to-r, red.500, red.300)"
                bgClip="text"
                letterSpacing="wide"
              >
                Delete Prompt
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure? This action cannot be undone.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose} variant="neon">
                  Cancel
                </Button>
                <Button
                  onClick={deletePrompt}
                  ml={3}
                  bg="red.500"
                  color="white"
                  _hover={{
                    bg: "red.600",
                    boxShadow: "0 0 15px rgba(229, 62, 62, 0.5)",
                  }}
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </VStack>
    </Container>
  );
}
