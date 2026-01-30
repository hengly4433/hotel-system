import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";

const links = [
  { href: "/admin/settings/rbac/users", label: "Users" },
  { href: "/admin/settings/rbac/roles", label: "Roles" },
  { href: "/admin/settings/rbac/menus", label: "Menus" },
  { href: "/admin/settings/rbac/submenus", label: "Submenus" },
  { href: "/admin/settings/rbac/permissions", label: "Permissions" }
];

export default function RbacHomePage() {
  return (
    <main>
      <PageHeader title="RBAC" subtitle="Manage access control" />
      <div style={{ background: "white", padding: 24, borderRadius: 10 }}>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {links.map((link) => (
            <li key={link.href} style={{ marginBottom: 8 }}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
