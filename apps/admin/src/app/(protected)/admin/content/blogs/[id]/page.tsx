"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  FormControlLabel,
  Checkbox,
  Alert,
  Stack,
  Grid,
  Typography,
  alpha,
} from "@mui/material";
import { tokens } from "@/lib/theme";

type Props = {
  params: { id: string };
};

export default function EditBlogPage({ params }: Props) {
  const router = useRouter();
  const isNew = params.id === "new";
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    title: "",
    tag: "",
    description: "",
    imageUrl: "",
    content: "",
    isActive: true
  });

  useEffect(() => {
    if (!isNew) {
      apiJson<any>(`blogs/${params.id}`)
        .then((data) => {
          setForm({
            title: data.title,
            tag: data.tag || "",
            description: data.description || "",
            imageUrl: data.imageUrl || "",
            content: data.content || "",
            isActive: data.isActive
          });
        })
        .catch((err) => setError(getErrorMessage(err)))
        .finally(() => setLoading(false));
    }
  }, [isNew, params.id]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      const url = isNew ? "blogs" : `blogs/${params.id}`;
      const method = isNew ? "POST" : "PUT";
      
      await apiJson(url, {
        method,
        body: JSON.stringify(form)
      });
      
      router.push("/admin/content/blogs");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <Box component="main">
      <PageHeader
        title={isNew ? "New Blog Post" : "Edit Blog Post"}
        subtitle={isNew ? "Create a new marketing post" : "Update existing post"}
        showBack
      />

      <Stack spacing={3} maxWidth={800}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Card
          sx={{
            borderRadius: 3,
            boxShadow: tokens.shadows.card,
            border: `1px solid ${tokens.colors.grey[200]}`,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tag"
                    value={form.tag}
                    onChange={(e) => setForm({ ...form, tag: e.target.value })}
                    placeholder="e.g. Seasonal, Event"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Image URL"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="https://..."
                    helperText="URL to the blog image"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Short Description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    helperText="Displayed on the card in the list"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={10}
                    label="Content (Markdown supported)"
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.isActive}
                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      />
                    }
                    label="Active (Visible on public site)"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      onClick={() => router.back()}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{
                        boxShadow: `0 4px 14px ${alpha(tokens.colors.primary.main, 0.35)}`,
                      }}
                    >
                      {isNew ? "Create Post" : "Update Post"}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
