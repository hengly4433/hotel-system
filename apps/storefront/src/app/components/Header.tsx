"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clearCustomerToken, getCustomerToken } from "@/lib/customerAuth";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Our Room", href: "/rooms" },
  { label: "Gallery", href: "/gallery" },
  { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" }
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCustomer, setIsCustomer] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsCustomer(Boolean(getCustomerToken()));
    const handleStorage = () => {
      setIsCustomer(Boolean(getCustomerToken()));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    setIsCustomer(Boolean(getCustomerToken()));
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleResize = () => {
      if (window.innerWidth > 860) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [menuOpen]);

  return (
    <header className={`header-glass ${scrolled ? "scrolled" : ""}`}>
      <div className="container flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" style={{ fontWeight: 700 }}>
          <span
            style={{
              fontFamily: "var(--font-heading, 'Playfair Display', serif)",
              fontSize: "1.8rem",
              letterSpacing: "0.05em",
              background: "linear-gradient(45deg, #0f172a, #0f766e)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 800,
              textShadow: "none"
            }}
          >
            SKY HIGH HOTEL
          </span>
        </Link>

        <nav className="nav-links">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className="nav-link" data-active={isActive ? "true" : "false"}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="nav-actions">
          {isCustomer ? (
            <>
              <Link href="/reservations" className="btn secondary">
                My Reservations
              </Link>
              <button
                className="btn secondary"
                type="button"
                onClick={() => {
                  clearCustomerToken();
                  setIsCustomer(false);
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/auth/sign-in" className="btn secondary">
              Sign In
            </Link>
          )}
          <Link href="/#booking" className="btn btn-primary">
            Book Now
          </Link>
          <button
            className="nav-toggle"
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className={`nav-panel ${menuOpen ? "open" : ""}`}>
        <div className="nav-panel-inner">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-panel-link"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {!isCustomer ? (
            <Link href="/auth/sign-in" className="btn btn-primary" onClick={() => setMenuOpen(false)}>
              Sign In
            </Link>
          ) : (
            <>
              <Link href="/reservations" className="btn btn-primary" onClick={() => setMenuOpen(false)}>
                My Reservations
              </Link>
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => {
                  clearCustomerToken();
                  setIsCustomer(false);
                  setMenuOpen(false);
                }}
              >
                Sign Out
              </button>
            </>
          )}
          <Link href="/#booking" className="btn btn-primary" onClick={() => setMenuOpen(false)}>
            Book Now
          </Link>
        </div>
      </div>
    </header>
  );
}
