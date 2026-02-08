export type RbacMenu = {
  id: string;
  key: string;
  label: string;
  sortOrder: number;
};

export type RbacSubmenu = {
  id: string;
  menuId: string;
  key: string;
  label: string;
  route: string;
  sortOrder: number;
};

export type RbacPermission = {
  id: string;
  resource: string;
  action: string;
  scope?: string | null;
};

export type RbacRole = {
  id: string;
  name: string;
  propertyId?: string | null;
};

export type RbacUser = {
  id: string;
  email: string;
  status: "ACTIVE" | "SUSPENDED";
  propertyId?: string | null;
  roleIds?: string[];
  roleNames?: string[];
};

export type PermissionGroup = {
  resource: string;
  permissions: RbacPermission[];
};

export type MenuTreeSubmenu = {
  id: string;
  key: string;
  label: string;
  route: string;
  sortOrder: number;
  checked: boolean;
};

export type MenuTree = {
  id: string;
  key: string;
  label: string;
  sortOrder: number;
  submenus: MenuTreeSubmenu[];
};

export type NavigationSubmenu = {
  id: string;
  key: string;
  label: string;
  route: string;
  sortOrder: number;
};

export type NavigationMenu = {
  id: string;
  key: string;
  label: string;
  sortOrder: number;
  submenus: NavigationSubmenu[];
};
