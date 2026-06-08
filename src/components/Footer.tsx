"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full mt-auto border-t-3 border-border-color bg-card-bg text-foreground transition-colors duration-75">
      <div className="flex flex-col items-center justify-center w-full md:max-w-[80%] mx-auto py-12 px-4 text-center space-y-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 border-3 border-border-color bg-card-bg rounded-lg overflow-hidden brutal-shadow transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 flex items-center justify-center p-1 shrink-0">
            <img
              src="/logo-icon.png"
              alt="Inkling Forge Icon"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-headline text-3xl uppercase tracking-tighter font-black text-foreground cursor-pointer select-none">
            INKLING_FORGE
          </span>
        </Link>
        
        <div className="flex flex-wrap justify-center gap-6">
          {["Terms", "Privacy", "Careers", "Support"].map((item) => (
            <a
              key={item}
              href="#"
              className="font-label text-xs uppercase font-bold text-foreground/70 hover:text-primary transition-colors"
            >
              {item}
            </a>
          ))}
        </div>
        
        <div className="text-[10px] md:text-xs font-label text-foreground/60 leading-tight max-w-[400px]">
          © 2026 INKLING FORGE UNLIMITED. NO REPRODUCTION WITHOUT PERMISSION. ALL RIGHTS RESERVED. POWERED BY PURE ANALOG ENERGY.
        </div>
      </div>
    </footer>
  );
}
