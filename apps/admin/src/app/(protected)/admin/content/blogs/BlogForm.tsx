"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { uploadSupabaseFile, buildSupabaseObjectPath } from "@/lib/storage/supabase";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Switch,
  Stack,
  Grid,
  Typography,
  alpha,
  CircularProgress,
  Avatar,
  Alert,
} from "@mui/material";
import {
  Article as ArticleIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  TextSnippet as ContentIcon,
  Visibility as VisibilityIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";

// Dynamic import for markdown editor to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export type BlogFormData = {
  title: string;
  slug: string;
  tag: string;
  description: string;
  imageUrl: string;
  content: string;
  isActive: boolean;
};

type BlogFormProps = {
  initialData?: BlogFormData;
  onSubmit: (data: BlogFormData) => Promise<void>;
  onCancel: () => void;
  isEditing: boolean;
  isSubmitting: boolean;
};

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

export default function BlogForm({
  initialData,
  onSubmit,
  onCancel,
  isEditing,
  isSubmitting,
}: BlogFormProps) {
  const [form, setForm] = useState<BlogFormData>({
    title: "",
    slug: "",
    tag: "",
    description: "",
    imageUrl: "",
    content: "",
    isActive: true,
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    }
  }, [initialData]);

  // Auto-generate slug when title changes
  const handleTitleChange = useCallback((newTitle: string) => {
    setForm(prev => ({
      ...prev,
      title: newTitle,
      slug: generateSlug(newTitle)
    }));
  }, []);

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploadingImage(true);
    setError(null);
    try {
      const file = e.target.files[0];
      const path = buildSupabaseObjectPath("blogs/featured", file.name);
      const url = await uploadSupabaseFile(file, path);
      setForm(prev => ({ ...prev, imageUrl: url }));
    } catch (err) {
      console.error("Upload failed", err);
      setError("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setForm(prev => ({ ...prev, imageUrl: "" }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit(form);
  };

  const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 3,
          bgcolor: alpha(tokens.colors.primary.main, 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon sx={{ color: tokens.colors.primary.main }} />
      </Box>
      <Box>
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );

  const textFieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      backgroundColor: 'white',
      '&:hover': {
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: tokens.colors.primary.main,
        }
      },
      '&.Mui-focused': {
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: tokens.colors.primary.main,
          borderWidth: 2,
        }
      }
    },
    '& .MuiInputLabel-root': {
      '&.Mui-focused': {
        color: tokens.colors.primary.main,
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {error}
        </Alert>
      )}

      {/* Featured Image Section */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: tokens.shadows.card,
          border: `1px solid ${tokens.colors.grey[200]}`,
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <SectionHeader 
            icon={ImageIcon} 
            title="Featured Image" 
            subtitle="Main image displayed on the blog card" 
          />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              p: 3,
              borderRadius: 3,
              bgcolor: tokens.colors.grey[50],
              border: `1px solid ${tokens.colors.grey[100]}`,
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: 160,
                height: 100,
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: 'white',
                border: `2px dashed ${form.imageUrl ? 'transparent' : tokens.colors.grey[300]}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: tokens.colors.primary.main,
                  '& .upload-overlay': {
                    opacity: 1,
                  }
                }
              }}
              onClick={() => imageInputRef.current?.click()}
            >
              {form.imageUrl ? (
                <>
                  <Avatar
                    src={form.imageUrl}
                    variant="rounded"
                    sx={{ width: '100%', height: '100%' }}
                  />
                  <Box
                    className="upload-overlay"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      bgcolor: 'rgba(0,0,0,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    <UploadIcon sx={{ color: 'white' }} />
                  </Box>
                </>
              ) : (
                <Box sx={{ textAlign: 'center' }}>
                  {uploadingImage ? (
                    <CircularProgress size={32} />
                  ) : (
                    <>
                      <UploadIcon sx={{ fontSize: 32, color: tokens.colors.grey[400], mb: 0.5 }} />
                      <Typography variant="caption" color="text.secondary" display="block">
                        Click to upload
                      </Typography>
                    </>
                  )}
                </Box>
              )}
            </Box>
            <input
              type="file"
              accept="image/*"
              hidden
              ref={imageInputRef}
              onChange={handleImageUpload}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
                Blog Cover Image
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                This image will be displayed on the blog card. Recommended size: 1200×630px for optimal social sharing.
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={uploadingImage ? <CircularProgress size={16} /> : <UploadIcon />}
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingImage}
                  sx={{ borderRadius: 2 }}
                >
                  {form.imageUrl ? "Change Image" : "Upload Image"}
                </Button>
                {form.imageUrl && (
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleRemoveImage}
                    sx={{ borderRadius: 2 }}
                  >
                    Remove
                  </Button>
                )}
              </Stack>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Basic Information Section */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: tokens.shadows.card,
          border: `1px solid ${tokens.colors.grey[200]}`,
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <SectionHeader 
            icon={ArticleIcon} 
            title="Basic Information" 
            subtitle="Title, slug, and category tag for your blog post" 
          />
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Title"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
                placeholder="Enter blog post title"
                InputLabelProps={{ shrink: true }}
                sx={textFieldSx}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Slug"
                value={form.slug}
                disabled
                placeholder="auto-generated-from-title"
                helperText="Auto-generated from title (used for URL)"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.disabled', fontSize: 20 }} />,
                }}
                sx={{
                  ...textFieldSx,
                  '& .MuiOutlinedInput-root': {
                    ...textFieldSx['& .MuiOutlinedInput-root'],
                    backgroundColor: tokens.colors.grey[50],
                  }
                }}
              />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Tag"
                value={form.tag}
                onChange={(e) => setForm({ ...form, tag: e.target.value })}
                placeholder="e.g. Seasonal, Event, News"
                helperText="Category tag displayed on the blog card"
                InputLabelProps={{ shrink: true }}
                sx={textFieldSx}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Content Section */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: tokens.shadows.card,
          border: `1px solid ${tokens.colors.grey[200]}`,
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <SectionHeader 
            icon={ContentIcon} 
            title="Content" 
            subtitle="Short description and full article content with rich text formatting" 
          />
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Short Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="A brief summary shown on the blog card..."
                helperText="This text appears on the blog card in listings"
                InputLabelProps={{ shrink: true }}
                sx={textFieldSx}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box>
                <Typography variant="body2" fontWeight={500} sx={{ mb: 1.5, color: 'text.secondary' }}>
                  Content
                </Typography>
                <Box
                  sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: `1px solid ${tokens.colors.grey[300]}`,
                    '& .w-md-editor': {
                      borderRadius: 2,
                      boxShadow: 'none',
                    },
                    '& .w-md-editor-toolbar': {
                      backgroundColor: tokens.colors.grey[50],
                      borderBottom: `1px solid ${tokens.colors.grey[200]}`,
                      padding: '8px 12px',
                    },
                    '& .w-md-editor-content': {
                      backgroundColor: 'white',
                    },
                    '& .w-md-editor-text-pre > code, & .w-md-editor-text-input': {
                      fontSize: '14px !important',
                      lineHeight: '1.6 !important',
                    },
                    '& .wmde-markdown': {
                      fontSize: '14px',
                      lineHeight: 1.6,
                    }
                  }}
                  data-color-mode="light"
                >
                  <MDEditor
                    value={form.content}
                    onChange={(value) => setForm({ ...form, content: value || "" })}
                    height={400}
                    preview="edit"
                    textareaProps={{
                      placeholder: "Write your blog content here...\n\n# Heading 1\n## Heading 2\n\n**Bold text** and *italic text*\n\n![Alt text](image-url)\n\n- List item 1\n- List item 2"
                    }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Use the toolbar for formatting: **bold**, *italic*, headings, lists, links, and images
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Publishing Section */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: tokens.shadows.card,
          border: `1px solid ${tokens.colors.grey[200]}`,
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <SectionHeader 
            icon={VisibilityIcon} 
            title="Publishing" 
            subtitle="Control the visibility of this blog post" 
          />
          <Box
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: form.isActive ? alpha(tokens.colors.success.main, 0.08) : tokens.colors.grey[50],
              border: `1px solid ${form.isActive ? alpha(tokens.colors.success.main, 0.3) : tokens.colors.grey[200]}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: form.isActive ? tokens.colors.success.main : tokens.colors.grey[400],
                }}
              />
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  {form.isActive ? 'Published' : 'Draft'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {form.isActive 
                    ? 'This post is visible on the public website' 
                    : 'This post is hidden from the public website'
                  }
                </Typography>
              </Box>
            </Box>
            <Switch
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              color="success"
              size="medium"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={isSubmitting}
          sx={{
            px: 4,
            py: 1.25,
            borderRadius: 2,
            borderColor: tokens.colors.grey[300],
            color: tokens.colors.grey[700],
            fontWeight: 600,
            '&:hover': {
              borderColor: tokens.colors.grey[400],
              bgcolor: tokens.colors.grey[50],
            }
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting || uploadingImage}
          startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : null}
          sx={{
            px: 4,
            py: 1.25,
            borderRadius: 2,
            fontWeight: 600,
            boxShadow: `0 4px 14px ${alpha(tokens.colors.primary.main, 0.35)}`,
            '&:hover': {
              boxShadow: `0 6px 20px ${alpha(tokens.colors.primary.main, 0.45)}`,
            }
          }}
        >
          {isEditing ? "Update Post" : "Create Post"}
        </Button>
      </Stack>
    </Box>
  );
}
