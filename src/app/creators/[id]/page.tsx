import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users, Eye, Sparkles, Send, Image as ImageIcon, Globe, BookOpen, Star } from "lucide-react";
import { MOCK_CREATORS, MOCK_COMICS } from "@/data/comics";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CreatorProfile({ params }: PageProps) {
  const { id } = await params;
  const creator = MOCK_CREATORS[id];

  if (!creator) {
    notFound();
  }

  // Filter comics associated with this creator
  const creatorComics = MOCK_COMICS.filter((comic) =>
    comic.creatorIds.includes(id)
  );

  return (
    <div className="w-full md:max-w-[80%] mx-auto px-4 py-8 space-y-10">
      {/* Back button */}
      <Link href="/creators" className="inline-flex items-center gap-2 font-label font-bold text-xs uppercase hover:text-[#ef6540] transition-colors">
        <ArrowLeft size={16} /> Back to Creators
      </Link>

      {/* Profile Header Box */}
      <section className="relative border-4 border-[#1B1C1A] bg-[#fabb59] brutal-shadow rounded-lg p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
        <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[#1B1C1A] overflow-hidden bg-gray-300 shadow-md flex-none">
          <img
            src={creator.avatar}
            alt={creator.name}
            className="w-full h-full object-cover grayscale"
          />
        </div>
        
        <div className="space-y-3 text-center md:text-left flex-grow">
          <div className="space-y-1">
            <h1 className="font-headline text-3xl md:text-4xl font-black uppercase tracking-tight text-[#1B1C1A]">
              {creator.name}
            </h1>
            <span className="inline-block bg-[#ef6540] text-white font-label font-bold text-xs uppercase px-3 py-1 border-2 border-[#1B1C1A] brutal-shadow transform -rotate-1">
              {creator.role}
            </span>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-label">
            <span className="flex items-center gap-1 text-[#1B1C1A]">
              <Users size={14} className="fill-[#ef6540]/25 text-[#1B1C1A]" /> {creator.followers} FOLLOWERS
            </span>
            <span className="flex items-center gap-1 text-[#1B1C1A]">
              <Eye size={14} /> {creator.reads} TOTAL READS
            </span>
            <span className="flex items-center gap-1 text-[#1B1C1A]">
              <BookOpen size={14} /> {creatorComics.length} WORKS
            </span>
          </div>
        </div>
      </section>

      {/* Creator Manifesto / Biography */}
      <section className="border-3 border-border-color bg-card-bg p-6 brutal-shadow space-y-4">
        <div className="flex items-center gap-2 text-[#ef6540]">
          <Sparkles size={20} className="fill-current" />
          <h3 className="font-headline text-lg uppercase font-bold text-foreground">
            CREATIVE MANIFESTO
          </h3>
        </div>
        <p className="font-body text-sm leading-relaxed text-foreground/80 whitespace-pre-line">
          {creator.bio}
          {"\n\n"}
          &ldquo;Sequential art is not just drawing lines in a grid; it is capturing the motion of stories in static visual containers. Every stroke must convey weight, and every frame must pulse with electric feedback.&rdquo;
        </p>

        {/* Social connections bar */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-border-color/10">
          {creator.socials.twitter && (
            <a
              href="#"
              className="inline-flex items-center gap-1.5 bg-card-bg hover:bg-secondary text-foreground hover:text-white font-label font-bold text-xs px-4 py-2 border-2 border-border-color brutal-shadow transition-all"
            >
              <Send size={14} /> TWITTER
            </a>
          )}
          {creator.socials.instagram && (
            <a
              href="#"
              className="inline-flex items-center gap-1.5 bg-card-bg hover:bg-secondary text-foreground hover:text-white font-label font-bold text-xs px-4 py-2 border-2 border-border-color brutal-shadow transition-all"
            >
              <ImageIcon size={14} /> INSTAGRAM
            </a>
          )}
          <a
            href="#"
            className="inline-flex items-center gap-1.5 bg-card-bg hover:bg-secondary text-foreground hover:text-white font-label font-bold text-xs px-4 py-2 border-2 border-border-color brutal-shadow transition-all"
          >
            <Globe size={14} /> PORTFOLIO Matrix
          </a>
        </div>
      </section>

      {/* Series Grid */}
      <section className="space-y-6">
        <h3 className="font-headline text-2xl uppercase tracking-tight text-foreground">
          ACTIVE COMIC SERIES ({creatorComics.length})
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {creatorComics.map((comic) => (
            <div
              key={comic.id}
              className="bg-card-bg border-3 border-border-color p-4 brutal-shadow brutal-shadow-hover transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="aspect-video w-full rounded border-3 border-border-color overflow-hidden mb-3 bg-gray-300 relative">
                  <img
                    src={comic.coverImage}
                    alt={comic.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                  <span className="absolute top-2 left-2 bg-[#fabb59] text-[#1B1C1A] font-label font-bold text-[8px] uppercase px-2 py-0.5 border border-border-color">
                    {comic.genre}
                  </span>
                </div>
                
                <h4 className="font-headline text-base uppercase font-bold text-foreground line-clamp-1 mb-1">
                  {comic.title}
                </h4>
                <p className="font-body text-xs text-foreground/70 line-clamp-2">
                  {comic.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-color/10">
                <div className="flex items-center gap-1 font-label text-[10px]">
                  <Star size={12} className="text-[#fabb59] fill-[#fabb59]" /> {comic.score} SCORE
                </div>
                
                <Link href={`/reader/${comic.slug}`}>
                  <span className="bg-[#ffb4a1] hover:bg-[#ef6540] text-[#1B1C1A] hover:text-white font-label font-bold text-[10px] px-4 py-1.5 border-2 border-border-color brutal-shadow brutal-shadow-hover transition-all cursor-pointer">
                    READ NOW
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
