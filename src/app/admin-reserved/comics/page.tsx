"use client";

import React, { useState, useEffect } from "react";
import ComicCard, { Comic } from "@/components/admin/ComicCard";
import EditModal from "@/components/admin/EditModal";
import { BookOpen, Plus, Search } from "lucide-react";

interface Creator {
  id: string;
  name: string;
}

export default function AdminComics() {
  const [comics, setComics] = useState<Comic[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingComic, setEditingComic] = useState<Comic | null>(null);
  
  // Form fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("Action");
  const [score, setScore] = useState("0.0");
  const [reads, setReads] = useState("0");
  const [rank, setRank] = useState("");
  const [isOriginal, setIsOriginal] = useState(false);
  const [selectedCreatorIds, setSelectedCreatorIds] = useState<string[]>([]);
  const [error, setError] = useState("");

  const genres = ["Action", "Fantasy", "Sci-Fi", "Drama", "Comedy"];

  const fetchData = () => {
    setLoading(true);
    const fetchComics = fetch("/api/admin/comics").then((res) => res.json());
    const fetchCreators = fetch("/api/admin/creators").then((res) => res.json());

    Promise.all([fetchComics, fetchCreators])
      .then(([comicsData, creatorsData]) => {
        setComics(comicsData.comics || []);
        setCreators(creatorsData.creators || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sync slug generation
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingComic) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  };

  const openCreateModal = () => {
    setEditingComic(null);
    setTitle("");
    setSlug("");
    setDescription("");
    setGenre("Action");
    setScore("0.0");
    setReads("0");
    setRank("");
    setIsOriginal(false);
    setSelectedCreatorIds([]);
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (comic: Comic) => {
    setEditingComic(comic);
    setTitle(comic.title);
    setSlug(comic.slug);
    setDescription(comic.description || "");
    setGenre(comic.genre);
    setScore(comic.score);
    setReads(comic.reads);
    setRank(comic.rank || "");
    setIsOriginal(comic.is_original);
    setSelectedCreatorIds(comic.creatorIds || []);
    setError("");
    setModalOpen(true);
  };

  const handleCreatorToggle = (creatorId: string) => {
    setSelectedCreatorIds((prev) =>
      prev.includes(creatorId)
        ? prev.filter((id) => id !== creatorId)
        : [...prev, creatorId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title || !slug) {
      setError("Title and slug are required.");
      return;
    }

    const payload = {
      title,
      slug,
      description,
      genre,
      score,
      reads,
      rank,
      is_original: isOriginal,
      creatorIds: selectedCreatorIds
    };

    const url = editingComic 
      ? `/api/admin/comics/${editingComic.id}` 
      : "/api/admin/comics";
    const method = editingComic ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setModalOpen(false);
        fetchData();
      } else {
        setError(data.error || "Save operation failed.");
      }
    } catch (err) {
      setError("Failed to transmit data to server.");
    }
  };

  const filteredComics = comics.filter((comic) =>
    comic.title.toLowerCase().includes(search.toLowerCase()) ||
    comic.genre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 text-foreground">
      {/* Header & Button */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#ef6540] text-white border-3 border-[#1B1C1A] brutal-shadow rounded-lg">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="font-headline text-2xl md:text-3xl font-black uppercase tracking-tight leading-none">
              COMICS DOSSIER
            </h1>
            <p className="font-body text-xs text-foreground/60 mt-1">
              Add and manage comics series, upload covers, and deploy episodes.
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-1.5 px-5 py-3 bg-[#fabb59] hover:bg-[#ef6540] text-[#1B1C1A] hover:text-white font-label font-bold text-xs uppercase border-3 border-[#1B1C1A] brutal-shadow brutal-shadow-hover transition-all cursor-pointer"
        >
          <Plus size={16} />
          CREATE NEW COMIC
        </button>
      </section>

      {/* Search Filter */}
      <section className="relative w-full max-w-md">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="SEARCH COMICS OR GENRES..."
          className="w-full bg-card-bg text-foreground border-3 border-border-color pl-10 pr-4 py-2.5 font-label font-bold text-xs focus:outline-none placeholder:text-foreground/30 focus:bg-[#ffb4a1]/5"
        />
      </section>

      {/* Grid List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 border-3 border-border-color bg-card-bg rounded-lg skeleton-shimmer" />
          ))}
        </div>
      ) : filteredComics.length === 0 ? (
        <div className="border-3 border-border-color bg-card-bg p-12 text-center rounded-lg text-foreground/50 font-label font-bold text-sm uppercase">
          No comics matching current filter coordinates.
        </div>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComics.map((comic) => (
            <ComicCard
              key={comic.id}
              comic={comic}
              onEdit={openEditModal}
            />
          ))}
        </section>
      )}

      {/* Create/Edit Modal */}
      <EditModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingComic ? "EDIT COMIC DOSSIER" : "CREATE NEW COMIC"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Mecha Soul 2099"
              className="w-full bg-card-bg border-3 border-[#1B1C1A] font-label font-bold text-xs px-3 py-2"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-label text-xs font-bold uppercase">Slug Identifier (URL)</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. mecha-soul-2099"
              className="w-full bg-card-bg border-3 border-[#1B1C1A] font-label font-bold text-xs px-3 py-2"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-label text-xs font-bold uppercase">Description Narrative</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary plot matrix..."
              rows={3}
              className="w-full bg-card-bg border-3 border-[#1B1C1A] font-label font-bold text-xs p-3 focus:outline-none"
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
              <label className="block font-label text-xs font-bold uppercase">Score rating</label>
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
              <label className="block font-label text-xs font-bold uppercase">Reads Count</label>
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
                placeholder="e.g. Rising Star"
                className="w-full bg-card-bg border-3 border-[#1B1C1A] font-label font-bold text-xs px-3 py-2"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 py-1.5">
            <input
              type="checkbox"
              id="isOriginal"
              checked={isOriginal}
              onChange={(e) => setIsOriginal(e.target.checked)}
              className="w-4 h-4 border-2 border-[#1B1C1A] accent-[#ef6540]"
            />
            <label htmlFor="isOriginal" className="font-label text-xs font-bold uppercase cursor-pointer select-none">
              Mark as Inkling Forge Original Exclusives
            </label>
          </div>

          {/* Creators Selection */}
          <div className="space-y-2">
            <label className="block font-label text-xs font-bold uppercase">Associated Creators</label>
            {creators.length === 0 ? (
              <p className="text-[10px] text-foreground/50 uppercase">No creators in directory yet.</p>
            ) : (
              <div className="border-3 border-[#1B1C1A] bg-card-bg p-3 max-h-32 overflow-y-auto space-y-1.5">
                {creators.map((c) => (
                  <div key={c.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`creator-${c.id}`}
                      checked={selectedCreatorIds.includes(c.id)}
                      onChange={() => handleCreatorToggle(c.id)}
                      className="w-4 h-4 border-2 border-[#1B1C1A] accent-[#fabb59]"
                    />
                    <label htmlFor={`creator-${c.id}`} className="font-label text-xs font-bold uppercase cursor-pointer select-none">
                      {c.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-[#fabb59] hover:bg-[#ef6540] text-[#1B1C1A] hover:text-white font-label font-bold text-xs uppercase border-3 border-[#1B1C1A] brutal-shadow brutal-shadow-hover transition-all cursor-pointer"
          >
            {editingComic ? "UPDATE DOSSIER" : "COMMIT COMIC RECORD"}
          </button>
        </form>
      </EditModal>
    </div>
  );
}
