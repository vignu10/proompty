"use client";

import { Button } from "@chakra-ui/react";
import { buttonVariants } from "@/app/theme/tokens";

export interface BaseButtonProps {
  variant?: keyof typeof buttonVariants;
  children?: React.ReactNode;
}

export default function BaseButton({ variant = "primary", ...props }: BaseButtonProps) {
  const variantStyles = buttonVariants[variant] || buttonVariants.primary;

  return (
    <Button {...variantStyles} variant={variant}>
      {props.children}
    </Button>
  );
}
