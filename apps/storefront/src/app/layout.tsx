import "./globals.css";
import type { Metadata } from "next";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";

export const metadata: Metadata = {
  title: "Harborlight Hotel | Coastal Retreat",
  description: "A quieter kind of luxury, right by the harbor."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="page-shell">
          <Header />
            {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
