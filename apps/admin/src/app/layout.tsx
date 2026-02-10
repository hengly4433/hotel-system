import "./globals.css";
import type { Metadata } from "next";
import ThemeRegistry from "@/components/ThemeRegistry";

export const metadata: Metadata = {
  title: "Hotel Admin",
  description: "Hotel management admin"
};

import { UserProvider } from "@/contexts/UserContext";

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <UserProvider>
            {children}
          </UserProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
