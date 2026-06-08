"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, BookOpen, Users, TrendingUp, Sparkles, LogOut, ArrowLeft } from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: "Dashboard", href: "/admin-reserved/dashboard", icon: LayoutDashboard },
    { name: "Comics", href: "/admin-reserved/comics", icon: BookOpen },
    { name: "Creators", href: "/admin-reserved/creators", icon: Users },
    { name: "Trending", href: "/admin-reserved/trending", icon: TrendingUp },
    { name: "Originals", href: "/admin-reserved/originals", icon: Sparkles },
  ];

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/admin/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/admin-reserved");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside className="w-64 bg-card-bg border-r-4 border-border-color h-screen flex flex-col justify-between p-6 sticky top-0 z-30 select-none">
      <div className="space-y-8">
        {/* Admin Branding Logo */}
        <div>
          <Link href="/">
            <span className="flex items-center gap-1.5 font-label font-black text-xs text-foreground/50 hover:text-primary transition-colors cursor-pointer mb-2">
              <ArrowLeft size={12} /> BACK TO SITE
            </span>
          </Link>
          <div className="bg-[#ef6540] border-3 border-[#1B1C1A] brutal-shadow p-3 rotate-1 flex items-center gap-3">
            <div className="w-10 h-10 bg-white border-2 border-[#1B1C1A] rounded flex items-center justify-center p-0.5 shrink-0">
              <img
                src="/logo-icon.png"
                alt="Inkling Forge Icon"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="font-headline text-base font-black text-white leading-none tracking-tight">
                INKLING FORGE
              </h1>
              <p className="font-label text-[8px] text-white/80 font-bold uppercase tracking-widest mt-0.5">
                ADMIN CONTROL
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-3">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link href={item.href} key={item.name}>
                <span
                  className={`flex items-center gap-3 px-4 py-3 font-label font-bold text-xs uppercase border-3 border-[#1B1C1A] brutal-shadow transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#fabb59] text-[#1B1C1A] translate-x-1 -translate-y-1 shadow-[6px_6px_0px_0px_#1B1C1A]"
                      : "bg-card-bg text-foreground hover:bg-[#ffb4a1] hover:text-[#1B1C1A] hover:translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#1B1C1A]"
                  }`}
                >
                  <Icon size={16} />
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Footer */}
      <div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#ef6540] text-white font-label font-bold text-xs uppercase border-3 border-[#1B1C1A] brutal-shadow brutal-shadow-hover transition-all cursor-pointer"
        >
          <LogOut size={16} />
          LOG OUT CONSOLE
        </button>
      </div>
    </aside>
  );
}
