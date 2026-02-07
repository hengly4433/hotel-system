"use client";

import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  Stack,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  alpha,
} from "@mui/material";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
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
  { key: "home.rooms", label: "Home - Our Room" },
  { key: "home.gallery", label: "Home - Gallery" },
  { key: "home.blog", label: "Home - Blog" },
  { key: "home.contact", label: "Home - Contact Us" }, // Added contact section
];

export default function SectionsPage() {
  const [contents, setContents] = useState<Record<string, PageContent>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const data = await apiJson<PageContent[]>("page-contents");
      const map: Record<string, PageContent> = {};
      data.forEach((c) => (map[c.sectionKey] = c));
      setContents(map);
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

  async function handleSave(key: string, data: Partial<PageContent>) {
    setError(null);
    setSuccess(null);
    try {
      const existing = contents[key];
      if (existing) {
        const updated = await apiJson<PageContent>(`page-contents/${existing.id}`, {
          method: "PUT",
          body: JSON.stringify({ ...existing, ...data }),
        });
        setContents((prev) => ({ ...prev, [key]: updated }));
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
      }
      setSuccess(`Section "${key}" saved successfully.`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (loading) return <div>Loading...</div>;

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

          return (
            <Accordion
              key={section.key}
              disableGutters
              sx={{
                borderRadius: 2,
                boxShadow: tokens.shadows.card,
                border: `1px solid ${tokens.colors.grey[200]}`,
                '&:before': { display: 'none' },
                mb: 2,
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>{section.label}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Title"
                      value={content.title || ""}
                      onChange={(e) =>
                        setContents((prev) => ({
                          ...prev,
                          [section.key]: { ...content, title: e.target.value } as PageContent,
                        }))
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Description"
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
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="flex-end">
                      <Button
                        variant="contained"
                        onClick={() =>
                          handleSave(section.key, {
                            title: content.title,
                            description: content.description,
                          })
                        }
                        sx={{
                          boxShadow: `0 4px 14px ${alpha(tokens.colors.primary.main, 0.35)}`,
                        }}
                      >
                        Save {section.label}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Stack>
    </Box>
  );
}
