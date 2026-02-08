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
  Avatar,
  Stack,
  Button
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MeetingRoom as RoomIcon,
  Business as PropertyIcon,
  Category as TypeIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Add as AddIcon
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";
import { Room } from "./types";

interface RoomListTableProps {
  rooms: Room[];
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEdit: (room: Room) => void;
  onDelete: (id: string) => void;
  getRoomTypeName: (id: string) => string;
  getPropertyName: (id: string) => string;
  onAddClick: () => void;
}

export default function RoomListTable({
  rooms,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  getRoomTypeName,
  getPropertyName,
  onAddClick
}: RoomListTableProps) {
  return (
    <Card
      sx={{
        borderRadius: "18px",
        boxShadow: tokens.shadows.card,
        border: `1px solid ${tokens.colors.grey[200]}`,
        overflow: 'hidden',
      }}
    >
      <TableContainer component={Paper} elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 60 }}>No</TableCell>
              <TableCell>Room</TableCell>
              <TableCell>Property</TableCell>
              <TableCell>Room Type</TableCell>
              <TableCell>Floor</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rooms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <RoomIcon sx={{ fontSize: 48, color: tokens.colors.grey[300], mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No rooms found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Start by adding your first room
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={onAddClick}
                      size="small"
                    >
                      Add Room
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              rooms
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((room, index) => (
                  <TableRow
                    key={room.id}
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
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {room.profileImage ? (
                          <Avatar
                             src={room.profileImage}
                             variant="rounded"
                             sx={{ width: 50, height: 50, borderRadius: 2 }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 50,
                              height: 50,
                              borderRadius: 2,
                              bgcolor: alpha(tokens.colors.primary.main, 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <RoomIcon sx={{ color: tokens.colors.primary.main, fontSize: 24 }} />
                          </Box>
                        )}
                        <Box>
                          <Typography variant="body2" fontWeight={700}>
                            {room.roomNumber}
                          </Typography>
                          {room.description && (
                            <Typography variant="caption" color="text.secondary">
                              {room.description.slice(0, 30)}...
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PropertyIcon sx={{ fontSize: 16, color: tokens.colors.grey[400] }} />
                        <Typography variant="body2">
                          {room.propertyName || getPropertyName(room.propertyId)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<TypeIcon sx={{ fontSize: '14px !important' }} />}
                        label={room.roomTypeName || getRoomTypeName(room.roomTypeId)}
                        size="small"
                        sx={{
                          bgcolor: alpha(tokens.colors.primary.main, 0.08),
                          color: tokens.colors.primary.main,
                          fontWeight: 600,
                          '& .MuiChip-icon': {
                            color: tokens.colors.primary.main,
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {room.floorNumber || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={room.isActive
                          ? <ActiveIcon sx={{ fontSize: '14px !important' }} />
                          : <InactiveIcon sx={{ fontSize: '14px !important' }} />
                        }
                        label={room.isActive ? "Active" : "Inactive"}
                        size="small"
                        sx={{
                          bgcolor: room.isActive
                            ? alpha(tokens.colors.success.main, 0.12)
                            : tokens.colors.grey[100],
                          color: room.isActive
                            ? tokens.colors.success.dark
                            : tokens.colors.grey[600],
                          fontWeight: 600,
                          '& .MuiChip-icon': {
                            color: room.isActive
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
                            onClick={() => onEdit(room)}
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
                            onClick={() => onDelete(room.id)}
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
      {rooms.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rooms.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      )}
    </Card>
  );
}
