"use client";

import { useEffect } from "react";
import type { Metadata } from "next";

export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Add class to body to hide header/footer
    document.body.classList.add("auth-page");
    return () => {
      document.body.classList.remove("auth-page");
    };
  }, []);

  return (
    <div className="auth-standalone">
      {children}
    </div>
  );
}
