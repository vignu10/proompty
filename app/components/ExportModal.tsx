"use client";

import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  VStack,
  HStack,
  Text,
  Radio,
  RadioGroup,
  Checkbox,
  useToast,
  Divider,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { spacing, colors } from "@/app/theme/tokens";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: "json" | "csv", includeMetadata: boolean) => void;
  promptCount?: number;
}

export default function ExportModal({
  isOpen,
  onClose,
  onExport,
  promptCount = 0,
}: ExportModalProps) {
  const [format, setFormat] = useState<"json" | "csv">("json");
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const toast = useToast();

  const handleExport = async () => {
    // Validation: Ensure there are prompts to export
    if (promptCount === 0) {
      toast({
        title: "Export failed",
        description: "No prompts selected for export",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setIsExporting(true);
    try {
      await onExport(format, includeMetadata);
      onClose();
      toast({
        title: "Export successful",
        description: `Exported ${promptCount} prompt${promptCount > 1 ? 's' : ''} as ${format.toUpperCase()}`,
        status: "success",
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: "Export failed",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay bg="rgba(0, 0, 0, 0.4)" backdropFilter="blur(8px)" />
      <ModalContent
        bg={colors.background.elevated}
        borderColor="whiteAlpha.200"
        borderWidth="1px"
        borderRadius="xl"
        boxShadow="0 8px 32px rgba(0, 243, 255, 0.1)"
      >
        <ModalHeader
          borderBottom="1px solid"
          borderColor="whiteAlpha.200"
          pb={spacing.sm}
        >
          <Text color={colors.primary[50]} fontWeight="bold">
            Export Prompts
          </Text>
        </ModalHeader>

        <ModalBody py={spacing.md}>
          <VStack spacing={spacing.md} align="stretch">
            <Text color={colors.text.muted} fontSize="sm">
              {promptCount > 0
                ? `Choose the export format for ${promptCount} selected prompt${promptCount > 1 ? 's' : ''}.`
                : "Choose the export format for your prompts."}
            </Text>

            {promptCount === 0 && (
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Text fontSize="sm">No prompts selected for export</Text>
              </Alert>
            )}

            <VStack align="stretch" spacing={spacing.sm}>
              <Text color={colors.text.primary} fontWeight="semibold">
                Export Format
              </Text>
              <RadioGroup value={format} onChange={(v) => setFormat(v as any)}>
                <VStack align="stretch" spacing={spacing.sm}>
                  <Radio value="json" colorScheme="blue">
                    <HStack>
                      <Text color={colors.text.primary}>JSON</Text>
                      <Text color={colors.text.muted} fontSize="sm" ml={spacing.xs}>
                        - Full data, machine-readable
                      </Text>
                    </HStack>
                  </Radio>
                  <Radio value="csv" colorScheme="blue">
                    <HStack>
                      <Text color={colors.text.primary}>CSV</Text>
                      <Text color={colors.text.muted} fontSize="sm" ml={spacing.xs}>
                        - Spreadsheet compatible
                      </Text>
                    </HStack>
                  </Radio>
                </VStack>
              </RadioGroup>
            </VStack>

            <Divider borderColor="whiteAlpha.200" />

            <Checkbox
              isChecked={includeMetadata}
              onChange={(e) => setIncludeMetadata(e.target.checked)}
              colorScheme="blue"
            >
              <Text color={colors.text.primary}>
                Include metadata (categories, tags, timestamps)
              </Text>
            </Checkbox>
          </VStack>
        </ModalBody>

        <ModalFooter
          borderTop="1px solid"
          borderColor="whiteAlpha.200"
          pt={spacing.sm}
        >
          <HStack spacing={spacing.sm} width="100%" justify="flex-end">
            <Button
              variant="ghost"
              onClick={onClose}
              color={colors.text.primary}
              isDisabled={isExporting}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleExport}
              isLoading={isExporting}
              isDisabled={promptCount === 0}
            >
              Export ({promptCount})
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
