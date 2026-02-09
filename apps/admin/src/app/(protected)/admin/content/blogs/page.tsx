"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import {
  Box,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Alert,
  Stack,
  Chip,
  Tooltip,
  TablePagination,
  alpha,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Article as ArticleIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

type Blog = {
  id: string;
  title: string;
  tag: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
};

export default function BlogsPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
    loadData();
  }, [loadData]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await apiJson(`blogs/${deleteId}`, { method: "DELETE" });
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <Box component="main">
      <PageHeader
        title="Blogs"
        subtitle="Manage marketing blog posts"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push("/admin/content/blogs/new")}
            sx={{
              boxShadow: `0 4px 14px ${alpha(tokens.colors.primary.main, 0.35)}`,
            }}
          >
            New Post
          </Button>
        }
      />

      <Stack spacing={3}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Card
          sx={{
            borderRadius: 4,
            boxShadow: tokens.shadows.card,
            border: `1px solid ${tokens.colors.grey[200]}`,
            overflow: 'hidden',
          }}
        >
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Tag</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {blogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <ArticleIcon sx={{ fontSize: 48, color: tokens.colors.grey[300], mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No blog posts found
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => router.push("/admin/content/blogs/new")}
                          size="small"
                        >
                          Create Post
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  blogs
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((blog) => (
                      <TableRow
                        key={blog.id}
                        hover
                        sx={{
                          '&:hover': {
                            bgcolor: alpha(tokens.colors.primary.main, 0.02),
                          }
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>
                            {blog.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {blog.description?.slice(0, 50)}...
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={blog.tag} size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={blog.isActive
                              ? <ActiveIcon sx={{ fontSize: '14px !important' }} />
                              : <InactiveIcon sx={{ fontSize: '14px !important' }} />
                            }
                            label={blog.isActive ? "Active" : "Inactive"}
                            size="small"
                            sx={{
                              bgcolor: blog.isActive
                                ? alpha(tokens.colors.success.main, 0.12)
                                : tokens.colors.grey[100],
                              color: blog.isActive
                                ? tokens.colors.success.dark
                                : tokens.colors.grey[600],
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => router.push(`/admin/content/blogs/${blog.id}`)}
                                sx={{
                                  bgcolor: alpha(tokens.colors.primary.main, 0.08),
                                  color: tokens.colors.primary.main,
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => setDeleteId(blog.id)}
                                sx={{
                                  bgcolor: alpha(tokens.colors.error.main, 0.08),
                                  color: tokens.colors.error.main,
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {blogs.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={blogs.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}
        </Card>
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
