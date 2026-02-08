"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  CircularProgress,
  alpha,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Home as HomeIcon,
  PhotoLibrary as GalleryIcon,
  Article as BlogIcon,
  ContactMail as ContactIcon,
  CheckCircle as SavedIcon,
  Edit as UnsavedIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";

type PageContent = {
  id: string;
  sectionKey: string;
  title: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
};

const SECTIONS = [
  { key: "home.rooms", label: "Home - Our Room", icon: HomeIcon, color: tokens.colors.primary.main },
  { key: "home.gallery", label: "Home - Gallery", icon: GalleryIcon, color: tokens.colors.success.main },
  { key: "home.blog", label: "Home - Blog", icon: BlogIcon, color: tokens.colors.warning.main },
  { key: "home.contact", label: "Home - Contact Us", icon: ContactIcon, color: tokens.colors.error.main },
];

export default function SectionsPage() {
  const [contents, setContents] = useState<Record<string, PageContent>>({});
  const [savedContents, setSavedContents] = useState<Record<string, PageContent>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedKey, setExpandedKey] = useState<string | false>(false);

  const loadData = useCallback(async () => {
    try {
      const data = await apiJson<PageContent[]>("page-contents");
      const map: Record<string, PageContent> = {};
      data.forEach((c) => (map[c.sectionKey] = c));
      setContents(map);
      setSavedContents(JSON.parse(JSON.stringify(map)));
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Track unsaved changes per section
  const hasUnsavedChanges = useMemo(() => {
    const changes: Record<string, boolean> = {};
    SECTIONS.forEach((section) => {
      const current = contents[section.key];
      const saved = savedContents[section.key];
      if (!current && !saved) {
        changes[section.key] = false;
      } else if (!current || !saved) {
        changes[section.key] = true;
      } else {
        changes[section.key] =
          current.title !== saved.title || current.description !== saved.description;
      }
    });
    return changes;
  }, [contents, savedContents]);

  async function handleSave(key: string, data: Partial<PageContent>) {
    setError(null);
    setSuccess(null);
    setSavingKey(key);
    try {
      const existing = contents[key];
      if (existing?.id) {
        const updated = await apiJson<PageContent>(`page-contents/${existing.id}`, {
          method: "PUT",
          body: JSON.stringify({ ...existing, ...data }),
        });
        setContents((prev) => ({ ...prev, [key]: updated }));
        setSavedContents((prev) => ({ ...prev, [key]: JSON.parse(JSON.stringify(updated)) }));
      } else {
        const created = await apiJson<PageContent>("page-contents", {
          method: "POST",
          body: JSON.stringify({
            sectionKey: key,
            title: data.title || "",
            description: data.description || "",
            imageUrl: data.imageUrl || "",
            isActive: true,
            ...data,
          }),
        });
        setContents((prev) => ({ ...prev, [key]: created }));
        setSavedContents((prev) => ({ ...prev, [key]: JSON.parse(JSON.stringify(created)) }));
      }
      const sectionLabel = SECTIONS.find((s) => s.key === key)?.label || key;
      setSuccess(`"${sectionLabel}" saved successfully!`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingKey(null);
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="main">
      <PageHeader
        title="Section Content"
        subtitle="Manage titles and descriptions for storefront sections"
      />

      <Stack spacing={3} maxWidth={800}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {SECTIONS.map((section) => {
          const content = contents[section.key] || {
            title: "",
            description: "",
            imageUrl: "",
            isActive: true,
          };
          const Icon = section.icon;
          const isUnsaved = hasUnsavedChanges[section.key];
          const isSaving = savingKey === section.key;
          const hasContent = Boolean(content.title || content.description);

          return (
            <Accordion
              key={section.key}
              expanded={expandedKey === section.key}
              onChange={(_, isExpanded) => setExpandedKey(isExpanded ? section.key : false)}
              disableGutters
              sx={{
                borderRadius: `${tokens.radius.lg}px !important`,
                boxShadow: tokens.shadows.card,
                border: `1px solid ${tokens.colors.grey[200]}`,
                overflow: "hidden",
                transition: `all ${tokens.transitions.base}`,
                "&:before": { display: "none" },
                "&:hover": {
                  boxShadow: tokens.shadows.cardHover,
                },
                "&.Mui-expanded": {
                  boxShadow: tokens.shadows.cardHover,
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  borderLeft: `4px solid ${hasContent ? section.color : tokens.colors.grey[300]}`,
                  transition: `border-color ${tokens.transitions.base}`,
                  "&:hover": {
                    bgcolor: alpha(section.color, 0.02),
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: tokens.radius.md,
                      bgcolor: alpha(section.color, 0.1),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon sx={{ color: section.color, fontSize: 22 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={600} color="text.primary">
                      {section.label}
                    </Typography>
                    {hasContent && (
                      <Typography variant="caption" color="text.secondary">
                        {content.title || "(No title)"}
                      </Typography>
                    )}
                  </Box>
                  {isUnsaved ? (
                    <Chip
                      icon={<UnsavedIcon sx={{ fontSize: "14px !important" }} />}
                      label="Unsaved"
                      size="small"
                      sx={{
                        bgcolor: alpha(tokens.colors.warning.main, 0.12),
                        color: tokens.colors.warning.dark,
                        fontWeight: 600,
                      }}
                    />
                  ) : hasContent ? (
                    <Chip
                      icon={<SavedIcon sx={{ fontSize: "14px !important" }} />}
                      label="Saved"
                      size="small"
                      sx={{
                        bgcolor: alpha(tokens.colors.success.main, 0.12),
                        color: tokens.colors.success.dark,
                        fontWeight: 600,
                      }}
                    />
                  ) : null}
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3, pt: 2, bgcolor: tokens.colors.grey[50] }}>
                <Stack spacing={2}>
                  <Box>
                    <TextField
                      fullWidth
                      size="small"
                      label="Title"
                      placeholder={`Enter ${section.label.toLowerCase()} title...`}
                      value={content.title || ""}
                      onChange={(e) =>
                        setContents((prev) => ({
                          ...prev,
                          [section.key]: { ...content, title: e.target.value } as PageContent,
                        }))
                      }
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "white",
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Box>
                  <Box>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      size="small"
                      label="Description"
                      placeholder={`Enter ${section.label.toLowerCase()} description...`}
                      value={content.description || ""}
                      onChange={(e) =>
                        setContents((prev) => ({
                          ...prev,
                          [section.key]: {
                            ...content,
                            description: e.target.value,
                          } as PageContent,
                        }))
                      }
                      helperText={`${(content.description || "").length}/500 characters`}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "white",
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Box>
                  <Box display="flex" justifyContent="flex-end">
                    <Button
                      variant="contained"
                      disabled={!isUnsaved || isSaving}
                      onClick={() =>
                        handleSave(section.key, {
                          title: content.title,
                          description: content.description,
                        })
                      }
                      startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : null}
                      sx={{
                        minWidth: 120,
                        boxShadow: `0 4px 14px ${alpha(tokens.colors.primary.main, 0.35)}`,
                        "&.Mui-disabled": {
                          bgcolor: tokens.colors.grey[200],
                          color: tokens.colors.grey[500],
                        },
                      }}
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </Box>
                </Stack>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Stack>
    </Box>
  );
}
