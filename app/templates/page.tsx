"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  useToast,
  Button,
  HStack,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import TemplateGallery from "@/app/components/TemplateGallery";

export default function TemplatesPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleUseTemplate = (templateId: string) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to use templates",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      router.push("/login");
      return;
    }

    // Navigate to new prompt page with template prefilled
    router.push(`/prompts/new?template=${templateId}`);
  };

  const handleViewTemplate = (templateId: string) => {
    router.push(`/prompts/${templateId}`);
  };

  return (
    <Box bg="space.navy" minH="calc(100vh - 64px)">
      <Container maxW="container.xl" py={12}>
        <VStack spacing={8} align="stretch">
          <HStack>
            <Button
              leftIcon={<ArrowBackIcon />}
              variant="ghost"
              color="whiteAlpha.900"
              onClick={() => router.push("/prompts")}
            >
              Back to Prompts
            </Button>
          </HStack>

          <TemplateGallery
            currentUserId={user?.id || ""}
            onUseTemplate={handleUseTemplate}
            onViewTemplate={handleViewTemplate}
          />
        </VStack>
      </Container>
    </Box>
  );
}
