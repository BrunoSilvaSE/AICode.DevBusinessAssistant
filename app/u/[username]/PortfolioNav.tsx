"use client";

import { useEffect, useState } from "react";

type NavItem = { href: string; label: string };

export function PortfolioNav({ items }: { items: NavItem[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState(items[0]?.href ?? "");

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

  return (
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
        <nav className="hidden sm:flex items-center gap-0.5">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                active === item.href
                  ? scrolled
                    ? "text-foreground font-medium bg-accent"
                    : "text-white font-medium bg-white/20"
                  : scrolled
                  ? "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
