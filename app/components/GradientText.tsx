"use client";

import { Text, TextProps } from "@chakra-ui/react";
import { colors } from "@/app/theme/tokens";

interface GradientTextProps extends Omit<TextProps, "bgGradient" | "bgClip"> {
  /**
   * Gradient preset to use. Use "solid" for normal text.
   * @default "primary"
   */
  variant?: "primary" | "secondary" | "accent" | "solid";

  /**
   * Text color to use when variant is "solid"
   * @default "primary.50"
   */
  color?: string;
}

/**
 * Gradient text component that replaces direct bgGradient usage.
 *
 * IMPORTANT: Use "variant='solid'" for most cases to avoid accessibility issues.
 * Only use gradient variants for large headings that don't affect content readability.
 *
 * @example
 * // Recommended - solid color for accessibility
 * <GradientText variant="solid">Heading</GradientText>
 *
 * // Only use for large decorative headings
 * <GradientText variant="primary" fontSize="4xl">Page Title</GradientText>
 */
export default function GradientText({
  variant = "primary",
  color = colors.primary[50],
  children,
  ...props
}: GradientTextProps) {
  // For solid variant, use normal text color (most accessible)
  if (variant === "solid") {
    return (
      <Text color={color} {...props}>
        {children}
      </Text>
    );
  }

  // Gradient presets - use sparingly for decorative headings only
  const gradients = {
    primary: "linear(to-r, blue.400, purple.500)",
    secondary: "linear(to-r, cyan.400, blue.500)",
    accent: "linear(to-r, purple.400, pink.500)",
  };

  return (
    <Text
      bgGradient={gradients[variant]}
      bgClip="text"
      fontWeight="bold"
      {...props}
    >
      {children}
    </Text>
  );
}

/**
 * Convenient export for gradient span within text
 */
export function GradientSpan({
  variant = "primary",
  children,
}: Pick<GradientTextProps, "variant" | "children">) {
  return <GradientText as="span" variant={variant}>{children}</GradientText>;
}
