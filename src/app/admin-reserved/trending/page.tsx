"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, ArrowUp, ArrowDown, Check, Save } from "lucide-react";

interface ComicRanking {
  id: string;
  title: string;
  is_trending: boolean;
  trending_rank: number;
}

export default function AdminTrending() {
  const [comics, setComics] = useState<ComicRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/admin/trending")
      .then((res) => res.json())
      .then((data) => setComics(data.comics || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Split into trending and non-trending
  const trendingList = comics.filter((c) => c.is_trending);
  const nonTrendingList = comics.filter((c) => !c.is_trending);

  const toggleTrending = (comicId: string) => {
    setComics((prev) =>
      prev.map((c) => {
        if (c.id === comicId) {
          const nextVal = !c.is_trending;
          return {
            ...c,
            is_trending: nextVal,
            trending_rank: nextVal ? trendingList.length + 1 : 0
          };
        }
        return c;
      })
    );
  };

  const moveRank = (index: number, direction: "up" | "down") => {
    const activeTrending = [...trendingList];
    if (direction === "up" && index > 0) {
      const temp = activeTrending[index];
      activeTrending[index] = activeTrending[index - 1];
      activeTrending[index - 1] = temp;
    } else if (direction === "down" && index < activeTrending.length - 1) {
      const temp = activeTrending[index];
      activeTrending[index] = activeTrending[index + 1];
      activeTrending[index + 1] = temp;
    }

    // Re-index ranks
    const reorderedTrending = activeTrending.map((item, idx) => ({
      ...item,
      trending_rank: idx + 1
    }));

    // Reconstruct full comics state
    setComics((prev) =>
      prev.map((c) => {
        const matchingTrending = reorderedTrending.find((item) => item.id === c.id);
        if (matchingTrending) {
          return matchingTrending;
        }
        // If not in trending, keep it non-trending
        if (c.is_trending) {
          // If it was trending but somehow missing from the array (shouldn't happen)
          return { ...c, is_trending: false, trending_rank: 0 };
        }
        return c;
      })
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);

    // Get order list of IDs for trending
    const trendingIds = trendingList.map((c) => c.id);

    try {
      const res = await fetch("/api/admin/trending", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trendingIds }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert("Failed to save trending configuration.");
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
            <TrendingUp size={24} />
          </div>
          <div>
            <h1 className="font-headline text-2xl md:text-3xl font-black uppercase tracking-tight leading-none">
              TRENDING CONFIGURATION
            </h1>
            <p className="font-body text-xs text-foreground/60 mt-1">
              Select which series are featured in trending lists and reorder their rank indexes.
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

      {/* Main configuration grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Trending Queue */}
        <section className="space-y-4">
          <div className="border-b-3 border-border-color/10 pb-2">
            <h2 className="font-headline text-lg uppercase font-black tracking-wide">
              TRENDING QUEUE ({trendingList.length})
            </h2>
            <p className="font-body text-[10px] text-foreground/50 uppercase mt-0.5">
              These series are featured in the main homepage/popular grid. Use arrow keys to reorder rankings.
            </p>
          </div>

          {trendingList.length === 0 ? (
            <div className="border-3 border-dashed border-border-color p-8 text-center rounded-lg text-foreground/40 font-label font-bold text-xs uppercase bg-card-bg">
              Queue is empty. Select from the pool to populate.
            </div>
          ) : (
            <div className="border-3 border-border-color bg-card-bg brutal-shadow p-2 divide-y divide-border-color/10">
              {trendingList.map((comic, index) => (
                <div key={comic.id} className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 border-2 border-[#1B1C1A] bg-[#ef6540] text-white flex items-center justify-center font-headline text-xs font-bold rounded">
                      {index + 1}
                    </span>
                    <span className="font-headline text-xs md:text-sm font-bold uppercase">{comic.title}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => moveRank(index, "up")}
                      disabled={index === 0}
                      className="p-1 border border-border-color hover:bg-foreground/5 disabled:opacity-30 rounded"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => moveRank(index, "down")}
                      disabled={index === trendingList.length - 1}
                      className="p-1 border border-border-color hover:bg-foreground/5 disabled:opacity-30 rounded"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      onClick={() => toggleTrending(comic.id)}
                      className="px-2 py-1 bg-[#ffb4a1] border border-[#1B1C1A] font-label text-[9px] font-bold uppercase hover:bg-[#ef6540] hover:text-white rounded"
                    >
                      REMOVE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right Column: Pool selection */}
        <section className="space-y-4">
          <div className="border-b-3 border-border-color/10 pb-2">
            <h2 className="font-headline text-lg uppercase font-black tracking-wide">
              SERIES POOL ({nonTrendingList.length})
            </h2>
            <p className="font-body text-[10px] text-foreground/50 uppercase mt-0.5">
              Select series below to promote them into the trending queue.
            </p>
          </div>

          {nonTrendingList.length === 0 ? (
            <div className="border-3 border-dashed border-border-color p-8 text-center rounded-lg text-foreground/40 font-label font-bold text-xs uppercase bg-card-bg">
              All comics are currently promoted to trending.
            </div>
          ) : (
            <div className="border-3 border-border-color bg-card-bg brutal-shadow p-2 divide-y divide-border-color/10">
              {nonTrendingList.map((comic) => (
                <div key={comic.id} className="flex items-center justify-between p-3">
                  <span className="font-headline text-xs md:text-sm font-bold uppercase">{comic.title}</span>
                  <button
                    onClick={() => toggleTrending(comic.id)}
                    className="px-3 py-1.5 bg-[#efe1c7] border-2 border-[#1B1C1A] brutal-shadow brutal-shadow-hover font-label text-[10px] font-bold uppercase hover:bg-[#ef6540] hover:text-white"
                  >
                    PROMOTE
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
