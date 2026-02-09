import AppShell from "@/components/layout/AppShell";
import { ToastProvider } from "@/contexts/ToastContext";

export default function ProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <AppShell>{children}</AppShell>
    </ToastProvider>
  );
}
