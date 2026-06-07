"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import EditModal from "@/components/admin/EditModal";
import { BookOpen, ArrowLeft, Upload, Edit, Trash2, Plus, FileText, ChevronRight } from "lucide-react";

interface Comic {
  id: string;
  title: string;
  slug: string;
  description: string;
  genre: string;
  reads: string;
  score: string;
  rank: string;
  cover_image: string;
  banner_image: string;
  is_original: boolean;
  is_trending: boolean;
  creatorIds: string[];
}

interface Episode {
  id: string;
  title: string;
  description: string;
  episode_number: number;
  cover_image: string;
  page_count: number;
}

interface Creator {
  id: string;
  name: string;
}

export default function AdminComicDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id: comicId } = use(params);
  const router = useRouter();

  const [comic, setComic] = useState<Comic | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Comic Modal State
  const [editOpen, setEditOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("Action");
  const [score, setScore] = useState("0.0");
  const [reads, setReads] = useState("0");
  const [rank, setRank] = useState("");
  const [isOriginal, setIsOriginal] = useState(false);
  const [selectedCreatorIds, setSelectedCreatorIds] = useState<string[]>([]);
  
  // Add Episode Modal State
  const [addEpisodeOpen, setAddEpisodeOpen] = useState(false);
  const [episodeTitle, setEpisodeTitle] = useState("");
  const [episodeNumber, setEpisodeNumber] = useState(1);
  const [episodeDescription, setEpisodeDescription] = useState("");

  const [error, setError] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const genres = ["Action", "Fantasy", "Sci-Fi", "Drama", "Comedy"];

  const fetchDetails = () => {
    setLoading(true);
    const fetchComicInfo = fetch(`/api/admin/comics/${comicId}`).then((res) => {
      if (!res.ok) throw new Error("Not found");
      return res.json();
    });
    const fetchCreators = fetch("/api/admin/creators").then((res) => res.json());

    Promise.all([fetchComicInfo, fetchCreators])
      .then(([infoData, creatorsData]) => {
        setComic(infoData.comic);
        setEpisodes(infoData.episodes || []);
        setCreators(creatorsData.creators || []);
      })
      .catch((err) => {
        console.error(err);
        router.push("/admin-reserved/comics");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDetails();
  }, [comicId]);

  const openEditModal = () => {
    if (!comic) return;
    setTitle(comic.title);
    setSlug(comic.slug);
    setDescription(comic.description);
    setGenre(comic.genre);
    setScore(comic.score);
    setReads(comic.reads);
    setRank(comic.rank);
    setIsOriginal(comic.is_original);
    setSelectedCreatorIds(comic.creatorIds || []);
    setError("");
    setEditOpen(true);
  };

  const openAddEpisodeModal = () => {
    // Propose default episode number
    const maxNum = episodes.reduce((max, ep) => Math.max(max, ep.episode_number), 0);
    setEpisodeNumber(maxNum + 1);
    setEpisodeTitle(`CHAPTER ${maxNum + 1}`);
    setEpisodeDescription("");
    setError("");
    setAddEpisodeOpen(true);
  };

  const handleCreatorToggle = (creatorId: string) => {
    setSelectedCreatorIds((prev) =>
      prev.includes(creatorId)
        ? prev.filter((cid) => cid !== creatorId)
        : [...prev, creatorId]
    );
  };

  const handleComicUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`/api/admin/comics/${comicId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          description,
          genre,
          score,
          reads,
          rank,
          is_original: isOriginal,
          creatorIds: selectedCreatorIds
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setEditOpen(false);
        fetchDetails();
      } else {
        setError(data.error || "Save operation failed.");
      }
    } catch (err) {
      setError("Failed to transmit data to server.");
    }
  };

  const handleComicDelete = async () => {
    const confirm = window.confirm("CAUTION! Deleting this comic will permanently wipe all associated episodes and parsed pages. Proceed?");
    if (!confirm) return;

    try {
      const res = await fetch(`/api/admin/comics/${comicId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin-reserved/comics");
      } else {
        alert("Deletion failed.");
      }
    } catch (err) {
      alert("Delete transaction failed.");
    }
  };

  const handleAddEpisodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`/api/admin/comics/${comicId}/episodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: episodeTitle,
          episode_number: episodeNumber,
          description: episodeDescription,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAddEpisodeOpen(false);
        fetchDetails();
      } else {
        setError(data.error || "Failed to create episode.");
      }
    } catch (err) {
      setError("Network uplink error.");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isBanner: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isBanner) setUploadingBanner(true);
    else setUploadingCover(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("isBanner", isBanner ? "true" : "false");

    try {
      const res = await fetch(`/api/admin/comics/${comicId}/cover`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        fetchDetails();
      } else {
        alert(data.error || "Upload failed.");
      }
    } catch (err) {
      alert("Upload network error.");
    } finally {
      if (isBanner) setUploadingBanner(false);
      else setUploadingCover(false);
    }
  };

  if (loading || !comic) {
    return (
      <div className="space-y-6 text-foreground animate-pulse">
        <div className="h-6 w-32 border-3 border-border-color bg-gray-300 dark:bg-gray-700 rounded skeleton-shimmer" />
        <div className="h-56 border-3 border-border-color bg-card-bg rounded-lg skeleton-shimmer" />
      </div>
    );
  }

  const creatorNames = comic.creatorIds
    ? comic.creatorIds.map((cid) => creators.find((c) => c.id === cid)?.name || cid).join(" & ")
    : "No Creators Assigned";

  return (
    <div className="space-y-8 text-foreground pb-20">
      {/* Back Button */}
      <Link href="/admin-reserved/comics">
        <span className="inline-flex items-center gap-1 font-label font-bold text-xs uppercase text-foreground/50 hover:text-primary transition-colors cursor-pointer">
          <ArrowLeft size={14} /> BACK TO COMICS DOSSIER
        </span>
      </Link>

      {/* Comic Header Details Box */}
      <section className="bg-card-bg border-3 border-border-color p-6 brutal-shadow rounded-lg space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Cover Art Upload */}
          <div className="w-full md:w-1/4 flex-none space-y-3">
            <label className="block font-label text-[10px] font-bold text-foreground/50 uppercase">COVER ART</label>
            <div className="relative aspect-[3/4] w-full border-3 border-[#1B1C1A] bg-neutral-800 rounded-md overflow-hidden flex items-center justify-center group">
              {comic.cover_image ? (
                <img src={comic.cover_image} alt={comic.title} className="w-full h-full object-cover" />
              ) : (
                <span className="font-label text-xs font-bold text-white uppercase opacity-40">NO IMAGE</span>
              )}
              {uploadingCover && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center font-label text-[10px] font-bold uppercase">
                  UPLOADING...
                </div>
              )}
              <label className="absolute bottom-2 right-2 p-2 bg-[#fabb59] border-2 border-[#1B1C1A] brutal-shadow rounded-full cursor-pointer hover:bg-[#ef6540] hover:text-white transition-all">
                <Upload size={14} />
                <input type="file" onChange={(e) => handleImageUpload(e, false)} className="hidden" accept="image/*" />
              </label>
            </div>
          </div>

          {/* Banner Art Upload & Info */}
          <div className="flex-grow space-y-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-headline text-2xl md:text-3xl font-black uppercase tracking-tight leading-none">
                  {comic.title}
                </h1>
                <span className="px-2 py-0.5 bg-[#fabb59] text-[#1B1C1A] border-2 border-[#1B1C1A] rounded-full font-label font-bold text-[9px] uppercase">
                  {comic.genre}
                </span>
                {comic.is_original && (
                  <span className="px-2 py-0.5 bg-[#ef6540] text-white border-2 border-[#1B1C1A] rounded-full font-label font-bold text-[9px] uppercase">
                    ORIGINAL
                  </span>
                )}
              </div>
              <p className="font-label text-xs text-foreground/50 uppercase">
                BY: {creatorNames}
              </p>
            </div>

            <div className="space-y-1">
              <span className="block font-label text-[10px] font-bold text-foreground/50 uppercase">SYNOPSIS NARRATIVE</span>
              <p className="font-body text-xs md:text-sm text-foreground/80 leading-relaxed">
                {comic.description || "No description set."}
              </p>
            </div>

            {/* Banner Art */}
            <div className="space-y-2">
              <span className="block font-label text-[10px] font-bold text-foreground/50 uppercase">BANNER BACKGROUND ART</span>
              <div className="relative aspect-[16/5] w-full border-3 border-[#1B1C1A] bg-neutral-800 rounded-md overflow-hidden flex items-center justify-center">
                {comic.banner_image ? (
                  <img src={comic.banner_image} alt={comic.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-label text-xs font-bold text-white uppercase opacity-40">NO BANNER IMAGE</span>
                )}
                {uploadingBanner && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center font-label text-[10px] font-bold uppercase">
                    UPLOADING...
                  </div>
                )}
                <label className="absolute bottom-2 right-2 p-2 bg-[#fabb59] border-2 border-[#1B1C1A] brutal-shadow rounded-full cursor-pointer hover:bg-[#ef6540] hover:text-white transition-all">
                  <Upload size={14} />
                  <input type="file" onChange={(e) => handleImageUpload(e, true)} className="hidden" accept="image/*" />
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={openEditModal}
                className="flex items-center gap-1.5 px-4 py-2 border-3 border-border-color bg-card-bg hover:bg-[#fabb59] text-foreground hover:text-[#1B1C1A] font-label font-bold text-xs uppercase brutal-shadow brutal-shadow-hover transition-all cursor-pointer"
              >
                <Edit size={14} /> EDIT DETAILS
              </button>
              <button
                onClick={handleComicDelete}
                className="flex items-center gap-1.5 px-4 py-2 border-3 border-rose-600 bg-card-bg hover:bg-rose-600 text-rose-600 hover:text-white font-label font-bold text-xs uppercase brutal-shadow brutal-shadow-hover transition-all cursor-pointer"
              >
                <Trash2 size={14} /> DELETE COMIC
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Episodes Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-xl uppercase font-black tracking-wide flex items-center gap-2">
            <FileText size={20} className="text-[#ef6540]" /> EPISODES LIST
          </h2>

          <button
            onClick={openAddEpisodeModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#fabb59] hover:bg-[#ef6540] text-[#1B1C1A] hover:text-white font-label font-bold text-xs uppercase border-3 border-[#1B1C1A] brutal-shadow brutal-shadow-hover transition-all cursor-pointer"
          >
            <Plus size={14} /> ADD EPISODE
          </button>
        </div>

        {episodes.length === 0 ? (
          <div className="border-3 border-border-color bg-card-bg p-8 text-center rounded-lg text-foreground/50 font-label font-bold text-sm uppercase">
            No episodes registered for this series yet. Add one to start uploading.
          </div>
        ) : (
          <div className="border-3 border-border-color bg-card-bg p-2 brutal-shadow divide-y divide-border-color/10">
            {episodes.map((ep) => (
              <Link href={`/admin-reserved/comics/${comicId}/episodes/${ep.id}`} key={ep.id}>
                <div className="flex items-center justify-between p-4 hover:bg-[#ffb4a1]/10 group cursor-pointer text-foreground">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-16 border-2 border-border-color bg-neutral-800 overflow-hidden flex-none rounded">
                      {ep.cover_image ? (
                        <img src={ep.cover_image} alt={ep.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#fabb59] flex items-center justify-center font-bold text-xs">
                          {ep.episode_number}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-headline text-sm md:text-base font-bold uppercase group-hover:text-primary leading-tight">
                        {ep.title}
                      </h4>
                      <p className="font-body text-[10px] text-foreground/50 uppercase mt-0.5">
                        EPISODE {ep.episode_number} • {ep.page_count} PAGES
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-foreground/40 group-hover:text-primary" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Edit Comic Details Modal */}
      <EditModal isOpen={editOpen} onClose={() => setEditOpen(false)} title="EDIT COMIC DETAILS">
        <form onSubmit={handleComicUpdate} className="space-y-4">
          {error && (
            <div className="bg-rose-100 border-2 border-rose-600 text-rose-700 p-2.5 font-label text-xs font-bold uppercase">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="block font-label text-xs font-bold uppercase">Comic Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-card-bg border-3 border-[#1B1C1A] font-label font-bold text-xs px-3 py-2"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-label text-xs font-bold uppercase">Slug Identifier</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-card-bg border-3 border-[#1B1C1A] font-label font-bold text-xs px-3 py-2"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-label text-xs font-bold uppercase">Description Narrative</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-card-bg border-3 border-[#1B1C1A] font-label font-bold text-xs p-3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block font-label text-xs font-bold uppercase">Genre</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-card-bg border-3 border-[#1B1C1A] font-label font-bold text-xs px-3 py-2"
              >
                {genres.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-label text-xs font-bold uppercase">Score</label>
              <input
                type="text"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-full bg-card-bg border-3 border-[#1B1C1A] font-label font-bold text-xs px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block font-label text-xs font-bold uppercase">Reads</label>
              <input
                type="text"
                value={reads}
                onChange={(e) => setReads(e.target.value)}
                className="w-full bg-card-bg border-3 border-[#1B1C1A] font-label font-bold text-xs px-3 py-2"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-label text-xs font-bold uppercase">Rank Label</label>
              <input
                type="text"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                className="w-full bg-card-bg border-3 border-[#1B1C1A] font-label font-bold text-xs px-3 py-2"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 py-1.5">
            <input
              type="checkbox"
              id="isOriginalEdit"
              checked={isOriginal}
              onChange={(e) => setIsOriginal(e.target.checked)}
              className="w-4 h-4 border-2 border-[#1B1C1A] accent-[#ef6540]"
            />
            <label htmlFor="isOriginalEdit" className="font-label text-xs font-bold uppercase cursor-pointer select-none">
              Mark as Inkling Forge Original Exclusive
            </label>
          </div>

          {/* Creators Selection */}
          <div className="space-y-2">
            <label className="block font-label text-xs font-bold uppercase">Associated Creators</label>
            <div className="border-3 border-[#1B1C1A] bg-card-bg p-3 max-h-32 overflow-y-auto space-y-1.5">
              {creators.map((c) => (
                <div key={c.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`edit-creator-${c.id}`}
                    checked={selectedCreatorIds.includes(c.id)}
                    onChange={() => handleCreatorToggle(c.id)}
                    className="w-4 h-4 border-2 border-[#1B1C1A] accent-[#fabb59]"
                  />
                  <label htmlFor={`edit-creator-${c.id}`} className="font-label text-xs font-bold uppercase cursor-pointer select-none">
                    {c.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#fabb59] hover:bg-[#ef6540] text-[#1B1C1A] hover:text-white font-label font-bold text-xs uppercase border-3 border-[#1B1C1A] brutal-shadow brutal-shadow-hover transition-all cursor-pointer"
          >
            UPDATE COMIC DOSSIER
          </button>
        </form>
      </EditModal>

      {/* Add Episode Modal */}
      <EditModal isOpen={addEpisodeOpen} onClose={() => setAddEpisodeOpen(false)} title="ADD NEW EPISODE">
        <form onSubmit={handleAddEpisodeSubmit} className="space-y-4">
          {error && (
            <div className="bg-rose-100 border-2 border-rose-600 text-rose-700 p-2.5 font-label text-xs font-bold uppercase">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="block font-label text-xs font-bold uppercase">Episode Title</label>
            <input
              type="text"
              required
              value={episodeTitle}
              onChange={(e) => setEpisodeTitle(e.target.value)}
              placeholder="e.g. CHAPTER 1: GRID UPLINK"
              className="w-full bg-card-bg border-3 border-[#1B1C1A] font-label font-bold text-xs px-3 py-2"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-label text-xs font-bold uppercase">Episode Number</label>
            <input
              type="number"
              required
              value={episodeNumber}
              onChange={(e) => setEpisodeNumber(parseInt(e.target.value, 10) || 1)}
              className="w-full bg-card-bg border-3 border-[#1B1C1A] font-label font-bold text-xs px-3 py-2"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-label text-xs font-bold uppercase">Episode Description (Optional)</label>
            <textarea
              value={episodeDescription}
              onChange={(e) => setEpisodeDescription(e.target.value)}
              rows={2}
              className="w-full bg-card-bg border-3 border-[#1B1C1A] font-label font-bold text-xs p-3"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#fabb59] hover:bg-[#ef6540] text-[#1B1C1A] hover:text-white font-label font-bold text-xs uppercase border-3 border-[#1B1C1A] brutal-shadow brutal-shadow-hover transition-all cursor-pointer"
          >
            COMMIT EPISODE RECORD
          </button>
        </form>
      </EditModal>
    </div>
  );
}
