"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft, ArrowRight, Heart, Share2, Bookmark, MessageSquare,
  Settings, Sun, Moon, Sparkles, Check, ChevronUp,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

// ── Simulated panel images (gradient placeholders until PDF parsing is ready) ──
const PANEL_GRADIENTS = [
  "linear-gradient(135deg, #1a0a00 0%, #3d1a0a 40%, #6b2a10 100%)",
  "linear-gradient(180deg, #0d1117 0%, #161b22 50%, #21262d 100%)",
  "linear-gradient(45deg, #130d02 0%, #261f0f 60%, #3c3422 100%)",
  "linear-gradient(225deg, #0f1923 0%, #1a2d3a 50%, #243a4a 100%)",
  "linear-gradient(90deg, #1c0a0a 0%, #3a1515 50%, #5a2020 100%)",
  "linear-gradient(315deg, #0a0a1c 0%, #15153a 50%, #20205a 100%)",
  "linear-gradient(160deg, #0d0d0d 0%, #1a1a1a 50%, #2a2a2a 100%)",
];

type PanelShape = "portrait" | "landscape" | "wide" | "square";

const PANEL_SHAPES: PanelShape[] = [
  "portrait", "wide", "landscape", "portrait",
  "square", "landscape", "portrait", "wide",
  "landscape", "portrait", "square", "wide",
  "portrait", "landscape", "wide", "portrait",
  "landscape", "portrait", "square", "landscape",
];

function aspectForShape(shape: PanelShape) {
  switch (shape) {
    case "portrait": return "aspect-[3/4]";
    case "landscape": return "aspect-[16/9]";
    case "wide": return "aspect-[21/9]";
    case "square": return "aspect-square";
  }
}

