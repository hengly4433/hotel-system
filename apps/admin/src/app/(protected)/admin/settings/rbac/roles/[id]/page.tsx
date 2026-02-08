"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import type { MenuTree, PermissionGroup, RbacRole } from "@/lib/types/rbac";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  Alert,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Chip,
  alpha,
  IconButton,
  Collapse,
  Divider,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Security as SecurityIcon,
  Menu as MenuIcon,
  CheckCircle as CheckIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Save as SaveIcon,
  Key as KeyIcon,
  Folder as FolderIcon,
} from "@mui/icons-material";
import { tokens } from "@/lib/theme";
import Link from "next/link";

export default function RoleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roleId = params?.id as string | undefined;

  const [role, setRole] = useState<RbacRole | null>(null);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [menuTree, setMenuTree] = useState<MenuTree[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [savingSubmenus, setSavingSubmenus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const permissionCount = useMemo(() => selectedPermissions.size, [selectedPermissions]);
  const totalPermissions = useMemo(() => 
    permissionGroups.reduce((acc, g) => acc + g.permissions.length, 0), 
    [permissionGroups]
  );

  const loadData = useCallback(async () => {
    if (!roleId) return;
    setError(null);
    setLoading(true);
    try {
      const [roleData, groupData, rolePermissionIds, roleMenuTree] = await Promise.all([
        apiJson<RbacRole>(`rbac/roles/${roleId}`),
        apiJson<PermissionGroup[]>("rbac/pickers/permissions-grouped"),
        apiJson<string[]>(`rbac/roles/${roleId}/permissions`),
        apiJson<MenuTree[]>(`rbac/roles/${roleId}/submenus`)
      ]);

      setRole(roleData);
      setPermissionGroups(groupData);
      setSelectedPermissions(new Set(rolePermissionIds));
      setMenuTree(roleMenuTree);
      // Expand all groups by default
      setExpandedGroups(new Set(groupData.map(g => g.resource)));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [roleId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  function togglePermission(permissionId: string) {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
      }
      return next;
    });
  }

  function toggleGroup(resource: string) {
    const group = permissionGroups.find((g) => g.resource === resource);
    if (!group) return;

    const ids = group.permissions.map((p) => p.id);
    const allSelected = ids.every((id) => selectedPermissions.has(id));

    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
      }
      return next;
    });
  }

  function toggleExpandGroup(resource: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(resource)) {
        next.delete(resource);
      } else {
        next.add(resource);
      }
      return next;
    });
  }

  function toggleMenu(menuId: string) {
    setMenuTree((prev) =>
      prev.map((menu) => {
        if (menu.id !== menuId) return menu;
        const allChecked = menu.submenus.every((submenu) => submenu.checked);
        return {
          ...menu,
          submenus: menu.submenus.map((submenu) => ({
            ...submenu,
            checked: !allChecked
          }))
        };
      })
    );
  }

  function toggleSubmenu(menuId: string, submenuId: string) {
    setMenuTree((prev) =>
      prev.map((menu) => {
        if (menu.id !== menuId) return menu;
        return {
          ...menu,
          submenus: menu.submenus.map((submenu) =>
            submenu.id === submenuId
              ? { ...submenu, checked: !submenu.checked }
              : submenu
          )
        };
      })
    );
  }

  async function savePermissions() {
    if (!roleId) return;
    setSavingPermissions(true);
    setError(null);
    setSuccess(null);
    try {
      await apiJson(`rbac/roles/${roleId}/permissions`, {
        method: "PUT",
        body: JSON.stringify({ permissionIds: Array.from(selectedPermissions) })
      });
      setSuccess("Permissions saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingPermissions(false);
    }
  }

  async function saveSubmenus() {
    if (!roleId) return;
    setSavingSubmenus(true);
    setError(null);
    setSuccess(null);

    const submenuIds = menuTree
      .flatMap((menu) => menu.submenus)
      .filter((submenu) => submenu.checked)
      .map((submenu) => submenu.id);

    try {
      await apiJson(`rbac/roles/${roleId}/submenus`, {
        method: "PUT",
        body: JSON.stringify({ submenuIds })
      });
      setSuccess("Menu access saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingSubmenus(false);
    }
  }

  const getActionColor = (action: string) => {
    const colors: Record<string, { bg: string; color: string }> = {
      CREATE: { bg: alpha(tokens.colors.success.main, 0.1), color: tokens.colors.success.dark },
      READ: { bg: alpha(tokens.colors.primary.main, 0.1), color: tokens.colors.primary.dark },
      UPDATE: { bg: alpha(tokens.colors.warning.main, 0.1), color: tokens.colors.warning.dark },
      DELETE: { bg: alpha(tokens.colors.error.main, 0.1), color: tokens.colors.error.dark },
      ADMIN: { bg: alpha('#8b5cf6', 0.1), color: '#6d28d9' },
    };
    return colors[action.toUpperCase()] || { bg: alpha(tokens.colors.grey[500], 0.1), color: tokens.colors.grey[700] };
  };

  if (loading) {
    return (
      <Box component="main">
        <PageHeader title="Loading..." subtitle="Please wait" />
        <LinearProgress />
      </Box>
    );
  }

  if (!role) {
    return (
      <Box component="main">
        <PageHeader title="Role Not Found" subtitle="The role could not be loaded" />
        {error && <Alert severity="error">{error}</Alert>}
      </Box>
    );
  }

  return (
    <Box component="main">
      <PageHeader 
        title={`Role: ${role.name}`} 
        subtitle={`${permissionCount} of ${totalPermissions} permissions assigned`}
        action={
          <Button
            component={Link}
            href="/admin/settings/rbac/roles"
            variant="outlined"
            startIcon={<BackIcon />}
          >
            Back to Roles
          </Button>
        }
      />

      <Stack spacing={3}>
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

        {/* Progress Card */}
        <Card 
          sx={{ 
            borderRadius: 3, 
            boxShadow: 'none',
            border: `1px solid ${tokens.colors.grey[200]}`,
            bgcolor: tokens.colors.grey[50],
          }}
        >
          <CardContent sx={{ py: 2.5, px: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SecurityIcon sx={{ color: tokens.colors.primary.main }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Permission Coverage
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {permissionCount} permissions assigned to this role
                  </Typography>
                </Box>
              </Box>
              <Chip 
                label={`${Math.round((permissionCount / totalPermissions) * 100)}%`}
                size="small"
                sx={{
                  fontWeight: 700,
                  bgcolor: alpha(tokens.colors.primary.main, 0.1),
                  color: tokens.colors.primary.dark,
                }}
              />
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={(permissionCount / totalPermissions) * 100}
              sx={{ mt: 2, height: 6, borderRadius: 3 }}
            />
          </CardContent>
        </Card>

        {/* Permissions Card */}
        <Card 
          sx={{ 
            borderRadius: 4, 
            boxShadow: tokens.shadows.card,
            border: `1px solid ${tokens.colors.grey[200]}`,
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {/* Header */}
            <Box 
              sx={{ 
                p: 3, 
                borderBottom: `1px solid ${tokens.colors.grey[200]}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                  <KeyIcon sx={{ color: tokens.colors.primary.main }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Permissions
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Select which actions this role can perform
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                onClick={savePermissions}
                disabled={savingPermissions}
                startIcon={<SaveIcon />}
                sx={{
                  boxShadow: `0 4px 14px ${alpha(tokens.colors.primary.main, 0.35)}`,
                }}
              >
                {savingPermissions ? "Saving..." : "Save Permissions"}
              </Button>
            </Box>

            {/* Permission Groups */}
            <Box sx={{ p: 3 }}>
              <Stack spacing={2}>
                {permissionGroups.map((group) => {
                  const groupIds = group.permissions.map((p) => p.id);
                  const selectedCount = groupIds.filter(id => selectedPermissions.has(id)).length;
                  const allSelected = selectedCount === groupIds.length;
                  const someSelected = selectedCount > 0 && selectedCount < groupIds.length;
                  const isExpanded = expandedGroups.has(group.resource);

                  return (
                    <Card 
                      key={group.resource} 
                      sx={{ 
                        border: `1px solid ${tokens.colors.grey[200]}`,
                        boxShadow: 'none',
                        '&:hover': {
                          borderColor: tokens.colors.grey[300],
                        }
                      }}
                    >
                      {/* Group Header */}
                      <Box 
                        sx={{ 
                          p: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          bgcolor: allSelected 
                            ? alpha(tokens.colors.success.main, 0.03)
                            : someSelected 
                              ? alpha(tokens.colors.primary.main, 0.03)
                              : 'transparent',
                          '&:hover': {
                            bgcolor: alpha(tokens.colors.primary.main, 0.05),
                          }
                        }}
                        onClick={() => toggleExpandGroup(group.resource)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Checkbox
                            checked={allSelected}
                            indeterminate={someSelected}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleGroup(group.resource);
                            }}
                            sx={{
                              color: tokens.colors.grey[400],
                              '&.Mui-checked': {
                                color: tokens.colors.success.main,
                              },
                              '&.MuiCheckbox-indeterminate': {
                                color: tokens.colors.primary.main,
                              }
                            }}
                          />
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 2,
                              bgcolor: alpha(tokens.colors.primary.main, 0.08),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <FolderIcon sx={{ fontSize: 18, color: tokens.colors.primary.main }} />
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>
                              {group.resource.replace(/_/g, ' ')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {selectedCount}/{groupIds.length} permissions
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton size="small">
                          {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
                        </IconButton>
                      </Box>

                      {/* Permissions List */}
                      <Collapse in={isExpanded}>
                        <Divider />
                        <Box sx={{ p: 2, bgcolor: tokens.colors.grey[50] }}>
                          <FormGroup sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 1 }}>
                            {group.permissions.map((permission) => {
                              const isSelected = selectedPermissions.has(permission.id);
                              const actionColor = getActionColor(permission.action);
                              return (
                                <FormControlLabel
                                  key={permission.id}
                                  control={
                                    <Checkbox
                                      checked={isSelected}
                                      onChange={() => togglePermission(permission.id)}
                                      size="small"
                                      sx={{
                                        color: tokens.colors.grey[400],
                                        '&.Mui-checked': {
                                          color: tokens.colors.success.main,
                                        }
                                      }}
                                    />
                                  }
                                  label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Chip 
                                        label={permission.action}
                                        size="small"
                                        sx={{
                                          height: 20,
                                          fontSize: '0.6875rem',
                                          fontWeight: 600,
                                          bgcolor: actionColor.bg,
                                          color: actionColor.color,
                                        }}
                                      />
                                      {permission.scope && (
                                        <Typography variant="caption" color="text.secondary">
                                          ({permission.scope})
                                        </Typography>
                                      )}
                                    </Box>
                                  }
                                  sx={{
                                    m: 0,
                                    p: 1,
                                    borderRadius: 1,
                                    bgcolor: isSelected ? alpha(tokens.colors.success.main, 0.05) : 'white',
                                    border: `1px solid ${isSelected ? alpha(tokens.colors.success.main, 0.3) : tokens.colors.grey[200]}`,
                                    '&:hover': {
                                      bgcolor: alpha(tokens.colors.primary.main, 0.05),
                                    }
                                  }}
                                />
                              );
                            })}
                          </FormGroup>
                        </Box>
                      </Collapse>
                    </Card>
                  );
                })}
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* Menu Access Card */}
        <Card 
          sx={{ 
            borderRadius: 4, 
            boxShadow: tokens.shadows.card,
            border: `1px solid ${tokens.colors.grey[200]}`,
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {/* Header */}
            <Box 
              sx={{ 
                p: 3, 
                borderBottom: `1px solid ${tokens.colors.grey[200]}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    bgcolor: alpha(tokens.colors.warning.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MenuIcon sx={{ color: tokens.colors.warning.dark }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Menu Access
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Select which navigation items this role can see
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                onClick={saveSubmenus}
                disabled={savingSubmenus}
                startIcon={<SaveIcon />}
                sx={{
                  boxShadow: `0 4px 14px ${alpha(tokens.colors.primary.main, 0.35)}`,
                }}
              >
                {savingSubmenus ? "Saving..." : "Save Menu Access"}
              </Button>
            </Box>

            {/* Menu Tree */}
            <Box sx={{ p: 3 }}>
              <Stack spacing={2}>
                {menuTree.map((menu) => {
                  const allChecked = menu.submenus.length > 0 && menu.submenus.every((sm) => sm.checked);
                  const someChecked = menu.submenus.some((sm) => sm.checked) && !allChecked;

                  return (
                    <Card 
                      key={menu.id}
                      sx={{ 
                        border: `1px solid ${tokens.colors.grey[200]}`,
                        boxShadow: 'none',
                      }}
                    >
                      {/* Menu Header */}
                      <Box 
                        sx={{ 
                          p: 2,
                          display: 'flex',
                          alignItems: 'center',
                          bgcolor: allChecked 
                            ? alpha(tokens.colors.success.main, 0.03)
                            : someChecked 
                              ? alpha(tokens.colors.warning.main, 0.03)
                              : 'transparent',
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={allChecked}
                              indeterminate={someChecked}
                              onChange={() => toggleMenu(menu.id)}
                              sx={{
                                color: tokens.colors.grey[400],
                                '&.Mui-checked': {
                                  color: tokens.colors.success.main,
                                },
                                '&.MuiCheckbox-indeterminate': {
                                  color: tokens.colors.warning.main,
                                }
                              }}
                            />
                          }
                          label={
                            <Typography variant="subtitle2" fontWeight="bold">
                              {menu.label}
                            </Typography>
                          }
                        />
                      </Box>

                      {/* Submenus */}
                      {menu.submenus.length > 0 && (
                        <>
                          <Divider />
                          <Box sx={{ p: 2, pl: 6, bgcolor: tokens.colors.grey[50] }}>
                            <FormGroup sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 1 }}>
                              {menu.submenus.map((submenu) => (
                                <FormControlLabel
                                  key={submenu.id}
                                  control={
                                    <Checkbox
                                      checked={submenu.checked}
                                      onChange={() => toggleSubmenu(menu.id, submenu.id)}
                                      size="small"
                                      sx={{
                                        color: tokens.colors.grey[400],
                                        '&.Mui-checked': {
                                          color: tokens.colors.success.main,
                                        }
                                      }}
                                    />
                                  }
                                  label={submenu.label}
                                  sx={{
                                    m: 0,
                                    p: 1,
                                    borderRadius: 1,
                                    bgcolor: submenu.checked ? alpha(tokens.colors.success.main, 0.05) : 'white',
                                    border: `1px solid ${submenu.checked ? alpha(tokens.colors.success.main, 0.3) : tokens.colors.grey[200]}`,
                                    '&:hover': {
                                      bgcolor: alpha(tokens.colors.primary.main, 0.05),
                                    }
                                  }}
                                />
                              ))}
                            </FormGroup>
                          </Box>
                        </>
                      )}

                      {menu.submenus.length === 0 && (
                        <>
                          <Divider />
                          <Box sx={{ p: 2, pl: 6, bgcolor: tokens.colors.grey[50] }}>
                            <Typography variant="body2" color="text.secondary">
                              No submenus available
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Card>
                  );
                })}
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
