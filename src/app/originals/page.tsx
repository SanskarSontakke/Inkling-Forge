"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Star, Zap, Eye, ChevronRight } from "lucide-react";

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

interface Creator {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  role: string;
}

function OriginalsSkeleton() {
  return (
    <div className="w-full md:max-w-[80%] mx-auto px-4 py-8 space-y-12 animate-pulse">
      {/* Hero skeleton */}
      <div className="border-4 border-border-color p-8 rounded-lg brutal-shadow space-y-3 skeleton-shimmer" style={{ minHeight: 140 }} />

      <div className="space-y-4">
        <div className="h-7 w-56 border-3 border-border-color rounded skeleton-shimmer" />
        <div className="flex flex-col gap-8">
          {[0, 1].map((i) => (
            <div key={i} className="bg-card-bg border-3 border-border-color brutal-shadow rounded-lg overflow-hidden flex flex-col md:flex-row">
              <div className="aspect-[16/10] md:w-2/5 flex-none skeleton-shimmer" />
              <div className="p-6 flex flex-col gap-4 flex-grow">
                <div className="space-y-2">
                  <div className="h-6 w-3/4 border-3 border-border-color rounded skeleton-shimmer" />
                  <div className="h-3 w-1/3 border-3 border-border-color rounded skeleton-shimmer" />
                  <div className="h-3 w-full border-3 border-border-color rounded skeleton-shimmer" />
                  <div className="h-3 w-5/6 border-3 border-border-color rounded skeleton-shimmer" />
                </div>
                <div className="mt-auto flex justify-between items-center">
                  <div className="h-4 w-28 border-3 border-border-color rounded skeleton-shimmer" />
                  <div className="h-9 w-28 border-3 border-border-color rounded skeleton-shimmer" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Originals() {
  const [loading, setLoading] = useState(true);
  const [comics, setComics] = useState<Comic[]>([]);
  const [creatorsMap, setCreatorsMap] = useState<Record<string, Creator>>({});

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const timerPromise = new Promise((resolve) => setTimeout(resolve, 500));

    const fetchComics = fetch("/api/public/comics?genre=Originals")
      .then((res) => res.json())
      .then((data) => data.comics || [])
      .catch(() => []);

    const fetchCreators = fetch("/api/public/creators")
      .then((res) => res.json())
      .then((data) => {
        const map: Record<string, Creator> = {};
        (data.creators || []).forEach((c: Creator) => {
          map[c.id] = c;
        });
        return map;
      })
      .catch(() => ({}));

    Promise.all([fetchComics, fetchCreators, timerPromise]).then(
      ([comicsData, creatorsData]) => {
        if (isMounted) {
          setComics(comicsData);
          setCreatorsMap(creatorsData);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <OriginalsSkeleton />;

  return (
    <div className="w-full md:max-w-[80%] mx-auto px-4 py-8 space-y-12">
      {/* Page Header */}
      <section className="relative border-4 border-[#1B1C1A] bg-[#ef6540] text-white p-8 rounded-lg brutal-shadow space-y-3 transform -rotate-1">
        <div className="inline-flex items-center gap-2 bg-[#fabb59] text-[#1B1C1A] font-label font-bold text-xs px-3 py-1 border-2 border-[#1B1C1A] brutal-shadow rounded-full">
          <Zap size={14} className="fill-[#1B1C1A]" /> INKLING FORGE EXCLUSIVE
        </div>
        <h1 className="font-headline text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">
          INKLING FORGE ORIGINALS
        </h1>
        <p className="font-body text-xs md:text-sm max-w-xl opacity-90">
          Handcrafted stories by elite sequential artists. Gritty panels, heavy ink, and unfiltered narratives you won&apos;t find anywhere else.
        </p>
      </section>

      {/* Originals Showcase Grid */}
      <section className="space-y-6">
        <h2 className="font-headline text-2xl uppercase tracking-tight text-foreground flex items-center gap-2">
          <Sparkles className="text-[#fabb59] fill-[#fabb59]" /> ALL ORIGINAL SERIES
        </h2>

        <div className="flex flex-col gap-8">
          {comics.map((comic) => {
            const creatorNames = comic.creatorIds
              ? comic.creatorIds.map((cid) => creatorsMap[cid]?.name || cid).join(" & ")
              : "Unknown Creator";

            return (
              <div
                key={comic.id}
                className="bg-card-bg border-3 border-border-color brutal-shadow rounded-lg overflow-hidden flex flex-col md:flex-row group hover:-translate-y-1 transition-all duration-300"
              >
                {/* Image Section */}
                <div className="relative aspect-[16/10] md:w-2/5 flex-none bg-neutral-800 border-b-3 md:border-b-0 md:border-r-3 border-border-color overflow-hidden">
                  {comic.coverImage ? (
                    <img
                      src={comic.coverImage}
                      alt={comic.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-headline text-2xl font-black">
                      {comic.title}
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="bg-[#fabb59] text-[#1B1C1A] font-label font-bold text-[10px] px-3 py-1 border-2 border-[#1B1C1A] brutal-shadow">
                      {comic.genre}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col justify-between flex-grow gap-4 text-foreground">
                  <div className="space-y-2">
                    <h3 className="font-headline text-xl md:text-2xl uppercase font-black tracking-tight leading-none group-hover:text-primary transition-colors">
                      {comic.title}
                    </h3>
                    <p className="font-label text-xs text-foreground/50">
                      BY {creatorNames.toUpperCase()}
                    </p>
                    <p className="font-body text-xs md:text-sm text-foreground/70 leading-relaxed line-clamp-3">
                      {comic.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-border-color/10 pt-4 mt-auto">
                    <div className="flex items-center gap-4 text-xs font-label">
                      <span className="flex items-center gap-1">
                        <Star size={14} className="text-[#fabb59] fill-[#fabb59]" /> {comic.score} SCORE
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={14} className="text-[#ffb4a1]" /> {comic.reads} READS
                      </span>
                    </div>

                    <Link href={`/reader/${comic.slug}`}>
                      <span className="inline-flex items-center gap-2 bg-[#fabb59] hover:bg-[#ef6540] text-[#1B1C1A] hover:text-white font-label font-bold text-xs px-5 py-2 border-3 border-[#1B1C1A] brutal-shadow brutal-shadow-hover transition-all cursor-pointer">
                        OPEN DOSSIER <ChevronRight size={14} />
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
