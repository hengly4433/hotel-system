"use client";

import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  TablePagination,
  alpha,
  Stack,
  Button
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Receipt as TaxIcon,
  Business as PropertyIcon,
  Percent as PercentIcon,
  AttachMoney as FixedIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Add as AddIcon
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";

type TaxFee = {
  id: string;
  propertyId: string;
  name: string;
  type: "PERCENT" | "FIXED";
  value: number;
  appliesTo: string;
  active: boolean;
};

interface TaxFeeListTableProps {
  items: TaxFee[];
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEdit: (item: TaxFee) => void;
  onDelete: (id: string) => void;
  getPropertyName: (id: string) => string;
  onAddClick: () => void;
}

export default function TaxFeeListTable({
  items,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  getPropertyName,
  onAddClick
}: TaxFeeListTableProps) {
  return (
    <Card
      sx={{
        borderRadius: "18px",
        boxShadow: tokens.shadows.card,
        border: `1px solid ${tokens.colors.grey[200]}`,
        overflow: 'hidden',
      }}
    >
      <TableContainer component={Paper} elevation={0} sx={{ height: 340 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 60 }}>No</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Applies To</TableCell>
              <TableCell>Property</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <TaxIcon sx={{ fontSize: 48, color: tokens.colors.grey[300], mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No taxes or fees found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Create your first tax or fee rule
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={onAddClick}
                      size="small"
                    >
                      Add Tax/Fee
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              items
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item, index) => (
                  <TableRow
                    key={item.id}
                    hover
                    sx={{
                      '&:hover': {
                        bgcolor: alpha(tokens.colors.primary.main, 0.02),
                      }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {page * rowsPerPage + index + 1}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{item.name}</TableCell>
                    <TableCell>
                      <Chip
                        icon={item.type === "PERCENT" 
                          ? <PercentIcon sx={{ fontSize: '14px !important' }} />
                          : <FixedIcon sx={{ fontSize: '14px !important' }} />
                        }
                        label={item.type}
                        size="small"
                        sx={{
                          bgcolor: tokens.colors.grey[100],
                          color: tokens.colors.grey[700],
                          fontWeight: 600,
                          '& .MuiChip-icon': {
                            color: tokens.colors.grey[500],
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'monospace',
                          fontWeight: 600,
                        }}
                      >
                        {item.value}{item.type === "PERCENT" ? "%" : ""}
                      </Typography>
                    </TableCell>
                    <TableCell>{item.appliesTo}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PropertyIcon sx={{ fontSize: 16, color: tokens.colors.grey[400] }} />
                        <Typography variant="body2">
                          {getPropertyName(item.propertyId)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={item.active
                          ? <ActiveIcon sx={{ fontSize: '14px !important' }} />
                          : <InactiveIcon sx={{ fontSize: '14px !important' }} />
                        }
                        label={item.active ? "Active" : "Disabled"}
                        size="small"
                        sx={{
                          bgcolor: item.active
                            ? alpha(tokens.colors.success.main, 0.12)
                            : tokens.colors.grey[100],
                          color: item.active
                            ? tokens.colors.success.dark
                            : tokens.colors.grey[600],
                          fontWeight: 600,
                          '& .MuiChip-icon': {
                            color: item.active
                              ? tokens.colors.success.main
                              : tokens.colors.grey[400],
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => onEdit(item)}
                            sx={{
                              bgcolor: alpha(tokens.colors.primary.main, 0.08),
                              color: tokens.colors.primary.main,
                              '&:hover': {
                                bgcolor: alpha(tokens.colors.primary.main, 0.15),
                              }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => onDelete(item.id)}
                            sx={{
                              bgcolor: alpha(tokens.colors.error.main, 0.08),
                              color: tokens.colors.error.main,
                              '&:hover': {
                                bgcolor: alpha(tokens.colors.error.main, 0.15),
                              }
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
      {items.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={items.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      )}
    </Card>
  );
}
