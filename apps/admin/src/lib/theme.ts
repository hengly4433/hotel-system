"use client";

import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#0ea5e9", // Sky Blue 500
    },
    secondary: {
      main: "#0f172a", // Slate 900
    },
    background: {
      default: "#f8fafc", // Slate 50
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a", // Dark slate for text
      secondary: "#64748b", // Slate 500
    },
  },
  typography: {
    fontFamily: '"Urbanist", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: "2.5rem", fontWeight: 600 },
    h2: { fontSize: "2rem", fontWeight: 600 },
    h3: { fontSize: "1.75rem", fontWeight: 600 },
    h4: { fontSize: "1.5rem", fontWeight: 600 },
    h5: { fontSize: "1.25rem", fontWeight: 600 },
    h6: { fontSize: "1rem", fontWeight: 600 },
  },
  components: {
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
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12, // Reduced from 16
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
          backgroundImage: "none",
          border: "1px solid rgba(0, 0, 0, 0.03)",
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 24, // Reduced from 32
          "&:last-child": {
            paddingBottom: 24,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Reduced from 10
          textTransform: "none",
          fontWeight: 600,
          boxShadow: "none",
          padding: "8px 20px", // Reduced from 10px 24px
          fontSize: "0.9375rem", // Slightly smaller text
          "&:hover": {
            boxShadow: "none",
          },
        },
        containedPrimary: {
          color: "#ffffff",
          "&:hover": {
             backgroundColor: "#0284c7", // Sky Blue 600
          },
        },
        outlined: {
           borderWidth: "1.5px",
           "&:hover": {
             borderWidth: "1.5px",
           },
        },
      },
    },
    MuiOutlinedInput: {
        styleOverrides: {
            root: {
                borderRadius: 8, // Reduced from 10
                "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#e2e8f0",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#cbd5e1",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#0ea5e9", // Sky Blue
                    borderWidth: 2,
                },
            },
        },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: "none",
          boxShadow: "0px 5px 20px 0px rgba(0, 0, 0, 0.05)",
        },
      },
    },
    MuiTableCell: {
        styleOverrides: {
            root: {
                borderBottom: "1px solid #f1f5f9",
                padding: "12px 16px", // More compact tables
            },
            head: {
                fontWeight: 600,
                color: "#64748b",
                backgroundColor: "#f8fafc",
            },
        },
    },
  },
});
