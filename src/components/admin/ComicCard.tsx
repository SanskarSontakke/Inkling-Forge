"use client";

import React from "react";
import Link from "next/link";
import { Star, Eye, Edit2, ArrowRight } from "lucide-react";

export interface Comic {
  id: string;
  title: string;
  slug: string;
  cover_image: string;
  banner_image?: string;
  description?: string;
  genre: string;
  reads: string;
  score: string;
  rank?: string;
  is_original: boolean;
  is_trending: boolean;
  creatorIds?: string[];
}

interface ComicCardProps {
  comic: Comic;
  onEdit: (comic: Comic) => void;
}

export default function ComicCard({ comic, onEdit }: ComicCardProps) {
  return (
    <div className="bg-card-bg border-3 border-border-color rounded-lg p-4 brutal-shadow brutal-shadow-hover transition-all group flex flex-col justify-between text-foreground">
      <div>
        {/* Cover Section */}
        <div className="relative aspect-video w-full rounded-md border-3 border-[#1B1C1A] overflow-hidden mb-4 bg-neutral-800">
          {comic.cover_image ? (
            <img
              src={comic.cover_image}
              alt={comic.title}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#f5e7cd] text-foreground font-headline text-lg font-bold border-none">
              {comic.title}
            </div>
          )}
          <div className="absolute top-2 left-2 flex gap-1">
            <span className="px-2 py-0.5 bg-[#fabb59] text-[#1B1C1A] border-2 border-[#1B1C1A] rounded-full font-label font-bold text-[9px] uppercase">
              {comic.genre}
            </span>
            {comic.is_original && (
              <span className="px-2 py-0.5 bg-[#ef6540] text-white border-2 border-[#1B1C1A] rounded-full font-label font-bold text-[9px] uppercase">
                ORIGINAL
              </span>
            )}
            {comic.is_trending && (
              <span className="px-2 py-0.5 bg-sky-500 text-white border-2 border-[#1B1C1A] rounded-full font-label font-bold text-[9px] uppercase">
                TRENDING
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h4 className="font-headline text-lg uppercase font-bold line-clamp-1 mb-1">
          {comic.title}
        </h4>
        <p className="font-body text-xs text-foreground/50 mb-3">
          ID: {comic.id}
        </p>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between border-t border-[#1B1C1A]/10 pt-3 mt-2">
        <div className="flex gap-2 text-[10px] font-label">
          <span className="flex items-center gap-0.5">
            <Star size={10} className="text-[#fabb59] fill-[#fabb59]" /> {comic.score}
          </span>
          <span className="text-foreground/50">•</span>
          <span>{comic.reads} READS</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(comic)}
            className="p-1.5 bg-card-bg hover:bg-[#fabb59] text-foreground border-2 border-border-color brutal-shadow brutal-shadow-hover transition-all cursor-pointer"
            title="Edit Details"
          >
            <Edit2 size={12} />
          </button>
          
          <Link href={`/admin-reserved/comics/${comic.id}`}>
            <span className="inline-flex items-center gap-1 bg-[#ffb4a1] hover:bg-[#ef6540] text-[#1B1C1A] hover:text-white font-label font-bold text-xs px-3 py-1.5 border-3 border-[#1B1C1A] brutal-shadow brutal-shadow-hover transition-all cursor-pointer">
              MANAGE <ArrowRight size={12} />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
