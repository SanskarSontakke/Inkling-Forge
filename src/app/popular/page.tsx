"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Flame, Star, TrendingUp, TrendingDown } from "lucide-react";

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

interface TrendingItem {
  rank: string;
  title: string;
  trend: "up" | "down";
  score: string;
}

const STATIC_OTHER_TRENDING: TrendingItem[] = [
  { rank: "4", title: "The Last Alchemist", trend: "up", score: "9.3" },
  { rank: "5", title: "Midnight Runner", trend: "up", score: "9.2" },
  { rank: "6", title: "Beyond the Horizon", trend: "down", score: "9.1" },
];

function PopularSkeleton() {
  return (
    <div className="w-full md:max-w-[80%] mx-auto px-4 py-8 space-y-12 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-3">
        <div className="h-10 w-48 border-3 border-border-color rounded skeleton-shimmer" />
        <div className="h-4 w-96 max-w-full border-3 border-border-color rounded skeleton-shimmer" />
      </div>
      {/* Grid skeleton */}
      <div className="space-y-4">
        <div className="h-7 w-56 border-3 border-border-color rounded skeleton-shimmer" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[0, 1].map((i) => (
            <div key={i} className="border-3 border-border-color bg-card-bg brutal-shadow rounded-lg p-4 space-y-3">
              <div className="aspect-video w-full border-3 border-border-color rounded skeleton-shimmer" />
              <div className="h-5 w-3/4 border-3 border-border-color rounded skeleton-shimmer" />
              <div className="h-4 w-full border-3 border-border-color rounded skeleton-shimmer" />
            </div>
          ))}
        </div>
      </div>
      {/* Leaderboard skeleton */}
      <div className="space-y-4">
        <div className="h-7 w-48 border-3 border-border-color rounded skeleton-shimmer" />
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 bg-card-bg border-3 border-border-color p-4 brutal-shadow rounded-lg">
              <div className="w-14 h-14 border-3 border-border-color rounded-lg skeleton-shimmer flex-none" />
              <div className="flex-grow space-y-2">
                <div className="h-5 w-2/3 border-3 border-border-color rounded skeleton-shimmer" />
                <div className="h-3 w-1/2 border-3 border-border-color rounded skeleton-shimmer" />
              </div>
              <div className="h-5 w-10 border-3 border-border-color rounded skeleton-shimmer hidden md:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Popular() {
  const [loading, setLoading] = useState(true);
  const [trendingComics, setTrendingComics] = useState<Comic[]>([]);
  const [leaderboardComics, setLeaderboardComics] = useState<Comic[]>([]);
  const [extraEntries, setExtraEntries] = useState<TrendingItem[]>([]);
  const [loadingEntries, setLoadingEntries] = useState<boolean>(false);
  const [allLoaded, setAllLoaded] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const timerPromise = new Promise((resolve) => setTimeout(resolve, 500));

    const fetchTrending = fetch("/api/public/trending")
      .then((res) => res.json())
      .then((data) => data.comics || [])
      .catch(() => []);

    const fetchAllComics = fetch("/api/public/comics")
      .then((res) => res.json())
      .then((data) => data.comics || [])
      .catch(() => []);

    Promise.all([fetchTrending, fetchAllComics, timerPromise]).then(
      ([trendingData, allComicsData]) => {
        if (isMounted) {
          setTrendingComics(trendingData);
          
          // Sort leaderboard by score descending
          const sorted = [...allComicsData].sort(
            (a, b) => parseFloat(b.score) - parseFloat(a.score)
          );
          setLeaderboardComics(sorted);
          
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLoadMore = () => {
    if (loadingEntries || allLoaded) return;
    setLoadingEntries(true);
    setTimeout(() => {
      setExtraEntries([
        { rank: "7", title: "Cyber Punk: Neon Blood", trend: "up", score: "9.7" },
        { rank: "8", title: "Mecha-Soul 2099", trend: "up", score: "9.5" },
        { rank: "9", title: "Iron Heart 2.0", trend: "down", score: "8.9" },
        { rank: "10", title: "Glitch Hunter", trend: "up", score: "8.8" },
      ]);
      setLoadingEntries(false);
      setAllLoaded(true);
    }, 1200);
  };

  if (loading) return <PopularSkeleton />;

  // Display top 3 for the main leaderboard slots
  const topThree = leaderboardComics.slice(0, 3);

  const getRankBadgeColor = (rankNum: number) => {
    if (rankNum === 1) return "bg-[#ef6540] text-white";
    if (rankNum === 2) return "bg-[#fabb59] text-[#1B1C1A]";
    return "bg-[#ffb4a1] text-[#1B1C1A]";
  };

  return (
    <div className="w-full md:max-w-[80%] mx-auto px-4 py-8 space-y-12">
      {/* Page Header */}
      <section className="text-center md:text-left space-y-2">
        <h1 className="font-headline text-4xl font-black uppercase tracking-tighter text-foreground">
          WHAT&apos;S HOT?
        </h1>
        <p className="font-body text-sm md:text-base text-foreground/70 max-w-2xl">
          Discover the top-performing series taking the multiverse by storm. From underground indie titles to flagship originals.
        </p>
      </section>

      {/* Trending Featured Grid */}
      <section className="space-y-6">
        <h2 className="font-headline text-2xl uppercase tracking-tight text-foreground flex items-center gap-2">
          <Flame className="text-[#ef6540] fill-[#ef6540]" /> TRENDING THIS WEEK
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trendingComics.slice(0, 2).map((comic) => (
            <Link href={`/reader/${comic.slug}`} key={comic.id} className="group block">
              <div className="bg-card-bg border-3 border-border-color p-4 brutal-shadow brutal-shadow-hover cursor-pointer h-full flex flex-col justify-between">
                <div>
                  <div className="relative aspect-video w-full rounded border-3 border-border-color overflow-hidden mb-4 bg-gray-300">
                    {comic.coverImage ? (
                      <img
                        src={comic.coverImage}
                        alt={comic.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#e7d8bf] text-[#1B1C1A] font-headline text-xl font-bold">
                        {comic.title}
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className="bg-[#ef6540] text-white font-label font-bold text-[9px] uppercase px-3 py-1 border-2 border-[#1B1C1A] brutal-shadow">
                        TRENDING
                      </span>
                    </div>
                  </div>
                  <h3 className="font-headline text-lg uppercase font-bold text-foreground group-hover:text-primary line-clamp-1">
                    {comic.title}
                  </h3>
                  <p className="font-body text-xs text-foreground/70 line-clamp-2 mt-1">
                    {comic.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between border-t border-border-color/10 pt-3 mt-4 text-[10px] font-label">
                  <span>GENRE: {comic.genre}</span>
                  <span className="flex items-center gap-0.5">
                    <Star size={10} className="text-[#fabb59] fill-[#fabb59]" /> {comic.score} SCORE
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Top 10 All Time Rankings */}
      <section className="space-y-6">
        <h2 className="font-headline text-2xl uppercase tracking-tight text-foreground">
          TOP LEADERBOARD
        </h2>

        <div className="flex flex-col gap-4">
          {topThree.map((comic, index) => {
            const rankNum = index + 1;
            return (
              <Link href={`/reader/${comic.slug}`} key={comic.id}>
                <div className="flex items-center bg-card-bg border-3 border-border-color p-4 brutal-shadow brutal-shadow-hover group cursor-pointer">
                  <div className={`flex-none w-14 h-14 border-3 border-border-color brutal-shadow rounded-lg flex items-center justify-center font-headline text-2xl font-black ${getRankBadgeColor(rankNum)} transform group-hover:rotate-6 transition-transform`}>
                    {rankNum}
                  </div>
                  
                  <div className="ml-5 flex-grow">
                    <h4 className="font-headline text-base md:text-lg uppercase font-bold text-foreground group-hover:text-primary leading-tight line-clamp-1">
                      {comic.title}
                    </h4>
                    <p className="font-body text-xs text-foreground/60">
                      Genre: {comic.genre} • {comic.reads} Reads
                    </p>
                  </div>
                  
                  <div className="hidden md:flex items-center gap-2 font-label text-sm">
                    <Star size={14} className="text-[#fabb59] fill-[#fabb59]" />
                    <span className="font-bold">{comic.score}</span>
                  </div>
                </div>
              </Link>
            );
          })}

          <div className="border-3 border-border-color bg-card-bg p-2 brutal-shadow divide-y divide-border-color/10">
            {STATIC_OTHER_TRENDING.map((item) => (
              <div key={item.rank} className="flex items-center justify-between p-3 hover:bg-[#ffb4a1]/10">
                <div className="flex items-center gap-4">
                  <span className="font-headline text-base font-bold text-foreground/50 w-6">{item.rank}</span>
                  <span className="font-body text-sm font-medium text-foreground">{item.title}</span>
                </div>
                <div className="flex items-center gap-4 font-label text-xs">
                  <span className="flex items-center gap-0.5">
                    <Star size={12} className="text-[#fabb59] fill-[#fabb59]" /> {item.score}
                  </span>
                  {item.trend === "up" ? (
                    <TrendingUp size={16} className="text-emerald-600" />
                  ) : (
                    <TrendingDown size={16} className="text-rose-600" />
                  )}
                </div>
              </div>
            ))}

            {extraEntries.map((item) => (
              <div key={item.rank} className="flex items-center justify-between p-3 hover:bg-[#ffb4a1]/10 animate-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-4">
                  <span className="font-headline text-base font-bold text-foreground/50 w-6">{item.rank}</span>
                  <span className="font-body text-sm font-medium text-foreground">{item.title}</span>
                </div>
                <div className="flex items-center gap-4 font-label text-xs">
                  <span className="flex items-center gap-0.5">
                    <Star size={12} className="text-[#fabb59] fill-[#fabb59]" /> {item.score}
                  </span>
                  {item.trend === "up" ? (
                    <TrendingUp size={16} className="text-emerald-600" />
                  ) : (
                    <TrendingDown size={16} className="text-rose-600" />
                  )}
                </div>
              </div>
            ))}

            {!allLoaded && (
              <div className="p-3 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingEntries}
                  className="font-label font-bold text-xs uppercase px-6 py-2 border-3 border-border-color bg-card-bg hover:bg-[#ffb4a1] text-foreground brutal-shadow brutal-shadow-hover transition-all cursor-pointer disabled:opacity-50"
                >
                  {loadingEntries ? "RETRIEVING RECORDS..." : "LOAD ENTIRE GRID"}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
