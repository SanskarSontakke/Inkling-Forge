"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search, Menu, X, Mail, Sparkles, Check, AlertTriangle, Sun, Moon,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

const NAV_LINKS = [
  { name: "Popular", href: "/popular", index: 0 },
  { name: "Creators", href: "/creators", index: 1 },
  { name: "Originals", href: "/originals", index: 2 },
];

function getTabIndex(href: string) {
  return NAV_LINKS.find((l) => l.href === href)?.index ?? -1;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { searchQuery, setSearchQuery, theme, setTheme } = useApp();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [subStatus, setSubStatus] = useState<"idle" | "success" | "error">("idle");

  // Auto-hide header on scroll down
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      window.requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const header = headerRef.current;
        if (header) {
          if (currentY <= 60) {
            // Always show when near top
            header.classList.remove("header-hidden");
          } else if (currentY > lastScrollY.current + 4) {
            // Scrolling down — hide
            header.classList.add("header-hidden");
          } else if (currentY < lastScrollY.current - 4) {
            // Scrolling up — show
            header.classList.remove("header-hidden");
          }
        }
        lastScrollY.current = currentY;
        ticking.current = false;
      });
      ticking.current = true;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const handleSubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setSubStatus("error");
      return;
    }
    setSubStatus("success");
    setEmail("");
    setTimeout(() => {
      setSubStatus("idle");
      setSubscribeModalOpen(false);
    }, 2500);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (
      pathname !== "/" &&
      pathname !== "/popular" &&
      pathname !== "/creators" &&
      pathname !== "/originals"
    ) {
      router.push("/");
    }
  };

  /** Navigate with a directional View Transition */
  const handleNavClick = (
    e: React.MouseEvent,
    href: string,
  ) => {
    e.preventDefault();
    if (pathname === href) return;

    const currentIdx = getTabIndex(pathname);
    const targetIdx = getTabIndex(href);
    const dir = targetIdx > currentIdx ? "forward" : "back";

    document.documentElement.setAttribute("data-nav-dir", dir === "back" ? "back" : "forward");

    if ("startViewTransition" in document) {
      document.startViewTransition(() => {
        router.push(href);
      });
    } else {
      router.push(href);
    }

    // Clean up direction attribute after transition
    setTimeout(() => {
      document.documentElement.removeAttribute("data-nav-dir");
    }, 600);
  };

  return (
    <>
      <header
        ref={headerRef}
        className="w-full top-0 sticky z-50 bg-header-bg text-foreground border-b-3 border-border-color brutal-shadow"
      >
        <div className="flex flex-col items-center w-full md:max-w-[80%] mx-auto px-4 py-3 gap-3">
          {/* Row 1: Logo & Actions */}
          <div className="flex items-center justify-between w-full">
            <Link href="/" onClick={() => setSearchQuery("")} className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 md:w-12 md:h-12 border-3 border-border-color bg-card-bg rounded-lg overflow-hidden brutal-shadow transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 flex items-center justify-center p-1 shrink-0">
                <img
                  src="/logo-icon.png"
                  alt="Inkling Forge Icon"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-headline text-3xl md:text-4xl uppercase tracking-tighter text-[#ef6540] dark:text-primary font-black cursor-pointer select-none">
                INKLING_FORGE
              </span>
            </Link>

            <div className="flex items-center gap-2">
              {/* Subscribe: hidden on mobile */}
              <button
                onClick={() => setSubscribeModalOpen(true)}
                className="hidden md:flex bg-primary hover:bg-[#ffb4a1] dark:hover:bg-primary/80 text-white dark:text-background font-label font-bold text-sm px-5 py-2 border-3 border-border-color brutal-shadow brutal-shadow-hover brutal-shadow-active cursor-pointer rounded-lg"
              >
                SUBSCRIBE
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setDrawerOpen(!drawerOpen)}
                className="md:hidden p-2 border-3 border-border-color bg-secondary hover:bg-primary text-white dark:text-background brutal-shadow cursor-pointer rounded-lg"
                aria-label="Open menu"
              >
                {drawerOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Row 2: Desktop Navigation & Search */}
          <nav className="hidden md:flex items-center justify-between w-full gap-4 border-t border-border-color/20 pt-2">
            <div className="flex gap-6">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`font-label text-sm uppercase font-bold relative py-1 hover:text-primary cursor-pointer ${
                      isActive ? "text-primary" : "text-foreground/80"
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-[3px] bg-primary border border-border-color" />
                    )}
                  </a>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              {/* Theme Switcher */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-1.5 border-3 border-border-color bg-secondary hover:bg-primary text-white dark:text-background brutal-shadow hover:translate-x-[-1px] hover:translate-y-[-1px] cursor-pointer flex items-center justify-center rounded-lg"
                title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
              </button>

              <div className="relative flex-1 max-w-[240px] min-w-[160px]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search multiverse..."
                  className="w-full bg-background dark:bg-card-bg text-foreground border-3 border-border-color font-label font-bold text-xs px-3 py-1.5 focus:outline-none placeholder:text-foreground/50 rounded-lg"
                />
                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground" />
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* ── Mobile Left Drawer ── */}
      {/* Backdrop */}
      <div
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        className={`fixed top-0 left-0 h-full w-[280px] z-[70] bg-header-bg border-r-4 border-border-color brutal-shadow flex flex-col md:hidden transform transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Navigation menu"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between p-4 border-b-3 border-border-color">
          <Link href="/" onClick={() => setDrawerOpen(false)} className="flex items-center gap-2">
            <div className="w-8 h-8 border-3 border-border-color bg-card-bg rounded-lg overflow-hidden brutal-shadow flex items-center justify-center p-0.5 shrink-0">
              <img
                src="/logo-icon.png"
                alt="Inkling Forge Icon"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-headline text-2xl uppercase tracking-tighter text-[#ef6540] dark:text-primary font-black select-none">
              INKLING_FORGE
            </span>
          </Link>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 border-3 border-border-color bg-secondary text-white brutal-shadow cursor-pointer rounded-lg"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-2 p-4 font-label flex-grow">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  handleNavClick(e, link.href);
                  setDrawerOpen(false);
                }}
                className={`text-lg uppercase font-bold p-3 border-3 border-border-color brutal-shadow cursor-pointer text-center rounded-lg ${
                  isActive
                    ? "bg-primary text-white"
                    : "bg-background dark:bg-card-bg text-foreground hover:bg-primary hover:text-white"
                }`}
              >
                {link.name}
              </a>
            );
          })}
        </nav>

        {/* Bottom of drawer: search + theme */}
        <div className="p-4 border-t-3 border-border-color space-y-3">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search multiverse..."
              className="w-full bg-background dark:bg-card-bg text-foreground border-3 border-border-color font-label font-bold text-sm px-4 py-2 focus:outline-none rounded-lg"
            />
            <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground" />
          </div>

          <button
            onClick={() => {
              setTheme(theme === "dark" ? "light" : "dark");
              setDrawerOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 p-2.5 border-3 border-border-color bg-secondary hover:bg-primary text-white font-label font-bold text-sm brutal-shadow cursor-pointer rounded-lg"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            {theme === "dark" ? "LIGHT MODE" : "DARK MODE"}
          </button>
        </div>
      </aside>

      {/* ── Subscribe Modal ── */}
      {subscribeModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-border-color/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-card-bg border-4 border-border-color brutal-shadow p-6 md:p-8 rounded-xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setSubscribeModalOpen(false);
                setSubStatus("idle");
              }}
              className="absolute top-4 right-4 p-1 bg-secondary border-3 border-border-color brutal-shadow hover:translate-x-[-1px] hover:translate-y-[-1px] cursor-pointer rounded"
            >
              <X size={18} className="text-white" />
            </button>

            {subStatus === "idle" && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-primary text-white p-2 border-3 border-border-color brutal-shadow transform -rotate-6 rounded">
                    <Sparkles size={24} />
                  </div>
                  <h3 className="font-headline text-2xl uppercase tracking-tight text-foreground">
                    SUBSCRIBE TO BLAST!
                  </h3>
                </div>
                <p className="font-body text-sm text-foreground/80 mb-6 leading-relaxed">
                  Join the elite crew for weekly manifestos, custom wallpapers, and exclusive indie drops straight from the underground.
                </p>

                <form onSubmit={handleSubscribeSubmit} className="space-y-4">
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="ENTER YOUR COMIC CORES EMAIL"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-background dark:bg-card-bg text-foreground border-3 border-border-color font-label font-bold text-sm px-4 py-3 focus:outline-none placeholder:text-foreground/40 rounded-lg"
                    />
                    <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground" />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-secondary hover:bg-primary text-white font-label font-bold text-sm tracking-widest border-3 border-border-color brutal-shadow brutal-shadow-hover brutal-shadow-active cursor-pointer rounded-lg"
                  >
                    BLAST OFF!
                  </button>
                </form>
              </>
            )}

            {subStatus === "success" && (
              <div className="text-center py-6 flex flex-col items-center">
                <div className="bg-secondary text-white p-4 border-3 border-border-color brutal-shadow rounded-full mb-4 animate-bounce">
                  <Check size={40} />
                </div>
                <h4 className="font-headline text-2xl text-foreground uppercase mb-2">
                  TRANSMISSION RECEIVED!
                </h4>
                <p className="font-body text-sm text-foreground/80">
                  Welcome to Inkling Forge. Watch your inbox for incoming sequence files!
                </p>
              </div>
            )}

            {subStatus === "error" && (
              <div className="text-center py-6 flex flex-col items-center">
                <div className="bg-primary text-white p-4 border-3 border-border-color brutal-shadow rounded-full mb-4">
                  <AlertTriangle size={40} />
                </div>
                <h4 className="font-headline text-2xl text-foreground uppercase mb-2">
                  TRANSMISSION FAIL
                </h4>
                <p className="font-body text-sm text-foreground/80 mb-4">
                  The orbital uplink requires a valid email matrix address.
                </p>
                <button
                  onClick={() => setSubStatus("idle")}
                  className="px-6 py-2 bg-secondary border-3 border-border-color brutal-shadow brutal-shadow-hover font-label font-bold rounded"
                >
                  TRY AGAIN
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
