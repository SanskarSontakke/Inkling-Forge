"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function EditModal({ isOpen, onClose, title, children }: EditModalProps) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-card-bg border-4 border-border-color brutal-shadow p-6 rounded-lg z-10 max-h-[90vh] overflow-y-auto text-foreground">
        {/* Header */}
        <div className="flex items-center justify-between border-b-3 border-border-color/10 pb-4 mb-4">
          <h3 className="font-headline text-lg uppercase font-black tracking-wide text-foreground">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 bg-card-bg hover:bg-[#ffb4a1] text-foreground border-2 border-border-color brutal-shadow brutal-shadow-hover transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}
