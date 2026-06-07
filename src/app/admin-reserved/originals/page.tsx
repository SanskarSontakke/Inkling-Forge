"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Check, Save } from "lucide-react";

interface ComicOriginal {
  id: string;
  title: string;
  is_original: boolean;
}

export default function AdminOriginals() {
  const [comics, setComics] = useState<ComicOriginal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/admin/comics")
      .then((res) => res.json())
      .then((data) => {
        const list = (data.comics || []).map((c: any) => ({
          id: c.id,
          title: c.title,
          is_original: !!c.is_original
        }));
        setComics(list);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const toggleOriginal = (comicId: string) => {
    setComics((prev) =>
      prev.map((c) => (c.id === comicId ? { ...c, is_original: !c.is_original } : c))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);

    const originalIds = comics.filter((c) => c.is_original).map((c) => c.id);

    try {
      const res = await fetch("/api/admin/comics/originals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalIds }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert("Failed to save originals configuration.");
      }
    } catch (err) {
      alert("Network transmission error.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 text-foreground animate-pulse">
        <div className="h-9 w-64 border-3 border-border-color rounded bg-gray-300 dark:bg-gray-700 skeleton-shimmer" />
        <div className="h-56 border-3 border-border-color bg-card-bg rounded-lg skeleton-shimmer" />
      </div>
    );
  }

  return (
    <div className="space-y-8 text-foreground pb-20">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#ef6540] text-white border-3 border-[#1B1C1A] brutal-shadow rounded-lg">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="font-headline text-2xl md:text-3xl font-black uppercase tracking-tight leading-none">
              ORIGINALS SELECTIONS
            </h1>
            <p className="font-body text-xs text-foreground/60 mt-1">
              Mark which series are Inkling Forge exclusives (displayed on the Originals showcase page).
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-1.5 px-6 py-3 bg-[#fabb59] hover:bg-[#ef6540] text-[#1B1C1A] hover:text-white font-label font-bold text-xs uppercase border-3 border-[#1B1C1A] brutal-shadow brutal-shadow-hover transition-all cursor-pointer relative disabled:opacity-50"
        >
          {saveSuccess ? (
            <>
              <Check size={16} /> CONFIGURATION SAVED
            </>
          ) : (
            <>
              <Save size={16} /> {saving ? "PERSISTING..." : "SAVE CONFIGURATION"}
            </>
          )}
        </button>
      </section>

      {/* Checklist Grid */}
      <section className="bg-card-bg border-3 border-border-color brutal-shadow p-6 rounded-lg space-y-4 max-w-2xl">
        <h3 className="font-headline text-base uppercase font-bold border-b-2 border-border-color/10 pb-2">
          SERIES CHECKLIST
        </h3>

        {comics.length === 0 ? (
          <div className="text-center py-8 font-label text-xs text-foreground/50 uppercase">
            No comics in database. Create comics first.
          </div>
        ) : (
          <div className="space-y-3">
            {comics.map((comic) => (
              <div
                key={comic.id}
                onClick={() => toggleOriginal(comic.id)}
                className="flex items-center gap-3 p-3 border-2 border-border-color/20 bg-background/30 hover:bg-[#ffb4a1]/5 cursor-pointer rounded select-none transition-colors"
              >
                <input
                  type="checkbox"
                  checked={comic.is_original}
                  onChange={() => {}} // toggled by parent div onClick
                  className="w-4.5 h-4.5 border-2 border-[#1B1C1A] accent-[#ef6540] pointer-events-none"
                />
                <span className="font-headline text-sm font-bold uppercase">{comic.title}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
