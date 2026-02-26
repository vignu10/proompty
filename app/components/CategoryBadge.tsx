"use client";

import { HStack, Text, Badge } from "@chakra-ui/react";
import { colors, spacing, textStyles, fontSize, radius } from "@/app/theme/tokens";

export interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

export interface CategoryBadgeProps {
  category: Category;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  variant?: "solid" | "outline";
}

export function CategoryBadge({
  category,
  size = "sm",
  showIcon = false,
  variant = "solid",
}: CategoryBadgeProps) {
  const sizeMap = {
    sm: "sm",
    md: "md",
    lg: "lg",
  };

  return (
    <Badge
      size={sizeMap[size]}
      variant={variant}
      bgColor={category.color || colors.primary[50]}
      color={colors.text.primary}
    >
      {showIcon && category.icon && <span>{category.icon}</span>}
      {category.name}
    </Badge>
  );
}

export default CategoryBadge;

export interface CategoryBadgesProps {
  categories: Category[];
  size?: "sm" | "md" | "lg";
  maxDisplay?: number;
  showIcon?: boolean;
  variant?: "solid" | "outline";
}

export function CategoryBadges({
  categories,
  size = "sm",
  maxDisplay,
  showIcon = false,
  variant = "solid",
}: CategoryBadgesProps) {
  const displayCategories = maxDisplay
    ? categories.slice(0, maxDisplay)
    : categories;

  const remainingCount = maxDisplay
    ? categories.length - maxDisplay
    : 0;

  return (
    <HStack spacing={spacing.sm} wrap="wrap">
      {displayCategories.map((category) => (
        <CategoryBadge
          key={category.id}
          category={category}
          size={size}
          showIcon={showIcon}
          variant={variant}
        />
      ))}
      {remainingCount > 0 && (
        <Text
          as="span"
          fontSize={fontSize.sm}
          color={colors.text.muted}
          bg={colors.background.elevated}
          px={spacing.sm}
          py={spacing.xs}
          borderRadius={radius.md}
        >
          +{remainingCount}
        </Text>
      )}
    </HStack>
  );
}
