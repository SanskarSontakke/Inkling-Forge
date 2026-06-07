"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Eye, ArrowUpRight } from "lucide-react";

interface Creator {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  followers: string;
  reads: string;
  role: string;
  socials: { twitter?: string; instagram?: string; artstation?: string };
}

function CreatorsSkeleton() {
  return (
    <div className="w-full md:max-w-[80%] mx-auto px-4 py-8 space-y-12 animate-pulse">
      <div className="space-y-3">
        <div className="h-10 w-64 border-3 border-border-color rounded skeleton-shimmer" />
        <div className="h-4 w-80 max-w-full border-3 border-border-color rounded skeleton-shimmer" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-card-bg border-3 border-border-color brutal-shadow rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border-3 border-border-color skeleton-shimmer flex-none" />
              <div className="space-y-2 flex-grow">
                <div className="h-5 w-3/4 border-3 border-border-color rounded skeleton-shimmer" />
                <div className="h-3 w-1/2 border-3 border-border-color rounded skeleton-shimmer" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full border-3 border-border-color rounded skeleton-shimmer" />
              <div className="h-3 w-5/6 border-3 border-border-color rounded skeleton-shimmer" />
              <div className="h-3 w-4/6 border-3 border-border-color rounded skeleton-shimmer" />
            </div>
            <div className="flex justify-between pt-2">
              <div className="h-4 w-28 border-3 border-border-color rounded skeleton-shimmer" />
              <div className="h-4 w-24 border-3 border-border-color rounded skeleton-shimmer" />
            </div>
            <div className="h-10 w-full border-3 border-border-color rounded skeleton-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Creators() {
  const [loading, setLoading] = useState(true);
  const [creators, setCreators] = useState<Creator[]>([]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const timerPromise = new Promise((resolve) => setTimeout(resolve, 500));

    const fetchCreators = fetch("/api/public/creators")
      .then((res) => res.json())
      .then((data) => data.creators || [])
      .catch(() => []);

    Promise.all([fetchCreators, timerPromise]).then(([creatorsData]) => {
      if (isMounted) {
        setCreators(creatorsData);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <CreatorsSkeleton />;

  return (
    <div className="w-full md:max-w-[80%] mx-auto px-4 py-8 space-y-12">
      {/* Header */}
      <section className="text-center md:text-left space-y-2">
        <h1 className="font-headline text-4xl font-black uppercase tracking-tighter text-foreground">
          CREATORS DIRECTORY
        </h1>
        <p className="font-body text-sm md:text-base text-foreground/70 max-w-2xl">
          Meet the minds operating the ink printing presses. Writers, illustrators, and visual designers carving the neubrutalist comic landscape.
        </p>
      </section>

      {/* Grid of Creators */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {creators.map((creator) => (
          <div
            key={creator.id}
            className="bg-card-bg border-3 border-border-color brutal-shadow rounded-lg p-6 flex flex-col justify-between gap-4 text-foreground group hover:-translate-y-1 transition-all duration-300"
          >
            <div className="space-y-4">
              {/* Profile Head */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-3 border-border-color overflow-hidden bg-neutral-800 flex-none">
                  {creator.avatar ? (
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="w-full h-full object-cover grayscale contrast-125"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-headline text-xl font-bold bg-[#ef6540]">
                      {creator.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-headline text-lg uppercase font-bold group-hover:text-primary transition-colors">
                    {creator.name}
                  </h3>
                  <span className="bg-[#ffb4a1] text-[#1B1C1A] font-label font-bold text-[9px] uppercase px-2 py-0.5 border-2 border-[#1B1C1A]">
                    {creator.role}
                  </span>
                </div>
              </div>

              {/* Bio */}
              <p className="font-body text-xs md:text-sm text-foreground/70 leading-relaxed line-clamp-3">
                {creator.bio}
              </p>
            </div>

            {/* Socials & Stats footer */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-label border-t border-border-color/10 pt-4">
                <span className="flex items-center gap-1">
                  <Users size={12} className="text-[#ef6540]" /> {creator.followers} FOLLOWERS
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={12} className="text-[#ffb4a1]" /> {creator.reads} READS
                </span>
              </div>

              {/* Social Channels */}
              <div className="flex gap-2">
                {creator.socials.twitter && (
                  <a
                    href={`https://twitter.com/${creator.socials.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2 bg-[#fabb59] hover:bg-[#ef6540] text-[#1B1C1A] hover:text-white font-label font-bold text-xs border-3 border-[#1B1C1A] brutal-shadow brutal-shadow-hover transition-all"
                  >
                    TWITTER
                  </a>
                )}
                {creator.socials.instagram && (
                  <a
                    href={`https://instagram.com/${creator.socials.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2 bg-[#ffb4a1] hover:bg-[#ef6540] text-[#1B1C1A] hover:text-white font-label font-bold text-xs border-3 border-[#1B1C1A] brutal-shadow brutal-shadow-hover transition-all"
                  >
                    INSTAGRAM
                  </a>
                )}
                {creator.socials.artstation && (
                  <a
                    href={`https://artstation.com/${creator.socials.artstation}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2 bg-card-bg hover:bg-[#ef6540] text-foreground hover:text-white font-label font-bold text-xs border-3 border-[#1B1C1A] brutal-shadow brutal-shadow-hover transition-all"
                  >
                    PORTFOLIO <ArrowUpRight size={10} className="inline ml-0.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
