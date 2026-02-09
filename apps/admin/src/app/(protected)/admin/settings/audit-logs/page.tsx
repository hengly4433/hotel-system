"use client";

import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Typography,
  Stack,
  TablePagination,
  alpha,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Collapse,
} from "@mui/material";
import {
  History as HistoryIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";

type Property = {
  id: string;
  name: string;
};

type AuditLog = {
  id: string;
  propertyId: string | null;
  actorUserId: string | null;
  entityType: string;
  entityId: string | null;
  action: string;
  beforeJson: Record<string, unknown> | string | null;
  afterJson: Record<string, unknown> | string | null;
  requestId: string | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
};

function Row({ log }: { log: AuditLog }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {new Date(log.createdAt).toLocaleString()}
          </Typography>
        </TableCell>
        <TableCell>
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {log.entityType}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontFamily="monospace">
              {log.entityId || "-"}
            </Typography>
          </Box>
        </TableCell>
        <TableCell>
          <Chip 
            label={log.action} 
            size="small" 
            sx={{ 
              fontWeight: 600,
              bgcolor: alpha(tokens.colors.primary.main, 0.1),
              color: tokens.colors.primary.dark,
            }} 
          />
        </TableCell>
        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {log.actorUserId || "-"}
          </Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Typography variant="subtitle2" gutterBottom component="div">
                Change Details
              </Typography>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  bgcolor: tokens.colors.grey[50],
                  fontFamily: 'monospace',
                  fontSize: '0.8125rem',
                  whiteSpace: 'pre-wrap',
                  maxHeight: 300,
                  overflow: 'auto'
                }}
              >
                <div style={{ marginBottom: 8 }}>
                  <strong>Before:</strong>
                  <div>
                    {log.beforeJson
                      ? JSON.stringify(log.beforeJson, null, 2)
                      : "-"}
                  </div>
                </div>
                <div>
                  <strong>After:</strong>
                  <div>
                    {log.afterJson
                      ? JSON.stringify(log.afterJson, null, 2)
                      : "-"}
                  </div>
                </div>
              </Paper>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyId, setPropertyId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadProperties = useCallback(async () => {
    try {
      const data = await apiJson<Property[]>("properties");
      setProperties(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  const loadLogs = useCallback(async () => {
    try {
      const query = propertyId ? `?propertyId=${propertyId}` : "";
      const data = await apiJson<AuditLog[]>(`audit-logs${query}`);
      setLogs(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [propertyId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadProperties();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadProperties]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadLogs();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadLogs]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box component="main">
      <PageHeader title="Audit Logs" subtitle="Track changes across modules" />
      
      <Stack spacing={3}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Card
          sx={{
            borderRadius: "18px",
            boxShadow: tokens.shadows.card,
            border: `1px solid ${tokens.colors.grey[200]}`,
          }}
        >
          <CardContent>
            <TextField
              select
              label="Filter by Property"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">All properties</MenuItem>
              {properties.map((property) => (
                <MenuItem key={property.id} value={property.id}>
                  {property.name}
                </MenuItem>
              ))}
            </TextField>
          </CardContent>
        </Card>

        <Card
          sx={{
            borderRadius: "18px",
            boxShadow: tokens.shadows.card,
            border: `1px solid ${tokens.colors.grey[200]}`,
          }}
        >
          <TableContainer component={Paper} elevation={0} sx={{ height: 400 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width={50} />
                  <TableCell>Time</TableCell>
                  <TableCell>Entity</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Actor</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <HistoryIcon sx={{ fontSize: 48, color: tokens.colors.grey[300], mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No audit logs found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Recent system activities will appear here
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((log) => (
                      <Row key={log.id} log={log} />
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={logs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              borderTop: `1px solid ${tokens.colors.grey[200]}`,
              backgroundColor: tokens.colors.grey[50],
            }}
          />
        </Card>
      </Stack>
    </Box>
  );
}
