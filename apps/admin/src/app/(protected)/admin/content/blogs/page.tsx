"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  alpha,
  MenuItem,
  Grid,
  InputAdornment,
  Collapse,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/contexts/ToastContext";
import BlogForm, { BlogFormData } from "./BlogForm";
import BlogListTable from "./BlogListTable";

type Blog = {
  id: string;
  title: string;
  tag: string;
  slug: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  content: string;
  createdAt: string;
};

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" }
];

export default function BlogsPage() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useToast();

  const loadData = useCallback(async () => {
    try {
      const data = await apiJson<Blog[]>("blogs");
      setBlogs(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesSearch = !searchQuery || 
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        blog.tag.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" ? blog.isActive : !blog.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [blogs, searchQuery, statusFilter]);

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await apiJson(`blogs/${deleteId}`, { method: "DELETE" });
      showSuccess("Blog post deleted successfully");
      await loadData();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setDeleteId(null);
    }
  }

  // Form Handlers
  const handleCreate = () => {
    setSelectedBlog(null);
    setView('form');
  };

  const handleEdit = (blog: Blog) => {
    setSelectedBlog(blog);
    setView('form');
  };

  const handleFormSubmit = async (formData: BlogFormData) => {
    setIsSubmitting(true);
    try {
        if (selectedBlog) {
            await apiJson(`blogs/${selectedBlog.id}`, {
                method: "PUT",
                body: JSON.stringify(formData),
            });
            showSuccess("Blog post updated successfully");
        } else {
            await apiJson("blogs", {
                method: "POST",
                body: JSON.stringify(formData),
            });
            showSuccess("Blog post created successfully");
        }
        await loadData();
        setView('list');
    } catch (err) {
        showError(getErrorMessage(err));
    } finally {
        setIsSubmitting(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  return (
    <Box component="main">
      <Stack spacing={3}>
        <PageHeader
          title="Blogs"
          subtitle="Manage marketing blog posts"
          action={
            view === 'list' ? (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreate}
                sx={{
                  boxShadow: `0 4px 14px ${alpha(tokens.colors.primary.main, 0.35)}`,
                }}
              >
                New Post
              </Button>
            ) : null
          }
        />

        <Collapse in={!!error}>
            <Box mb={3}>
                {error && (
                <Typography color="error" variant="body2" sx={{ bgcolor: alpha(tokens.colors.error.main, 0.1), p: 2, borderRadius: 2 }}>
                    {error}
                </Typography>
                )}
            </Box>
        </Collapse>

        {view === 'list' ? (
          <>
            {/* Filters */}
            <Card
              sx={{
                borderRadius: "18px",
                boxShadow: tokens.shadows.card,
                border: `1px solid ${tokens.colors.grey[200]}`,
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by title or tag..."
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      fullWidth
                      label="Status"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={clearFilters}
                      sx={{ height: 40 }}
                    >
                      <ClearIcon fontSize="small" />
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* List Table */}
            <Card
              sx={{
                borderRadius: "18px",
                boxShadow: tokens.shadows.card,
                border: `1px solid ${tokens.colors.grey[200]}`,
                overflow: 'hidden',
              }}
            >
              <BlogListTable
                items={filteredBlogs}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                onEdit={handleEdit}
                onDelete={(id) => setDeleteId(id)}
                onAddClick={handleCreate}
              />
            </Card>
          </>
        ) : (
          <BlogForm
            initialData={selectedBlog ? {
                title: selectedBlog.title,
                slug: selectedBlog.slug,
                tag: selectedBlog.tag,
                description: selectedBlog.description,
                imageUrl: selectedBlog.imageUrl,
                content: selectedBlog.content,
                isActive: selectedBlog.isActive
            } : undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => setView('list')}
            isEditing={!!selectedBlog}
            isSubmitting={isSubmitting}
          />
        )}
      </Stack>
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Blog Post?"
        description="This will permanently remove this blog post."
        confirmText="Delete"
        variant="danger"
      />
    </Box>
  );
}
