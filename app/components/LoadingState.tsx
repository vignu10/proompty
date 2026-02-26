"use client";

import { Spinner, VStack, Text, Box } from "@chakra-ui/react";
import { colors, spacing } from "@/app/theme/tokens";

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showOverlay?: boolean;
}

export default function LoadingState({
  message,
  size = "md",
  showOverlay = false,
}: LoadingStateProps) {
  return (
    <VStack spacing={spacing.md} align="center" py={spacing.lg}>
      <Spinner
        size={size}
        color="colors.primary[50]}
        thickness="4px"
        speed="0.65s"
        emptyColor="transparent"
      />

      {message && (
        <Text
          color={colors.text.muted}
          fontSize="sm"
          mt={spacing.sm}
          textAlign="center"
        >
          {message}
        </Text>
      )}

      {showOverlay && (
        <Box
          position="fixed"
          inset={0}
          bg="rgba(0, 0, 0, 0.7)"
          zIndex={1400}
          display="flex"
          alignItems="center"
          justifyContent="center"
        />
      )}
    </VStack>
  );
}
