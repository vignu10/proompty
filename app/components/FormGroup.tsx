"use client";

import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Box,
  Flex,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";
import { ReactNode } from "react";
import { spacing } from "@/app/theme/tokens";

interface FormGroupProps {
  /**
   * Unique identifier for the form control
   */
  id?: string;

  /**
   * Label text for the form group
   */
  label?: string;

  /**
   * Whether the field is required
   * @default false
   */
  isRequired?: boolean;

  /**
   * Whether the field has an error
   * @default false
   */
  isInvalid?: boolean;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Helper text to display below the input
   */
  helperText?: string;

  /**
   * Tooltip text to display in an info icon
   */
  tooltipText?: string;

  /**
   * Label position relative to the input
   * @default "top"
   */
  labelPosition?: "top" | "left" | "right";

  /**
   * Form control children (Input, Select, etc.)
   */
  children: ReactNode;

  /**
   * Additional props to pass to FormControl
   */
  FormControlProps?: React.ComponentProps<typeof FormControl>;
}

/**
 * Consistent form group component with proper label, error, and helper text handling.
 *
 * @example
 * <FormGroup
 *   id="email"
 *   label="Email Address"
 *   isRequired
 *   error={errors.email}
 *   helperText="We'll never share your email"
 * >
 *   <Input id="email" type="email" />
 * </FormGroup>
 */
export default function FormGroup({
  id,
  label,
  isRequired = false,
  isInvalid = false,
  error,
  helperText,
  tooltipText,
  labelPosition = "top",
  children,
  FormControlProps = {},
}: FormGroupProps) {
  const labelContent = (
    <Flex align="center" gap={spacing.xs}>
      {label}
      {tooltipText && (
        <Tooltip label={tooltipText} placement="top" hasArrow>
          <InfoIcon color="gray.400" boxSize={3} />
        </Tooltip>
      )}
    </Flex>
  );

  // Pre-compute props to avoid complex conditional spread
  const controlProps: React.ComponentProps<typeof FormControl> = {
    id,
    isRequired,
    isInvalid,
    display: labelPosition === "left" ? "flex" : "block",
    flexDirection: labelPosition === "left" ? "row" : "column",
    alignItems: labelPosition === "left" ? "center" : "flex-start",
    gap: labelPosition === "left" ? spacing.sm : undefined,
    ...FormControlProps,
  };

  return (
    <FormControl {...controlProps}>
      {label && labelPosition !== "right" && (
        <FormLabel mb={spacing.xs}>{labelContent}</FormLabel>
      )}

      {children}

      {label && labelPosition === "right" && (
        <FormLabel mb={0} ml={spacing.sm}>
          {labelContent}
        </FormLabel>
      )}

      {error && <FormErrorMessage>{error}</FormErrorMessage>}

      {helperText && !error && (
        <FormHelperText mt={spacing.xs}>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
}

/**
 * Checkbox-specific form group with label on the left
 */
interface CheckboxGroupProps {
  id?: string;
  label?: string;
  isRequired?: boolean;
  isInvalid?: boolean;
  error?: string;
  helperText?: string;
  children: ReactNode;
}

export function CheckboxGroup({
  id,
  label,
  isRequired = false,
  isInvalid = false,
  error,
  helperText,
  children,
}: CheckboxGroupProps) {
  return (
    <FormGroup
      id={id}
      labelPosition="left"
      isRequired={isRequired}
      isInvalid={isInvalid}
      error={error}
      helperText={helperText}
    >
      <Flex align="flex-start" gap={spacing.sm}>
        {children}
        {label && <FormLabel mb={0}>{label}</FormLabel>}
      </Flex>
    </FormGroup>
  );
}

/**
 * Radio-specific form group with consistent spacing
 */
interface RadioGroupProps {
  id?: string;
  label?: string;
  isRequired?: boolean;
  isInvalid?: boolean;
  error?: string;
  helperText?: string;
  children: ReactNode;
}

export function RadioFormGroup({
  id,
  label,
  isRequired = false,
  isInvalid = false,
  error,
  helperText,
  children,
}: RadioGroupProps) {
  return (
    <FormControl
      id={id}
      isRequired={isRequired}
      isInvalid={isInvalid}
    >
      {label && <FormLabel mb={spacing.sm}>{label}</FormLabel>}
      {children}
      {error && <FormErrorMessage mt={spacing.xs}>{error}</FormErrorMessage>}
      {helperText && !error && (
        <FormHelperText mt={spacing.xs}>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
}
