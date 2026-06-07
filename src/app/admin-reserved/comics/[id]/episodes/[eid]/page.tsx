"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import EditModal from "@/components/admin/EditModal";
import PdfUploader from "@/components/admin/PdfUploader";
import PageGallery from "@/components/admin/PageGallery";
import { FileText, ArrowLeft, Upload, Edit, Trash2, Image as ImageIcon } from "lucide-react";

interface Episode {
  id: string;
  comic_id: string;
  title: string;
  description: string;
  episode_number: number;
  cover_image: string;
  comic_title?: string;
}

interface Page {
  id: string;
  page_number: number;
  original_page_number: number;
  image_path: string;
  width?: number;
  height?: number;
  file_size?: number;
}

export default function AdminEpisodeDetail({ params }: { params: Promise<{ id: string; eid: string }> }) {
  const router = useRouter();
  const { id: comicId, eid: episodeId } = use(params);

  const [episode, setEpisode] = useState<Episode | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editOpen, setEditOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [episodeNumber, setEpisodeNumber] = useState(1);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);

  const fetchDetails = (silent = false) => {
    if (!silent) setLoading(true);
    fetch(`/api/admin/episodes/${episodeId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Episode not found");
        return res.json();
      })
      .then((data) => {
        setEpisode(data.episode);
        setPages(data.pages || []);
      })
      .catch((err) => {
        console.error(err);
        router.push(`/admin-reserved/comics/${comicId}`);
      })
      .finally(() => {
        if (!silent) setLoading(false);
      });
  };

  useEffect(() => {
    fetchDetails();
  }, [episodeId]);

  const openEditModal = () => {
    if (!episode) return;
    setTitle(episode.title);
    setEpisodeNumber(episode.episode_number);
    setDescription(episode.description);
    setError("");
    setEditOpen(true);
  };

  const handleEpisodeUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`/api/admin/episodes/${episodeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          episode_number: episodeNumber,
          description,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setEditOpen(false);
        fetchDetails(true);
      } else {
        setError(data.error || "Save operation failed.");
      }
    } catch (err) {
      setError("Network error updating episode.");
    }
  };

  const handleEpisodeDelete = async () => {
    const confirm = window.confirm("CAUTION! Wiping this episode will wipe all parsed comic pages. Continue?");
    if (!confirm) return;

    try {
      const res = await fetch(`/api/admin/episodes/${episodeId}`, { method: "DELETE" });
      if (res.ok) {
        router.push(`/admin-reserved/comics/${comicId}`);
      } else {
        alert("Deletion failed.");
      }
    } catch (err) {
      alert("Delete network error.");
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/admin/episodes/${episodeId}/cover`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        fetchDetails(true);
      } else {
        alert(data.error || "Upload failed.");
      }
    } catch (err) {
      alert("Upload network error.");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleUploadSuccess = () => {
    fetchDetails(true); // Reload page list
  };

  if (loading || !episode) {
    return (
      <div className="space-y-6 text-foreground animate-pulse">
        <div className="h-6 w-32 border-3 border-border-color bg-gray-300 dark:bg-gray-700 rounded skeleton-shimmer" />
        <div className="h-56 border-3 border-border-color bg-card-bg rounded-lg skeleton-shimmer" />
      </div>
    );
  }

  return (
    <div className="space-y-8 text-foreground pb-20">
      {/* Back Button */}
      <Link href={`/admin-reserved/comics/${comicId}`}>
        <span className="inline-flex items-center gap-1 font-label font-bold text-xs uppercase text-foreground/50 hover:text-primary transition-colors cursor-pointer">
          <ArrowLeft size={14} /> BACK TO COMIC CODES
        </span>
      </Link>

      {/* Episode Header Info Box */}
      <section className="bg-card-bg border-3 border-border-color p-6 brutal-shadow rounded-lg space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Episode Cover */}
          <div className="w-full md:w-1/5 flex-none space-y-3">
            <label className="block font-label text-[10px] font-bold text-foreground/50 uppercase">EPISODE COVER ART</label>
            <div className="relative aspect-[3/4] w-full border-3 border-[#1B1C1A] bg-neutral-800 rounded-md overflow-hidden flex items-center justify-center group">
              {episode.cover_image ? (
                <img src={episode.cover_image} alt={episode.title} className="w-full h-full object-cover" />
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
                <input type="file" onChange={handleCoverUpload} className="hidden" accept="image/*" />
              </label>
            </div>
          </div>

          {/* Info & Actions */}
          <div className="flex-grow space-y-4">
            <div className="space-y-1">
              <span className="bg-[#ffb4a1] text-[#1B1C1A] font-label font-bold text-[9px] uppercase px-2 py-0.5 border-2 border-[#1B1C1A]">
                EPISODE {episode.episode_number}
              </span>
              <h1 className="font-headline text-2xl md:text-3xl font-black uppercase tracking-tight leading-none pt-1">
                {episode.title}
              </h1>
              <p className="font-label text-xs text-foreground/50 uppercase">
                SERIES: {episode.comic_title}
              </p>
            </div>

            <div className="space-y-1">
              <span className="block font-label text-[10px] font-bold text-foreground/50 uppercase">EPISODE LOG DESCRIPTION</span>
              <p className="font-body text-xs md:text-sm text-foreground/85 leading-relaxed">
                {episode.description || "No description logged."}
              </p>
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
                onClick={handleEpisodeDelete}
                className="flex items-center gap-1.5 px-4 py-2 border-3 border-rose-600 bg-card-bg hover:bg-rose-600 text-rose-600 hover:text-white font-label font-bold text-xs uppercase brutal-shadow brutal-shadow-hover transition-all cursor-pointer"
              >
                <Trash2 size={14} /> DELETE EPISODE
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PDF Uploader Section */}
      <section className="space-y-4">
        <h2 className="font-headline text-lg uppercase font-black tracking-wide flex items-center gap-2">
          <Upload size={18} className="text-[#ef6540]" /> UPLOAD COMIC DOSSIER (PDF)
        </h2>
        <PdfUploader episodeId={episodeId} onUploadSuccess={handleUploadSuccess} />
      </section>

      {/* Page Gallery Section */}
      <section className="space-y-4">
        <h2 className="font-headline text-lg uppercase font-black tracking-wide flex items-center gap-2">
          <ImageIcon size={18} className="text-[#fabb59]" /> PARSED PAGES ({pages.length})
        </h2>
        <PageGallery pages={pages} episodeId={episodeId} onOrderChanged={() => fetchDetails(true)} />
      </section>

      {/* Edit Episode Modal */}
      <EditModal isOpen={editOpen} onClose={() => setEditOpen(false)} title="EDIT EPISODE DETAILS">
        <form onSubmit={handleEpisodeUpdate} className="space-y-4">
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
            <label className="block font-label text-xs font-bold uppercase">Episode Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-card-bg border-3 border-[#1B1C1A] font-label font-bold text-xs p-3"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#fabb59] hover:bg-[#ef6540] text-[#1B1C1A] hover:text-white font-label font-bold text-xs uppercase border-3 border-[#1B1C1A] brutal-shadow brutal-shadow-hover transition-all cursor-pointer"
          >
            UPDATE EPISODE DOSSIER
          </button>
        </form>
      </EditModal>
    </div>
  );
}