function SimulatedPanel({
  index, shape,
}: { index: number; shape: PanelShape }) {
  const gradient = PANEL_GRADIENTS[index % PANEL_GRADIENTS.length];
  const panelLabel = `PAGE ${index + 1}`;

  return (
    <div
      className={`w-full ${aspectForShape(shape)} border-b-3 border-[#1B1C1A] last:border-b-0 scroll-reveal relative overflow-hidden flex items-center justify-center`}
      style={{ background: gradient }}
    >
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg, transparent, transparent 40px,
            rgba(255,255,255,0.05) 40px, rgba(255,255,255,0.05) 41px
          ), repeating-linear-gradient(
            90deg, transparent, transparent 60px,
            rgba(255,255,255,0.03) 60px, rgba(255,255,255,0.03) 61px
          )`
        }}
      />
      <div className="absolute top-3 left-3 bg-[#ef6540]/80 border-2 border-[#1B1C1A] px-2 py-0.5">
        <span className="font-label font-bold text-[10px] text-white uppercase">{panelLabel}</span>
      </div>
      <div className="font-headline text-foreground/10 text-[80px] font-black select-none">
        {index + 1}
      </div>
    </div>
  );
}

export default function ComicReader() {
  const params = useParams();
  const slug = params.slug as string;

  const {
    theme, setTheme, grainEnabled, setGrainEnabled,
    currentChapter, setCurrentChapter, isChapterLoading,
  } = useApp();

  const [comic, setComic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [comments, setComments] = useState([
    { id: 1, author: "CyberRunner_99", text: "That neon panel layout is insane! The ink work in the grid panel goes so hard.", time: "2h ago" },
    { id: 2, author: "RetroInk", text: "Chapter 42 delivers yet again. I need to know what happens to the core courier memory buffer immediately!", time: "5h ago" },
    { id: 3, author: "Valkyrie_Art", text: "The color palette transition in page 3 is majestic. Neubrutalism at its best.", time: "1d ago" },
  ]);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch comic by slug
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const timerPromise = new Promise((resolve) => setTimeout(resolve, 500));

    fetch(`/api/public/comics/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Comic not found");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setComic(data.comic);
          
          // If chapters exist, sync the current global chapter if needed
          const chapters = data.comic.chapters || [];
          if (chapters.length > 0) {
            const hasChapter = chapters.some((ch: any) => ch.title.includes(currentChapter));
            if (!hasChapter) {
              const firstChNum = chapters[0].title.split(":")[0].trim();
              setCurrentChapter(firstChNum);
            }
          }
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        timerPromise.then(() => {
          if (isMounted) setLoading(false);
        });
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Scroll-reveal observer for comic panels
  useEffect(() => {
    if (isChapterLoading || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" },
    );

    const revealElements = containerRef.current?.querySelectorAll(".scroll-reveal");
    revealElements?.forEach((el) => observer.observe(el));
    return () => revealElements?.forEach((el) => observer.unobserve(el));
  }, [isChapterLoading, loading, currentChapter]);

  // Back to top handler
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (loading || !comic) {
    return (
      <div className="w-full md:max-w-[80%] mx-auto px-4 pb-20 pt-6 space-y-8 animate-pulse">
        <div className="flex flex-col gap-4 border-3 border-border-color p-6 rounded-lg bg-card-bg brutal-shadow">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-2 flex-grow">
              <div className="h-8 w-3/4 border-3 border-[#1B1C1A] bg-gray-300 dark:bg-gray-700 rounded skeleton-shimmer" />
              <div className="h-5 w-1/3 border-3 border-[#1B1C1A] bg-gray-300 dark:bg-gray-700 rounded skeleton-shimmer" />
            </div>
            <div className="h-10 w-10 border-3 border-[#1B1C1A] rounded-full bg-gray-300 dark:bg-gray-700 skeleton-shimmer flex-none" />
          </div>
          <div className="w-full h-6 bg-gray-300 dark:bg-gray-700 border-3 border-[#1B1C1A] rounded-full overflow-hidden relative">
            <div className="absolute top-0 left-0 h-full w-1/3 bg-[#ef6540] skeleton-shimmer" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="relative w-full aspect-[3/4] border-3 border-[#1B1C1A] rounded-lg bg-gray-300 dark:bg-gray-700 skeleton-shimmer brutal-shadow" />
        </div>
      </div>
    );
  }

  // Get active chapter
  const chapters = comic.chapters || [];
  const activeChapterData =
    chapters.find((ch: any) => ch.title.includes(currentChapter)) || chapters[0];

  // Chapter navigation index
  const activeIndex = chapters.findIndex((ch: any) => ch.id === activeChapterData?.id);

  const handlePrev = () => {
    if (activeIndex < chapters.length - 1) {
      const prevCh = chapters[activeIndex + 1];
      setCurrentChapter(prevCh.title.split(":")[0].trim());
    }
  };

  const handleNext = () => {
    if (activeIndex > 0) {
      const nextCh = chapters[activeIndex - 1];
      setCurrentChapter(nextCh.title.split(":")[0].trim());
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2000);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments([
      { id: Date.now(), author: "NeoReader_Matrix", text: newComment.trim(), time: "Just now" },
      ...comments,
    ]);
    setNewComment("");
  };

  if (!activeChapterData) {
    return (
      <div className="w-full text-center py-20 font-headline text-xl uppercase font-bold text-foreground">
        No chapter selected or available.
      </div>
    );
  }

  const hasRealPanels = activeChapterData.panels && activeChapterData.panels.length > 0;

  return (
    <div className="w-full md:max-w-[80%] mx-auto px-4 pb-20 pt-6 space-y-8">
      {isChapterLoading ? (
        <div className="space-y-8 animate-pulse">
          <div className="flex flex-col gap-4 border-3 border-border-color p-6 rounded-lg bg-card-bg brutal-shadow">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-2 flex-grow">
                <div className="h-8 w-3/4 border-3 border-[#1B1C1A] bg-gray-300 dark:bg-gray-700 rounded skeleton-shimmer" />
                <div className="h-5 w-1/3 border-3 border-[#1B1C1A] bg-gray-300 dark:bg-gray-700 rounded skeleton-shimmer" />
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="relative w-full aspect-[3/4] border-3 border-[#1B1C1A] rounded-lg bg-gray-300 dark:bg-gray-700 skeleton-shimmer brutal-shadow" />
          </div>
        </div>
      ) : (
        <div ref={containerRef} className="space-y-8">
          {/* Chapter badge */}
          <section className="text-center pt-4">
            <div className="inline-block bg-[#ef6540] border-3 border-[#1B1C1A] p-5 brutal-shadow pulse-glow mb-2 transform -rotate-1">
              <h2 className="font-headline text-lg md:text-2xl text-white font-black leading-none uppercase">
                {activeChapterData.title}
              </h2>
              <p className="font-label text-[10px] text-white/80 mt-1 uppercase tracking-widest">
                {comic.title}
              </p>
            </div>
          </section>

          {/* ── Sticky Reader Nav Bar ── */}
          <nav className="sticky top-0 z-40 flex flex-wrap justify-between items-center bg-card-bg border-3 border-border-color p-3 brutal-shadow gap-3">
            <button
              onClick={handlePrev}
              disabled={activeIndex === chapters.length - 1}
              className="flex items-center gap-1 bg-card-bg text-foreground border-3 border-border-color px-3 py-2 font-label font-bold text-xs brutal-shadow brutal-shadow-hover brutal-shadow-active cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
            >
              <ArrowLeft size={14} /> PREV
            </button>

            {/* Chapter selector + Back to Top */}
            <div className="flex items-center gap-2">
              <div className="relative bg-[#fabb59] text-[#1B1C1A] border-3 border-[#1B1C1A] brutal-shadow brutal-shadow-hover select-none">
                <select
                  value={currentChapter}
                  onChange={(e) => setCurrentChapter(e.target.value)}
                  className="appearance-none bg-transparent font-label font-bold text-xs px-4 py-2 pr-8 focus:outline-none cursor-pointer border-none"
                >
                  {chapters.map((ch: any) => {
                    const chNum = ch.title.split(":")[0].trim();
                    return (
                      <option key={ch.id} value={chNum} className="bg-card-bg text-foreground">
                        {chNum}
                      </option>
                    );
                  })}
                </select>
                <Settings size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Back to Top */}
              <button
                onClick={scrollToTop}
                title="Back to top"
                className="flex items-center gap-1 bg-card-bg text-foreground border-3 border-border-color px-3 py-2 font-label font-bold text-xs brutal-shadow brutal-shadow-hover brutal-shadow-active cursor-pointer"
              >
                <ChevronUp size={14} />
                <span className="hidden sm:inline">TOP</span>
              </button>
            </div>

            <button
              onClick={handleNext}
              disabled={activeIndex === 0}
              className="flex items-center gap-1 bg-[#ef6540] text-white border-3 border-[#1B1C1A] px-3 py-2 font-label font-bold text-xs brutal-shadow brutal-shadow-hover brutal-shadow-active cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
            >
              NEXT <ArrowRight size={14} />
            </button>
          </nav>

          {/* ── Comic Vertical Canvas ── */}
          <article className="border-3 border-[#1B1C1A] bg-[#1B1C1A] brutal-shadow overflow-hidden flex flex-col items-center">
            {hasRealPanels ? (
              /* Real panels from database (parsed PDF) */
              activeChapterData.panels.map((panel: string, idx: number) => (
                <img
                  key={`real-${idx}`}
                  src={panel}
                  alt={`${comic.title} Page ${idx + 1}`}
                  className="w-full max-w-[1000px] h-auto object-contain border-b-3 border-[#1B1C1A] last:border-b-0"
                />
              ))
            ) : (
              /* Simulated fallback gradient panels */
              PANEL_SHAPES.map((shape, idx) => (
                <SimulatedPanel
                  key={`sim-${idx}`}
                  index={idx}
                  shape={shape}
                />
              ))
            )}
          </article>

          {/* ── Bottom Interaction Controls ── */}
          <section className="flex flex-wrap justify-between items-center gap-4 pt-4">
            <div className="flex gap-3">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`border-3 border-[#1B1C1A] p-3 brutal-shadow brutal-shadow-hover brutal-shadow-active cursor-pointer ${
                  isLiked ? "bg-[#ef6540] text-white" : "bg-card-bg text-foreground hover:bg-[#ffb4a1]"
                }`}
              >
                <Heart size={18} className={isLiked ? "fill-current" : ""} />
              </button>

              <button
                onClick={handleShare}
                className={`border-3 border-[#1B1C1A] p-3 brutal-shadow brutal-shadow-hover brutal-shadow-active cursor-pointer relative ${
                  shareSuccess ? "bg-[#fabb59] text-[#1B1C1A]" : "bg-card-bg text-foreground hover:bg-[#ffb4a1]"
                }`}
              >
                {shareSuccess ? <Check size={18} /> : <Share2 size={18} />}
                {shareSuccess && (
                  <span className="absolute bottom-14 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-[#1B1C1A] text-[#efe1c7] text-[9px] font-label px-2 py-1 border-2 border-[#1B1C1A] whitespace-nowrap rounded">
                    LINK COPIED!
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`border-3 border-[#1B1C1A] p-3 brutal-shadow brutal-shadow-hover brutal-shadow-active cursor-pointer ${
                  isBookmarked ? "bg-[#fabb59] text-[#1B1C1A]" : "bg-card-bg text-foreground hover:bg-[#ffb4a1]"
                }`}
              >
                <Bookmark size={18} className={isBookmarked ? "fill-current" : ""} />
              </button>
            </div>

            <a href="#comments-block" className="flex-grow md:flex-grow-0">
              <button className="w-full bg-[#fabb59] text-[#1B1C1A] border-3 border-[#1B1C1A] px-6 py-3 font-headline text-sm font-bold brutal-shadow brutal-shadow-hover brutal-shadow-active flex items-center justify-center gap-2 cursor-pointer">
                <MessageSquare size={16} /> COMMENT ({comments.length})
              </button>
            </a>
          </section>

          {/* ── Comments ── */}
          <section id="comments-block" className="border-3 border-border-color bg-card-bg p-6 brutal-shadow space-y-6">
            <h3 className="font-headline text-lg uppercase font-bold text-foreground border-b-2 border-border-color/10 pb-3">
              TRANSCEIVER FEEDBACK ({comments.length})
            </h3>

            <form onSubmit={handleCommentSubmit} className="space-y-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="TRANSMIT YOUR FEEDBACK OR CRITIQUE MEMORY BLOCK..."
                rows={3}
                className="w-full bg-card-bg text-foreground border-3 border-border-color font-label font-bold text-xs p-3 focus:outline-none placeholder:text-foreground/40"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-[#ef6540] text-white hover:bg-[#fabb59] hover:text-[#1B1C1A] font-label font-bold text-xs uppercase border-3 border-[#1B1C1A] brutal-shadow brutal-shadow-hover cursor-pointer"
              >
                BLAST FEEDBACK
              </button>
            </form>

            <div className="divide-y divide-[#1B1C1A]/10 space-y-4 pt-2">
              {comments.map((comment) => (
                <div key={comment.id} className="pt-4 first:pt-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-label text-xs font-bold text-[#ef6540]">{comment.author}</span>
                    <span className="text-[10px] text-foreground/50">{comment.time}</span>
                  </div>
                  <p className="font-body text-xs text-foreground/80 leading-relaxed">{comment.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ── Floating Reader Settings ── */}
      <div className="fixed bottom-8 right-8 z-50">
        <div
          className={`absolute bottom-20 right-0 bg-card-bg border-3 border-border-color p-4 brutal-shadow w-52 flex flex-col gap-3 transition-all duration-200 ${
            settingsOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4 pointer-events-none"
          }`}
        >
          <p className="font-label text-xs uppercase font-bold border-b-2 border-border-color pb-1.5 text-foreground">
            READER SETUP MATRIX
          </p>

          <button
            onClick={() => setTheme("light")}
            className={`flex items-center gap-2 text-left font-body text-xs p-1.5 px-2.5 border-2 border-transparent hover:border-border-color hover:bg-[#ffb4a1] ${
              theme === "light" ? "bg-[#fabb59] text-[#1B1C1A] border-border-color" : "text-foreground/80"
            }`}
          >
            <Sun size={14} /> Light Frequency
          </button>

          <button
            onClick={() => setTheme("dark")}
            className={`flex items-center gap-2 text-left font-body text-xs p-1.5 px-2.5 border-2 border-transparent hover:border-border-color hover:bg-[#ffb4a1] ${
              theme === "dark" ? "bg-[#fabb59] text-[#1B1C1A] border-border-color" : "text-foreground/80"
            }`}
          >
            <Moon size={14} /> Dark Brutal Night
          </button>

          <button
            onClick={() => setGrainEnabled(!grainEnabled)}
            className="flex items-center justify-between text-left font-body text-xs p-1.5 px-2.5 border-2 border-transparent hover:border-border-color hover:bg-[#ffb4a1] text-foreground/80"
          >
            <span className="flex items-center gap-2">
              <Sparkles size={14} /> Stardust Overlay
            </span>
            <span className={`font-label font-bold text-[10px] px-2 py-0.5 border border-[#1B1C1A] ${grainEnabled ? "bg-[#ef6540] text-white" : "bg-gray-300 text-gray-700"}`}>
              {grainEnabled ? "ON" : "OFF"}
            </span>
          </button>
        </div>

        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="bg-[#ef6540] border-3 border-[#1B1C1A] w-14 h-14 rounded-full flex items-center justify-center text-white brutal-shadow brutal-shadow-hover brutal-shadow-active transform hover:rotate-45 cursor-pointer"
        >
          <Settings size={26} />
        </button>
      </div>
    </div>
  );
}
