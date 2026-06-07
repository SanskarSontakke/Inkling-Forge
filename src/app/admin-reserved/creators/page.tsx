"use client";

import React, { useState, useEffect } from "react";
import EditModal from "@/components/admin/EditModal";
import { Users, Plus, Edit2, Trash2, Upload, ArrowUpRight, Search } from "lucide-react";

interface Creator {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  followers: string;
  reads: string;
  twitter: string;
  instagram: string;
  artstation: string;
}

export default function AdminCreators() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCreator, setEditingCreator] = useState<Creator | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [followers, setFollowers] = useState("0");
  const [reads, setReads] = useState("0");
  const [twitter, setTwitter] = useState("");
  const [instagram, setInstagram] = useState("");
  const [artstation, setArtstation] = useState("");
  const [error, setError] = useState("");
  const [uploadingAvatarId, setUploadingAvatarId] = useState<string | null>(null);

  const fetchCreators = () => {
    setLoading(true);
    fetch("/api/admin/creators")
      .then((res) => res.json())
      .then((data) => setCreators(data.creators || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCreators();
  }, []);

  const openCreateModal = () => {
    setEditingCreator(null);
    setName("");
    setRole("");
    setBio("");
    setFollowers("0");
    setReads("0");
    setTwitter("");
    setInstagram("");
    setArtstation("");
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (creator: Creator) => {
    setEditingCreator(creator);
    setName(creator.name);
    setRole(creator.role);
    setBio(creator.bio);
    setFollowers(creator.followers);
    setReads(creator.reads);
    setTwitter(creator.twitter || "");
    setInstagram(creator.instagram || "");
    setArtstation(creator.artstation || "");
    setError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name) {
      setError("Creator name is required.");
      return;
    }

    const payload = {
      name,
      role,
      bio,
      followers,
      reads,
      twitter,
      instagram,
      artstation
    };

    const url = editingCreator
      ? `/api/admin/creators/${editingCreator.id}`
      : "/api/admin/creators";
    const method = editingCreator ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setModalOpen(false);
        fetchCreators();
      } else {
        setError(data.error || "Save failed.");
      }
    } catch (err) {
      setError("Network submission error.");
    }
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Are you sure you want to delete this creator? This will unlink them from all comics.");
    if (!confirm) return;

    try {
      const res = await fetch(`/api/admin/creators/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchCreators();
      } else {
        alert("Deletion failed.");
      }
    } catch (err) {
      alert("Delete transaction failed.");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>, creatorId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatarId(creatorId);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/admin/creators/${creatorId}/avatar`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        fetchCreators();
      } else {
        alert(data.error || "Avatar upload failed.");
      }
    } catch (err) {
      alert("Uplink upload error.");
    } finally {
      setUploadingAvatarId(null);
    }
  };

  const filteredCreators = creators.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 text-foreground pb-20">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#ef6540] text-white border-3 border-[#1B1C1A] brutal-shadow rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <h1 className="font-headline text-2xl md:text-3xl font-black uppercase tracking-tight leading-none">
              CREATORS MATRIX
            </h1>
            <p className="font-body text-xs text-foreground/60 mt-1">
              Add creators, manage roles, social channels, and sync artist profiles.
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-1.5 px-5 py-3 bg-[#fabb59] hover:bg-[#ef6540] text-[#1B1C1A] hover:text-white font-label font-bold text-xs uppercase border-3 border-[#1B1C1A] brutal-shadow brutal-shadow-hover transition-all cursor-pointer"
        >
          <Plus size={16} />
          ADD CREATOR
        </button>
      </section>

      {/* Search Filter */}
      <section className="relative w-full max-w-md">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="SEARCH CREATORS OR ROLES..."
          className="w-full bg-card-bg text-foreground border-3 border-border-color pl-10 pr-4 py-2.5 font-label font-bold text-xs focus:outline-none placeholder:text-foreground/30 focus:bg-[#ffb4a1]/5"
        />
      </section>

      {/* Grid of Creators */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 border-3 border-border-color bg-card-bg rounded-lg skeleton-shimmer" />
          ))}
        </div>
      ) : filteredCreators.length === 0 ? (
        <div className="border-3 border-border-color bg-card-bg p-12 text-center rounded-lg text-foreground/50 font-label font-bold text-sm uppercase">
          No creators found.
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCreators.map((creator) => (
            <div
              key={creator.id}
              className="bg-card-bg border-3 border-border-color brutal-shadow rounded-lg p-5 flex flex-col justify-between gap-4 text-foreground group"
            >
              <div className="space-y-4">
                {/* Profile Header with Avatar Upload */}
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full border-3 border-border-color overflow-hidden bg-neutral-800 flex-none flex items-center justify-center">
                    {creator.avatar ? (
                      <img src={creator.avatar} alt={creator.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-headline text-lg font-black text-white">{creator.name.charAt(0)}</span>
                    )}
                    {uploadingAvatarId === creator.id && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center text-[8px] font-label font-bold">
                        UP...
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity duration-200">
                      <Upload size={14} />
                      <input type="file" onChange={(e) => handleAvatarUpload(e, creator.id)} className="hidden" accept="image/*" />
                    </label>
                  </div>

                  <div>
                    <h3 className="font-headline text-base uppercase font-bold group-hover:text-primary transition-colors">
                      {creator.name}
                    </h3>
                    <span className="bg-[#ffb4a1] text-[#1B1C1A] font-label font-bold text-[9px] uppercase px-2 py-0.5 border-2 border-[#1B1C1A]">
                      {creator.role || "Creator"}
                    </span>
                  </div>
                </div>

                <p className="font-body text-xs text-foreground/70 leading-relaxed line-clamp-2">
                  {creator.bio || "No biography details logged."}
                </p>
              </div>

              {/* Stats & Actions */}
              <div className="space-y-3 pt-2 border-t border-border-color/10">
                <div className="flex justify-between items-center text-[9px] font-label text-foreground/50">
                  <span>FOLLOWS: {creator.followers}</span>
                  <span>READS: {creator.reads}</span>
                </div>

                <div className="flex justify-between gap-4 items-center">
                  {/* Social badges indicator */}
                  <div className="flex gap-1.5 text-[9px] font-label font-bold uppercase text-foreground/60">
                    {creator.twitter && <span>TW</span>}
                    {creator.instagram && <span>IG</span>}
                    {creator.artstation && <span>AS</span>}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(creator)}
                      className="p-1.5 bg-card-bg hover:bg-[#fabb59] text-foreground hover:text-[#1B1C1A] border-2 border-border-color brutal-shadow brutal-shadow-hover transition-all cursor-pointer"
                      title="Edit Details"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(creator.id)}
                      className="p-1.5 bg-card-bg hover:bg-rose-600 text-rose-600 hover:text-white border-2 border-border-color brutal-shadow brutal-shadow-hover transition-all cursor-pointer"
                      title="Delete Creator"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Add/Edit Modal */}
      <EditModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingCreator ? "EDIT ARTIST ACCOUNT" : "ADD NEW CREATOR"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-rose-100 border-2 border-rose-600 text-rose-700 p-2.5 font-label text-xs font-bold uppercase">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="block font-label text-xs font-bold uppercase">Full Display Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rose Garden"
              className="w-full bg-card-bg border-3 border-[#1B1C1A] font-label font-bold text-xs px-3 py-2"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-label text-xs font-bold uppercase">Primary Creative Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Lead Illustrator & Writer"
              className="w-full bg-card-bg border-3 border-[#1B1C1A] font-label font-bold text-xs px-3 py-2"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-label text-xs font-bold uppercase">Short Biography</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Creating epic neubrutalist visual systems..."
              rows={3}
              className="w-full bg-card-bg border-3 border-[#1B1C1A] font-label font-bold text-xs p-3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block font-label text-xs font-bold uppercase">Follower Metrics</label>
              <input
                type="text"
                value={followers}
                onChange={(e) => setFollowers(e.target.value)}
                className="w-full bg-card-bg border-3 border-[#1B1C1A] font-label font-bold text-xs px-3 py-2"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-label text-xs font-bold uppercase">Reads Metrics</label>
              <input
                type="text"
                value={reads}
                onChange={(e) => setReads(e.target.value)}
                className="w-full bg-card-bg border-3 border-[#1B1C1A] font-label font-bold text-xs px-3 py-2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block font-label text-xs font-bold uppercase">Social Transceiver Channels</label>
            <div className="grid grid-cols-1 gap-2 border-2 border-[#1B1C1A] p-3 rounded">
              <div className="flex items-center gap-2">
                <span className="font-label text-[10px] font-bold w-16 uppercase">Twitter:</span>
                <input
                  type="text"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="@handle"
                  className="flex-grow bg-card-bg border-2 border-[#1B1C1A] font-label text-xs px-2 py-1"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="font-label text-[10px] font-bold w-16 uppercase">Instagram:</span>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@handle"
                  className="flex-grow bg-card-bg border-2 border-[#1B1C1A] font-label text-xs px-2 py-1"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="font-label text-[10px] font-bold w-16 uppercase">ArtStation:</span>
                <input
                  type="text"
                  value={artstation}
                  onChange={(e) => setArtstation(e.target.value)}
                  placeholder="profile_name"
                  className="flex-grow bg-card-bg border-2 border-[#1B1C1A] font-label text-xs px-2 py-1"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#fabb59] hover:bg-[#ef6540] text-[#1B1C1A] hover:text-white font-label font-bold text-xs uppercase border-3 border-[#1B1C1A] brutal-shadow brutal-shadow-hover transition-all cursor-pointer"
          >
            {editingCreator ? "SAVE CHANGELOG" : "COMMIT ARTIST RECORD"}
          </button>
        </form>
      </EditModal>
    </div>
  );
}
