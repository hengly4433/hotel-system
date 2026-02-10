"use client";

import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Stack,
  Avatar,
  Chip,
  TablePagination,
  alpha,
  Button,
} from "@mui/material";
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon, 
  Badge as EmployeeIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";

type Employee = {
  id: string;
  propertyId: string;
  personId: string;
  firstName: string;
  lastName: string;
  dob: string | null;
  phone: string | null;
  email: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  jobTitle: string | null;
  department: string | null;
  hireDate: string | null;
  hourlyRate: number | null;
  skills: string | null;
  photoUrl: string | null;
  employmentStatus: string;
};

interface EmployeeListTableProps {
  items: Employee[];
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
  getPropertyName: (id: string) => string;
  skillsToLabel: (skills: string | null) => string;
  onAddClick: () => void;
}

export default function EmployeeListTable({
  items,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  getPropertyName,
  skillsToLabel,
  onAddClick,
}: EmployeeListTableProps) {
  return (
    <>
      <TableContainer component={Paper} elevation={0} sx={{ height: 340 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 60 }}>No</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Property</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Skills</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <EmployeeIcon sx={{ fontSize: 48, color: tokens.colors.grey[300], mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No employees found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Add your first staff member
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={onAddClick}
                      size="small"
                    >
                      Add Employee
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              items
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((employee, index) => (
                <TableRow 
                  key={employee.id} 
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
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar src={employee.photoUrl || undefined} alt={employee.firstName}>
                        {employee.firstName[0]}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>
                        {employee.firstName} {employee.lastName}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{getPropertyName(employee.propertyId)}</TableCell>
                  <TableCell>{employee.jobTitle || "-"}</TableCell>
                  <TableCell>{employee.department || "-"}</TableCell>
                  <TableCell sx={{ maxWidth: 200 }}>
                    <Typography variant="body2" noWrap>
                      {skillsToLabel(employee.skills)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={employee.employmentStatus}
                      size="small" 
                      sx={{
                        bgcolor: employee.employmentStatus === "ACTIVE" 
                          ? alpha(tokens.colors.success.main, 0.12)
                          : tokens.colors.grey[100],
                        color: employee.employmentStatus === "ACTIVE"
                          ? tokens.colors.success.dark
                          : tokens.colors.grey[600],
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <IconButton 
                        size="small" 
                        onClick={() => onEdit(employee)}
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
                      <IconButton 
                        size="small" 
                        onClick={() => onDelete(employee.id)}
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
    </>
  );
}
