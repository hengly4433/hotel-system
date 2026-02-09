"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  alpha,
} from "@mui/material";
import {
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";

export type ConfirmDialogVariant = "danger" | "warning" | "info";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmDialogVariant;
  loading?: boolean;
}

const variantConfig = {
  danger: {
    icon: DeleteIcon,
    color: tokens.colors.primary.main,
    bgColor: alpha(tokens.colors.primary.main, 0.1),
    gradient: `linear-gradient(135deg, ${tokens.colors.primary.main} 0%, ${tokens.colors.primary.dark} 100%)`,
  },
  warning: {
    icon: WarningIcon,
    color: tokens.colors.warning.main,
    bgColor: alpha(tokens.colors.warning.main, 0.1),
    gradient: `linear-gradient(135deg, ${tokens.colors.warning.main} 0%, ${tokens.colors.warning.dark} 100%)`,
  },
  info: {
    icon: InfoIcon,
    color: tokens.colors.primary.main,
    bgColor: alpha(tokens.colors.primary.main, 0.1),
    gradient: `linear-gradient(135deg, ${tokens.colors.primary.main} 0%, ${tokens.colors.primary.dark} 100%)`,
  },
};

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const config = variantConfig[variant];
  const IconComponent = config.icon;

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Confirm action failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading = loading || isProcessing;

  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          overflow: "hidden",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pt: 4,
          pb: 2,
          px: 3,
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            bgcolor: config.bgColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
          }}
        >
          <IconComponent sx={{ fontSize: 32, color: config.color }} />
        </Box>

        {/* Title */}
        <DialogTitle
          sx={{
            p: 0,
            mb: 1,
            textAlign: "center",
            fontSize: "1.25rem",
            fontWeight: 700,
            color: tokens.colors.grey[900],
          }}
        >
          {title}
        </DialogTitle>

        {/* Description */}
        {description && (
          <DialogContent sx={{ p: 0, textAlign: "center" }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ maxWidth: 280, mx: "auto" }}
            >
              {description}
            </Typography>
          </DialogContent>
        )}
      </Box>

      {/* Actions */}
      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          pt: 2,
          gap: 1.5,
          justifyContent: "center",
        }}
      >
        <Button
          onClick={onClose}
          disabled={isLoading}
          variant="outlined"
          sx={{
            flex: 1,
            py: 1.25,
            borderRadius: "12px",
            borderColor: tokens.colors.grey[300],
            color: tokens.colors.grey[700],
            fontWeight: 600,
            "&:hover": {
              borderColor: tokens.colors.grey[400],
              bgcolor: tokens.colors.grey[50],
            },
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isLoading}
          variant="contained"
          sx={{
            flex: 1,
            py: 1.25,
            borderRadius: "12px",
            background: config.gradient,
            fontWeight: 600,
            boxShadow: `0 4px 14px ${alpha(config.color, 0.35)}`,
            "&:hover": {
              boxShadow: `0 6px 20px ${alpha(config.color, 0.45)}`,
            },
            "&:disabled": {
              background: tokens.colors.grey[300],
              color: tokens.colors.grey[500],
            },
          }}
        >
          {isLoading ? (
            <CircularProgress size={20} sx={{ color: "inherit" }} />
          ) : (
            confirmText
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Hook for easier usage
export function useConfirmDialog() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: ConfirmDialogVariant;
    onConfirm: () => void | Promise<void>;
  }>({
    open: false,
    title: "",
    onConfirm: () => {},
  });

  const confirm = (options: {
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: ConfirmDialogVariant;
  }): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        ...options,
        open: true,
        onConfirm: () => {
          resolve(true);
        },
      });
    });
  };

  const close = () => {
    setState((prev) => ({ ...prev, open: false }));
  };

  const DialogComponent = (
    <ConfirmDialog
      open={state.open}
      onClose={close}
      onConfirm={state.onConfirm}
      title={state.title}
      description={state.description}
      confirmText={state.confirmText}
      cancelText={state.cancelText}
      variant={state.variant}
    />
  );

  return { confirm, close, DialogComponent };
}
