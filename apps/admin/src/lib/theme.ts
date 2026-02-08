"use client";

import { createTheme, alpha } from "@mui/material/styles";

// Design tokens for consistent styling
const tokens = {
  colors: {
    primary: {
      light: "#c99afd",
      main: "#B572FC",
      dark: "#9345e8",
      darker: "#7c2cd4",
    },
    secondary: {
      light: "#334155",
      main: "#0f172a",
      dark: "#020617",
    },
    success: {
      light: "#4ade80",
      main: "#22c55e",
      dark: "#16a34a",
    },
    warning: {
      light: "#fbbf24",
      main: "#f59e0b",
      dark: "#d97706",
    },
    error: {
      light: "#f87171",
      main: "#ef4444",
      dark: "#dc2626",
    },
    grey: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
    },
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
    glow: "0 0 20px rgba(181, 114, 252, 0.3)",
    card: "0 4px 24px rgba(0, 0, 0, 0.06)",
    cardHover: "0 12px 32px rgba(0, 0, 0, 0.1)",
  },
  transitions: {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    base: "200ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
    spring: "400ms cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  radius: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    full: 9999,
  },
};

export const theme = createTheme({
  palette: {
    primary: {
      light: tokens.colors.primary.light,
      main: tokens.colors.primary.main,
      dark: tokens.colors.primary.dark,
      contrastText: "#ffffff",
    },
    secondary: {
      light: tokens.colors.secondary.light,
      main: tokens.colors.secondary.main,
      dark: tokens.colors.secondary.dark,
      contrastText: "#ffffff",
    },
    success: {
      light: tokens.colors.success.light,
      main: tokens.colors.success.main,
      dark: tokens.colors.success.dark,
    },
    warning: {
      light: tokens.colors.warning.light,
      main: tokens.colors.warning.main,
      dark: tokens.colors.warning.dark,
    },
    error: {
      light: tokens.colors.error.light,
      main: tokens.colors.error.main,
      dark: tokens.colors.error.dark,
    },
    background: {
      default: tokens.colors.grey[50],
      paper: "#ffffff",
    },
    text: {
      primary: tokens.colors.grey[900],
      secondary: tokens.colors.grey[500],
    },
    divider: tokens.colors.grey[200],
  },
  typography: {
    fontFamily: '"Inter", "Urbanist", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: "2.5rem", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 },
    h2: { fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.3 },
    h3: { fontSize: "1.75rem", fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1.4 },
    h4: { fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.5 },
    h6: { fontSize: "1rem", fontWeight: 600, lineHeight: 1.5 },
    subtitle1: { fontSize: "1rem", fontWeight: 500, lineHeight: 1.5 },
    subtitle2: { fontSize: "0.875rem", fontWeight: 500, lineHeight: 1.5 },
    body1: { fontSize: "1rem", lineHeight: 1.6 },
    body2: { fontSize: "0.875rem", lineHeight: 1.6 },
    button: { fontWeight: 600, letterSpacing: "0.01em" },
  },
  shape: {
    borderRadius: tokens.radius.md,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "*": {
          boxSizing: "border-box",
        },
        "::selection": {
          backgroundColor: alpha(tokens.colors.primary.main, 0.2),
          color: tokens.colors.primary.dark,
        },
      },
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: false,
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.md,
          textTransform: "none",
          fontWeight: 600,
          padding: "10px 20px",
          fontSize: "0.9375rem",
          transition: `all ${tokens.transitions.base}`,
          "&:hover": {
            transform: "translateY(-1px)",
          },
          "&:active": {
            transform: "translateY(0)",
          },
        },
        contained: {
          boxShadow: tokens.shadows.sm,
          "&:hover": {
            boxShadow: tokens.shadows.md,
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${tokens.colors.primary.main} 0%, ${tokens.colors.primary.dark} 100%)`,
          "&:hover": {
            background: `linear-gradient(135deg, ${tokens.colors.primary.light} 0%, ${tokens.colors.primary.main} 100%)`,
          },
        },
        outlined: {
          borderWidth: "1.5px",
          "&:hover": {
            borderWidth: "1.5px",
            backgroundColor: alpha(tokens.colors.primary.main, 0.04),
          },
        },
        outlinedPrimary: {
          borderColor: alpha(tokens.colors.primary.main, 0.5),
          "&:hover": {
            borderColor: tokens.colors.primary.main,
          },
        },
        text: {
          "&:hover": {
            backgroundColor: alpha(tokens.colors.primary.main, 0.08),
          },
        },
        sizeLarge: {
          padding: "12px 28px",
          fontSize: "1rem",
        },
        sizeSmall: {
          padding: "6px 14px",
          fontSize: "0.8125rem",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: `all ${tokens.transitions.fast}`,
          "&:hover": {
            backgroundColor: alpha(tokens.colors.primary.main, 0.08),
            transform: "scale(1.05)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.lg,
          boxShadow: tokens.shadows.card,
          backgroundImage: "none",
          border: `1px solid ${alpha(tokens.colors.grey[200], 0.8)}`,
          transition: `all ${tokens.transitions.base}`,
          "&:hover": {
            boxShadow: tokens.shadows.cardHover,
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 24,
          "&:last-child": {
            paddingBottom: 24,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        rounded: {
          borderRadius: tokens.radius.lg,
        },
        elevation1: {
          boxShadow: tokens.shadows.sm,
        },
        elevation2: {
          boxShadow: tokens.shadows.md,
        },
        elevation3: {
          boxShadow: tokens.shadows.lg,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: "small",
        variant: "outlined",
      },
    },
    MuiFormControl: {
      defaultProps: {
        size: "small",
      },
    },
    MuiSelect: {
      defaultProps: {
        size: "small",
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.md,
          transition: `all ${tokens.transitions.fast}`,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: tokens.colors.grey[300],
            transition: `all ${tokens.transitions.fast}`,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: tokens.colors.grey[400],
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: tokens.colors.primary.main,
            borderWidth: 2,
            boxShadow: `0 0 0 3px ${alpha(tokens.colors.primary.main, 0.1)}`,
          },
          "&.Mui-error .MuiOutlinedInput-notchedOutline": {
            borderColor: tokens.colors.error.main,
          },
          "&.Mui-error.Mui-focused .MuiOutlinedInput-notchedOutline": {
            boxShadow: `0 0 0 3px ${alpha(tokens.colors.error.main, 0.1)}`,
          },
        },
        input: {
          "&::placeholder": {
            color: tokens.colors.grey[400],
            opacity: 1,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: tokens.colors.grey[500],
          fontWeight: 500,
          "&.Mui-focused": {
            color: tokens.colors.primary.main,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.sm,
          fontWeight: 600,
          fontSize: "0.75rem",
          transition: `all ${tokens.transitions.fast}`,
        },
        filled: {
          "&:hover": {
            transform: "scale(1.02)",
          },
        },
        colorPrimary: {
          background: `linear-gradient(135deg, ${tokens.colors.primary.main} 0%, ${tokens.colors.primary.dark} 100%)`,
        },
        colorSuccess: {
          background: `linear-gradient(135deg, ${tokens.colors.success.main} 0%, ${tokens.colors.success.dark} 100%)`,
        },
        colorWarning: {
          background: `linear-gradient(135deg, ${tokens.colors.warning.main} 0%, ${tokens.colors.warning.dark} 100%)`,
        },
        colorError: {
          background: `linear-gradient(135deg, ${tokens.colors.error.main} 0%, ${tokens.colors.error.dark} 100%)`,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.md,
          fontWeight: 500,
        },
        standardSuccess: {
          backgroundColor: alpha(tokens.colors.success.main, 0.1),
          color: tokens.colors.success.dark,
          "& .MuiAlert-icon": {
            color: tokens.colors.success.main,
          },
        },
        standardError: {
          backgroundColor: alpha(tokens.colors.error.main, 0.1),
          color: tokens.colors.error.dark,
          "& .MuiAlert-icon": {
            color: tokens.colors.error.main,
          },
        },
        standardWarning: {
          backgroundColor: alpha(tokens.colors.warning.main, 0.1),
          color: tokens.colors.warning.dark,
          "& .MuiAlert-icon": {
            color: tokens.colors.warning.main,
          },
        },
        standardInfo: {
          backgroundColor: alpha(tokens.colors.primary.main, 0.1),
          color: tokens.colors.primary.dark,
          "& .MuiAlert-icon": {
            color: tokens.colors.primary.main,
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: "none",
          boxShadow: tokens.shadows.lg,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          backdropFilter: "blur(8px)",
          backgroundColor: alpha("#ffffff", 0.9),
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          borderCollapse: "separate",
          borderSpacing: 0,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${tokens.colors.grey[100]}`,
          padding: "14px 16px",
        },
        head: {
          fontWeight: 600,
          color: tokens.colors.grey[600],
          backgroundColor: tokens.colors.grey[50],
          borderBottom: `2px solid ${tokens.colors.grey[200]}`,
          fontSize: "0.8125rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: `background-color ${tokens.transitions.fast}`,
          "&:hover": {
            backgroundColor: alpha(tokens.colors.primary.main, 0.02),
          },
          "&:last-child td": {
            borderBottom: 0,
          },
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          borderTop: `1px solid ${tokens.colors.grey[200]}`,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: tokens.colors.grey[800],
          borderRadius: tokens.radius.sm,
          fontSize: "0.75rem",
          fontWeight: 500,
          padding: "6px 12px",
        },
        arrow: {
          color: tokens.colors.grey[800],
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: tokens.radius.xl,
          boxShadow: tokens.shadows.xl,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: "1.25rem",
          fontWeight: 600,
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontWeight: 600,
          fontSize: "0.6875rem",
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          border: `2px solid ${alpha(tokens.colors.primary.main, 0.2)}`,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.full,
          backgroundColor: alpha(tokens.colors.primary.main, 0.1),
        },
        bar: {
          borderRadius: tokens.radius.full,
          background: `linear-gradient(90deg, ${tokens.colors.primary.main} 0%, ${tokens.colors.primary.light} 100%)`,
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.sm,
          backgroundColor: alpha(tokens.colors.grey[500], 0.1),
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: "3px 3px 0 0",
          background: `linear-gradient(90deg, ${tokens.colors.primary.main} 0%, ${tokens.colors.primary.light} 100%)`,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          textTransform: "none",
          minHeight: 48,
          transition: `color ${tokens.transitions.fast}`,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.md,
          transition: `all ${tokens.transitions.fast}`,
          outline: "none",
          boxShadow: "none",
          "&:focus": {
            outline: "none",
            boxShadow: "none",
          },
          "&:focus-visible": {
            outline: "none",
            boxShadow: "none",
            backgroundColor: alpha(tokens.colors.primary.main, 0.08),
          },
          "&.Mui-focusVisible": {
            outline: "none",
            boxShadow: "none",
            backgroundColor: alpha(tokens.colors.primary.main, 0.08),
          },
          "&:hover": {
            backgroundColor: alpha(tokens.colors.primary.main, 0.08),
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: tokens.radius.md,
          boxShadow: tokens.shadows.lg,
          border: `1px solid ${tokens.colors.grey[200]}`,
          marginTop: 4,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.sm,
          margin: "2px 6px",
          padding: "8px 12px",
          transition: `all ${tokens.transitions.fast}`,
          "&:hover": {
            backgroundColor: alpha(tokens.colors.primary.main, 0.08),
          },
          "&.Mui-selected": {
            backgroundColor: alpha(tokens.colors.primary.main, 0.12),
            "&:hover": {
              backgroundColor: alpha(tokens.colors.primary.main, 0.16),
            },
          },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          borderRadius: tokens.radius.md,
          boxShadow: tokens.shadows.lg,
          border: `1px solid ${tokens.colors.grey[200]}`,
        },
        option: {
          borderRadius: tokens.radius.sm,
          margin: "2px 6px",
          padding: "8px 12px !important",
          transition: `all ${tokens.transitions.fast}`,
          '&[aria-selected="true"]': {
            backgroundColor: `${alpha(tokens.colors.primary.main, 0.12)} !important`,
          },
          "&:hover": {
            backgroundColor: `${alpha(tokens.colors.primary.main, 0.08)} !important`,
          },
        },
      },
    },
    // ========== DatePicker Styles ==========
    // @ts-expect-error - MUI X DatePicker component overrides are valid but not in core MUI types
    MuiPickersPopper: {
      styleOverrides: {
        paper: {
          borderRadius: tokens.radius.lg,
          boxShadow: `0 20px 40px -8px ${alpha(tokens.colors.grey[900], 0.15)}, 0 8px 16px -4px ${alpha(tokens.colors.grey[900], 0.08)}`,
          border: `1px solid ${alpha(tokens.colors.grey[200], 0.8)}`,
          backdropFilter: "blur(12px)",
          backgroundColor: alpha("#ffffff", 0.98),
          overflow: "hidden",
        },
      },
    },
    MuiDateCalendar: {
      styleOverrides: {
        root: {
          width: 340,
          maxHeight: 380,
          padding: "12px 16px 16px",
        },
      },
    },
    MuiPickersCalendarHeader: {
      styleOverrides: {
        root: {
          padding: "8px 8px 16px 16px",
          marginTop: 0,
          marginBottom: 8,
        },
        labelContainer: {
          fontWeight: 700,
          fontSize: "1rem",
          color: tokens.colors.grey[800],
          letterSpacing: "-0.01em",
        },
        switchViewButton: {
          color: tokens.colors.grey[500],
          borderRadius: tokens.radius.sm,
          transition: `all ${tokens.transitions.fast}`,
          "&:hover": {
            backgroundColor: alpha(tokens.colors.primary.main, 0.08),
            color: tokens.colors.primary.main,
          },
        },
      },
    },
    MuiPickersArrowSwitcher: {
      styleOverrides: {
        button: {
          color: tokens.colors.grey[500],
          borderRadius: tokens.radius.sm,
          width: 36,
          height: 36,
          transition: `all ${tokens.transitions.fast}`,
          "&:hover": {
            backgroundColor: alpha(tokens.colors.primary.main, 0.1),
            color: tokens.colors.primary.main,
            transform: "scale(1.05)",
          },
          "&:active": {
            transform: "scale(0.98)",
          },
          "&.Mui-disabled": {
            color: tokens.colors.grey[300],
          },
        },
      },
    },
    MuiDayCalendar: {
      styleOverrides: {
        weekDayLabel: {
          fontWeight: 600,
          fontSize: "0.75rem",
          color: tokens.colors.grey[400],
          width: 40,
          height: 36,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        },
        weekContainer: {
          margin: "2px 0",
        },
      },
    },
    MuiPickersDay: {
      styleOverrides: {
        root: {
          width: 40,
          height: 40,
          borderRadius: tokens.radius.md,
          fontSize: "0.875rem",
          fontWeight: 500,
          color: tokens.colors.grey[700],
          transition: `all ${tokens.transitions.fast}`,
          "&:hover": {
            backgroundColor: alpha(tokens.colors.primary.main, 0.1),
            color: tokens.colors.primary.main,
            transform: "scale(1.08)",
          },
          "&.Mui-selected": {
            background: `linear-gradient(135deg, ${tokens.colors.primary.main} 0%, ${tokens.colors.primary.dark} 100%)`,
            color: "#ffffff",
            fontWeight: 600,
            boxShadow: `0 4px 12px ${alpha(tokens.colors.primary.main, 0.4)}`,
            "&:hover": {
              background: `linear-gradient(135deg, ${tokens.colors.primary.light} 0%, ${tokens.colors.primary.main} 100%)`,
              boxShadow: `0 6px 16px ${alpha(tokens.colors.primary.main, 0.5)}`,
            },
            "&:focus": {
              background: `linear-gradient(135deg, ${tokens.colors.primary.main} 0%, ${tokens.colors.primary.dark} 100%)`,
            },
          },
          "&.MuiPickersDay-today": {
            border: `2px solid ${tokens.colors.primary.main}`,
            backgroundColor: "transparent",
            color: tokens.colors.primary.main,
            fontWeight: 700,
            "&:not(.Mui-selected)": {
              backgroundColor: alpha(tokens.colors.primary.main, 0.08),
            },
          },
          "&.Mui-disabled": {
            color: tokens.colors.grey[300],
          },
          "&:not(.Mui-selected):not(.MuiPickersDay-today):not(:hover)": {
            "&:nth-of-type(1), &:nth-of-type(7)": {
              color: tokens.colors.grey[500],
            },
          },
        },
        dayOutsideMonth: {
          color: tokens.colors.grey[300],
          "&:hover": {
            backgroundColor: alpha(tokens.colors.grey[200], 0.5),
            color: tokens.colors.grey[500],
          },
        },
      },
    },
    MuiPickersYear: {
      styleOverrides: {
        yearButton: {
          fontSize: "0.9375rem",
          fontWeight: 500,
          borderRadius: tokens.radius.md,
          color: tokens.colors.grey[700],
          width: 72,
          height: 40,
          margin: "4px",
          transition: `all ${tokens.transitions.fast}`,
          "&:hover": {
            backgroundColor: alpha(tokens.colors.primary.main, 0.1),
            color: tokens.colors.primary.main,
          },
          "&.Mui-selected": {
            background: `linear-gradient(135deg, ${tokens.colors.primary.main} 0%, ${tokens.colors.primary.dark} 100%)`,
            color: "#ffffff",
            fontWeight: 600,
            boxShadow: `0 4px 12px ${alpha(tokens.colors.primary.main, 0.4)}`,
            "&:hover": {
              background: `linear-gradient(135deg, ${tokens.colors.primary.light} 0%, ${tokens.colors.primary.main} 100%)`,
            },
          },
          "&.Mui-disabled": {
            color: tokens.colors.grey[300],
          },
        },
      },
    },
    MuiPickersMonth: {
      styleOverrides: {
        monthButton: {
          fontSize: "0.875rem",
          fontWeight: 500,
          borderRadius: tokens.radius.md,
          color: tokens.colors.grey[700],
          width: 80,
          height: 44,
          margin: "4px",
          transition: `all ${tokens.transitions.fast}`,
          "&:hover": {
            backgroundColor: alpha(tokens.colors.primary.main, 0.1),
            color: tokens.colors.primary.main,
          },
          "&.Mui-selected": {
            background: `linear-gradient(135deg, ${tokens.colors.primary.main} 0%, ${tokens.colors.primary.dark} 100%)`,
            color: "#ffffff",
            fontWeight: 600,
            boxShadow: `0 4px 12px ${alpha(tokens.colors.primary.main, 0.4)}`,
            "&:hover": {
              background: `linear-gradient(135deg, ${tokens.colors.primary.light} 0%, ${tokens.colors.primary.main} 100%)`,
            },
          },
          "&.Mui-disabled": {
            color: tokens.colors.grey[300],
          },
        },
      },
    },
    MuiPickersLayout: {
      styleOverrides: {
        root: {
          "& .MuiDialogActions-root": {
            padding: "12px 16px",
            borderTop: `1px solid ${tokens.colors.grey[100]}`,
            "& .MuiButton-root": {
              minWidth: 80,
              fontWeight: 600,
            },
          },
        },
        actionBar: {
          padding: "12px 16px",
          borderTop: `1px solid ${tokens.colors.grey[100]}`,
          gap: 8,
          "& .MuiButton-text": {
            color: tokens.colors.grey[500],
            "&:hover": {
              backgroundColor: alpha(tokens.colors.grey[500], 0.08),
            },
          },
          "& .MuiButton-text:last-child": {
            color: tokens.colors.primary.main,
            fontWeight: 600,
            "&:hover": {
              backgroundColor: alpha(tokens.colors.primary.main, 0.08),
            },
          },
        },
      },
    },
    MuiYearCalendar: {
      styleOverrides: {
        root: {
          width: 340,
          maxHeight: 320,
          padding: "8px",
        },
      },
    },
    MuiMonthCalendar: {
      styleOverrides: {
        root: {
          width: 340,
          padding: "8px",
        },
      },
    },
  },
});

// Export tokens for use in custom components
export { tokens };
