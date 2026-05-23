"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

type NavItem = { href: string; label: string };

export function PortfolioNav({ items }: { items: NavItem[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState(items[0]?.href ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
      for (const item of [...items].reverse()) {
        const id = item.href.replace("#", "");
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActive(item.href);
          break;
        }
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  // Close mobile menu on scroll
  useEffect(() => {
    if (mobileOpen) {
      const close = () => setMobileOpen(false);
      window.addEventListener("scroll", close, { once: true, passive: true });
      return () => window.removeEventListener("scroll", close);
    }
  }, [mobileOpen]);

  function handleNavClick(href: string) {
    setMobileOpen(false);
    setActive(href);
  }

  const navLinkBase = "px-3 py-1.5 text-sm rounded-md transition-colors";
  const activeClass = scrolled
    ? "text-foreground font-medium bg-accent"
    : "text-white font-medium bg-white/20";
  const inactiveClass = scrolled
    ? "text-muted-foreground hover:text-foreground hover:bg-accent/60"
    : "text-white/70 hover:text-white hover:bg-white/10";

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-200 ${
          scrolled
            ? "bg-background/95 backdrop-blur-sm border-b shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <span
            className={`font-semibold text-sm transition-colors ${
              scrolled ? "text-foreground" : "text-white/90"
            }`}
          >
            Dev Business Assistant
          </span>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-0.5">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => handleNavClick(item.href)}
                className={`${navLinkBase} ${active === item.href ? activeClass : inactiveClass}`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            className={`sm:hidden flex items-center justify-center h-9 w-9 rounded-lg transition-colors ${
              scrolled
                ? "text-foreground hover:bg-accent"
                : "text-white hover:bg-white/15"
            }`}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="sm:hidden fixed inset-x-0 top-[52px] z-40 bg-background/97 backdrop-blur-sm border-b shadow-lg">
          <nav className="max-w-4xl mx-auto px-4 py-3 flex flex-col gap-1">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => handleNavClick(item.href)}
                className={`px-4 py-2.5 text-sm rounded-lg transition-colors ${
                  active === item.href
                    ? "font-medium bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
