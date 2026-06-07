"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Star, AlertTriangle, RotateCcw, ChevronRight, Eye, Search } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface Comic {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  bannerImage: string;
  description: string;
  genre: string;
  reads: string;
  score: string;
  isOriginal: boolean;
  creatorIds: string[];
}

export default function Home() {
  const { searchQuery, setSearchQuery } = useApp();
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [loading, setLoading] = useState<boolean>(true);
  const [comics, setComics] = useState<Comic[]>([]);
  const [email, setEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "success" | "error">("idle");

  const genres = ["All", "Action", "Fantasy", "Sci-Fi", "Originals"];

  // Fetch comics based on filters
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const controller = new AbortController();
    
    // Enforce 0.5s minimum loading state to showcase skeletons
    const timerPromise = new Promise((resolve) => setTimeout(resolve, 500));
    
    const fetchPromise = fetch(
      `/api/public/comics?genre=${encodeURIComponent(selectedGenre)}&search=${encodeURIComponent(searchQuery)}`,
      { signal: controller.signal }
    )
      .then((res) => {
        if (!res.ok) throw new Error("Uplink failure");
        return res.json();
      })
      .then((data) => data.comics || [])
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Fetch error:", err);
          return [];
        }
        return null;
      });

    Promise.all([fetchPromise, timerPromise]).then(([fetchedComics]) => {
      if (isMounted && fetchedComics !== null) {
        setComics(fetchedComics);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [selectedGenre, searchQuery]);

  // Handle newsletter form submission
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setNewsletterStatus("error");
      return;
    }
    setNewsletterStatus("success");
    setEmail("");
    setTimeout(() => setNewsletterStatus("idle"), 4000);
  };

  // Check special states for demo
  const isSearchError = searchQuery.toLowerCase() === "error";
  const isSearchEmpty = searchQuery.toLowerCase() === "empty";
  const showEmptyView = isSearchEmpty || (!loading && comics.length === 0 && !isSearchError);

  // Determine hero comic
  const heroComic = comics.find((c) => c.slug === "cyberpunk-neon-blood") || comics[0];

  return (
    <div className="w-full md:max-w-[80%] mx-auto px-4 py-8 space-y-12">
      {/* 1. Cinematic Hero Section */}
      {heroComic ? (
        <section className="relative w-full border-4 border-[#1B1C1A] bg-[#fabb59] brutal-shadow rounded-lg overflow-hidden group">
          <div className="relative aspect-[16/10] md:aspect-[16/8] w-full bg-neutral-800">
            {heroComic.bannerImage ? (
              <img
                src={heroComic.bannerImage}
                alt={heroComic.title}
                className="w-full h-full object-cover grayscale contrast-125 brightness-75 group-hover:scale-102 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#1B1C1A] font-headline text-3xl font-black">
                {heroComic.title}
              </div>
            )}
            {/* Neon Gradient Accent overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#130d02] via-transparent to-transparent opacity-90" />
            
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-[#ef6540] text-white font-label font-bold text-xs uppercase px-3 py-1 border-3 border-[#1B1C1A] brutal-shadow transform -rotate-2">
                FEATURED
              </span>
              {heroComic.isOriginal && (
                <span className="bg-[#ffb4a1] text-[#1B1C1A] font-label font-bold text-xs uppercase px-3 py-1 border-3 border-[#1B1C1A] brutal-shadow transform rotate-3">
                  ORIGINAL
                </span>
              )}
            </div>
          </div>

          <div className="p-6 md:p-8 bg-card-bg border-t-4 border-border-color text-foreground space-y-4">
            <h2 className="font-headline text-3xl md:text-4xl uppercase tracking-tighter text-[#ef6540] font-black leading-none">
              {heroComic.title}
            </h2>
            <p className="font-body text-sm md:text-base text-foreground/80 leading-relaxed line-clamp-3">
              {heroComic.description}
            </p>
            
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-4 text-xs font-label">
                <span className="flex items-center gap-1">
                  <Star size={14} className="text-[#fabb59] fill-[#fabb59]" /> {heroComic.score} SCORE
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={14} className="text-[#ffb4a1]" /> {heroComic.reads} READS
                </span>
              </div>
              
              <Link href={`/reader/${heroComic.slug}`}>
                <span className="inline-flex items-center gap-2 bg-[#fabb59] hover:bg-[#ef6540] text-[#1B1C1A] hover:text-white font-label font-bold text-sm px-6 py-2.5 border-3 border-[#1B1C1A] brutal-shadow brutal-shadow-hover brutal-shadow-active transition-all cursor-pointer">
                  READ SERIES <ChevronRight size={16} />
                </span>
              </Link>
            </div>
          </div>
        </section>
      ) : loading ? (
        /* Hero Section Loading Skeleton */
        <section className="relative w-full border-4 border-[#1B1C1A] bg-card-bg brutal-shadow rounded-lg overflow-hidden animate-pulse">
          <div className="relative aspect-[16/10] md:aspect-[16/8] w-full bg-gray-300 skeleton-shimmer" />
          <div className="p-6 md:p-8 border-t-4 border-border-color space-y-4">
            <div className="h-8 w-1/3 bg-gray-300 rounded border-3 border-[#1B1C1A] skeleton-shimmer" />
            <div className="h-4 w-full bg-gray-300 rounded border-3 border-[#1B1C1A] skeleton-shimmer" />
            <div className="h-4 w-5/6 bg-gray-300 rounded border-3 border-[#1B1C1A] skeleton-shimmer" />
          </div>
        </section>
      ) : null}

      {/* 2. Comic Filter & Showcase Area */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-headline text-2xl uppercase tracking-tight text-foreground">
            {searchQuery ? "Search Matrix Results" : "Latest Releases"}
          </h3>
          
          {/* Genre navigation tags */}
          <div className="flex flex-wrap gap-2">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => {
                  setSearchQuery("");
                  setSelectedGenre(g);
                }}
                className={`font-label font-bold text-xs uppercase px-4 py-2 border-3 border-[#1B1C1A] brutal-shadow transition-all cursor-pointer ${
                  selectedGenre === g && !searchQuery
                    ? "bg-[#ef6540] text-white -translate-y-0.5 shadow-[4px_4px_0px_0px_#1B1C1A]"
                    : "bg-card-bg text-foreground hover:bg-[#ffb4a1] hover:text-[#1B1C1A]"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic States Grid */}
        {isSearchError ? (
          /* SYSTEM STATE: Search Error View */
          <div className="border-4 border-[#1B1C1A] bg-[#ef6540] text-white brutal-shadow p-8 rounded-lg text-center space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-red-800 border-3 border-[#1B1C1A] brutal-shadow rounded-full animate-bounce">
              <AlertTriangle size={36} />
            </div>
            <h4 className="font-headline text-2xl uppercase font-black tracking-wider">
              UPLINK ERROR: MATRIX CORRUPTED
            </h4>
            <p className="font-body text-sm opacity-90 max-w-md mx-auto">
              Warning! Matrix scanner registers a segmentation fault code (0x889F) at search matrix level. Secure frequency re-configuration is highly advised.
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="inline-flex items-center gap-2 bg-[#fabb59] hover:bg-white text-[#1B1C1A] font-label font-bold text-xs px-6 py-3 border-3 border-[#1B1C1A] brutal-shadow brutal-shadow-hover transition-all cursor-pointer"
            >
              <RotateCcw size={14} /> RE-ENGAGE SAFE FREQUENCY
            </button>
          </div>
        ) : showEmptyView ? (
          /* SYSTEM STATE: Empty Results View */
          <div className="border-4 border-border-color bg-card-bg text-foreground brutal-shadow p-8 rounded-lg text-center space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-[#fabb59] border-3 border-border-color brutal-shadow rounded-full">
              <Search size={32} className="text-[#1B1C1A]" />
            </div>
            <h4 className="font-headline text-xl uppercase font-bold">
              NO SEQUENCE ALIGNMENT FOUND
            </h4>
            <p className="font-body text-xs text-foreground/70 max-w-sm mx-auto">
              We scanned the multiverse but found no records matching your query matrix &ldquo;{searchQuery || selectedGenre}&rdquo;. Try adjusting your search signals.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedGenre("All");
              }}
              className="inline-flex items-center gap-2 bg-[#ef6540] hover:bg-[#ffb4a1] text-white hover:text-[#1B1C1A] font-label font-bold text-xs px-5 py-2.5 border-3 border-[#1B1C1A] brutal-shadow brutal-shadow-hover transition-all cursor-pointer"
            >
              <RotateCcw size={14} /> RESET SEARCH FIELD
            </button>
          </div>
        ) : loading ? (
          /* SYSTEM STATE: Standardized Loading Skeleton Grids */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-card-bg border-3 border-border-color rounded-lg p-4 brutal-shadow space-y-4"
              >
                <div className="aspect-video w-full rounded-md border-3 border-[#1B1C1A] bg-gray-300 skeleton-shimmer" />
                <div className="space-y-2">
                  <div className="h-6 w-3/4 border-3 border-[#1B1C1A] rounded bg-gray-300 skeleton-shimmer" />
                  <div className="h-4 w-1/2 border-3 border-[#1B1C1A] rounded bg-gray-300 skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Regular Comic Grids */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {comics.map((comic) => (
              <div
                key={comic.id}
                className="bg-card-bg border-3 border-border-color rounded-lg p-4 brutal-shadow brutal-shadow-hover transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video w-full rounded-md border-3 border-[#1B1C1A] overflow-hidden mb-4 bg-gray-400">
                    {comic.coverImage ? (
                      <img
                        src={comic.coverImage}
                        alt={comic.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#f5e7cd] text-foreground font-headline text-xl font-bold border-2 border-[#1B1C1A]">
                        {comic.title}
                      </div>
                    )}
                    <div className="absolute top-2 left-2 flex gap-1">
                      <span className="px-2 py-0.5 bg-[#fabb59] text-[#1B1C1A] border-2 border-[#1B1C1A] rounded-full font-label font-bold text-[9px]">
                        {comic.genre}
                      </span>
                      {comic.isOriginal && (
                        <span className="px-2 py-0.5 bg-[#ef6540] text-white border-2 border-[#1B1C1A] rounded-full font-label font-bold text-[9px]">
                          ORIGINAL
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <h4 className="font-headline text-lg uppercase font-bold text-foreground line-clamp-1 mb-1">
                    {comic.title}
                  </h4>
                  <p className="font-body text-xs text-foreground/70 line-clamp-2 mb-4">
                    {comic.description}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-[#1B1C1A]/10 pt-3 mt-2">
                  <div className="flex gap-2 text-[10px] font-label">
                    <span className="flex items-center gap-0.5">
                      <Star size={10} className="text-[#fabb59] fill-[#fabb59]" /> {comic.score}
                    </span>
                    <span className="text-foreground/50">•</span>
                    <span>{comic.reads} READS</span>
                  </div>
                  
                  <Link href={`/reader/${comic.slug}`}>
                    <span className="inline-flex items-center gap-1 bg-[#ffb4a1] hover:bg-[#ef6540] text-[#1B1C1A] hover:text-white font-label font-bold text-xs px-4 py-1.5 border-3 border-[#1B1C1A] brutal-shadow brutal-shadow-hover transition-all cursor-pointer">
                      READ <ChevronRight size={12} />
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Newsletter subscription Blast block */}
      <section className="border-4 border-[#1B1C1A] bg-[#ffb4a1] brutal-shadow p-6 md:p-8 rounded-lg flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#ef6540] text-white font-label font-bold text-[10px] uppercase px-3 py-1 border-2 border-[#1B1C1A] brutal-shadow transform -rotate-1">
            <Sparkles size={12} /> DROP ALERT
          </div>
          <h3 className="font-headline text-2xl md:text-3xl uppercase font-black text-[#1B1C1A] leading-none">
            GET THE WEEKLY INKLING FORGE!
          </h3>
          <p className="font-body text-xs md:text-sm text-[#1B1C1A]/80 leading-relaxed">
            Manifestos, custom prints, and unannounced sequence releases delivered straight from our underground bunker.
          </p>
        </div>

        <div className="w-full md:w-auto md:min-w-[280px]">
          {newsletterStatus === "idle" && (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="YOUR COMIC EMAIL ADDR"
                className="w-full bg-card-bg text-foreground border-3 border-border-color font-label font-bold text-xs px-3 py-2.5 focus:outline-none placeholder:text-foreground/40"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-[#ef6540] text-white hover:bg-[#fabb59] hover:text-[#1B1C1A] font-label font-bold text-xs uppercase tracking-wider border-3 border-[#1B1C1A] brutal-shadow brutal-shadow-hover transition-all cursor-pointer"
              >
                BLAST ME!
              </button>
            </form>
          )}

          {newsletterStatus === "success" && (
            <div className="bg-[#fabb59] border-3 border-[#1B1C1A] brutal-shadow p-4 text-[#1B1C1A] text-center space-y-1">
              <h5 className="font-headline text-sm uppercase font-bold">TRANSMISSION OK!</h5>
              <p className="font-body text-[10px] opacity-90">Radar alignment verified. Standby for target drop.</p>
            </div>
          )}

          {newsletterStatus === "error" && (
            <div className="bg-[#ef6540] border-3 border-[#1B1C1A] brutal-shadow p-4 text-white text-center space-y-2">
              <h5 className="font-headline text-sm uppercase font-bold">LINK FAILURE</h5>
              <p className="font-body text-[10px] opacity-90">Matrix address pattern rejected.</p>
              <button
                onClick={() => setNewsletterStatus("idle")}
                className="bg-card-bg text-foreground font-label font-bold text-[9px] px-3 py-1 border-2 border-border-color brutal-shadow"
              >
                RESET SCANNER
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
