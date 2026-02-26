"use client";

import {
  Box,
  Heading,
  Text,
  HStack,
  Tag,
  TagLabel,
  Button,
  IconButton,
  useColorModeValue,
  Badge,
} from "@chakra-ui/react";
import { ViewIcon, StarIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
import { CategoryBadges } from "./CategoryBadge";

export interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string | null;
  icon?: string | null;
}

interface Template {
  id: string;
  title: string;
  content: string;
  tags: string[];
  useCount: number;
  createdAt: string;
  userId: string;
  isPublic: boolean;
  user: {
    name: string | null;
    email: string;
  };
  categories?: {
    category: Category;
    sortOrder: number;
  }[];
}

interface TemplateCardProps {
  template: Template;
  currentUserId: string;
  onUseTemplate: (templateId: string) => void;
  onView: (templateId: string) => void;
}

export default function TemplateCard({
  template,
  currentUserId,
  onUseTemplate,
  onView,
}: TemplateCardProps) {
  const bgColor = useColorModeValue("white", "gray.800");
  const isOwnTemplate = currentUserId === template.userId;

  return (
    <Box
      as="article"
      p={5}
      shadow="md"
      borderWidth="1px"
      borderRadius="lg"
      bg={bgColor}
      position="relative"
      onClick={() => onView(template.id)}
      cursor="pointer"
      height="100%"
      display="flex"
      flexDirection="column"
      _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
      transition="all 0.2s"
      borderColor="blue.200"
    >
      {/* Template Badge */}
      <Badge
        position="absolute"
        top={2}
        left={2}
        colorScheme="blue"
        variant="solid"
        size="sm"
      >
        Template
      </Badge>

      {/* Use Count Badge */}
      {template.useCount > 0 && (
        <Badge
          position="absolute"
          top={2}
          right={2}
          colorScheme="green"
          variant="subtle"
          size="sm"
        >
          {template.useCount} uses
        </Badge>
      )}

      <Box mb={4} position="relative">
        <Heading size="md" pr={16}>
          {template.title}
        </Heading>
      </Box>

      <Text noOfLines={3} mb={4} flex="1">
        {template.content}
      </Text>

      <Box mt="auto" flex="none">
        {template.categories && template.categories.length > 0 && (
          <HStack spacing={2} wrap="wrap" mb={3}>
            <CategoryBadges
              categories={template.categories.map((pc) => pc.category)}
              size="sm"
              variant="subtle"
              maxDisplay={3}
            />
          </HStack>
        )}

        <HStack spacing={2} wrap="wrap" mb={3}>
          {template.tags.map((tag) => (
            <Tag key={tag} size="sm" colorScheme="blue">
              <TagLabel>{tag}</TagLabel>
            </Tag>
          ))}
        </HStack>

        <HStack
          spacing={3}
          justify="space-between"
          align="center"
          mt={2}
        >
          <Text fontSize="sm" color="gray.500">
            By {template.user.name || template.user.email}
          </Text>

          <Button
            size="sm"
            colorScheme="blue"
            leftIcon={<ViewIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onUseTemplate(template.id);
            }}
          >
            Use Template
          </Button>
        </HStack>
      </Box>
    </Box>
  );
}
