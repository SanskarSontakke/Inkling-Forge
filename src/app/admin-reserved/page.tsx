"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Terminal } from "lucide-react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push("/admin-reserved/dashboard");
        router.refresh();
      } else {
        setError(data.error || "Authentication failed.");
      }
    } catch (err) {
      setError("Failed to establish uplink. Check network.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-4">
      <div className="bg-card-bg border-4 border-[#1B1C1A] brutal-shadow rounded-lg p-6 space-y-6 text-foreground">
        {/* Header Branding */}
        <div className="bg-[#ef6540] border-3 border-[#1B1C1A] brutal-shadow p-4 text-center text-white rotate-1">
          <Terminal size={24} className="mx-auto mb-2" />
          <h2 className="font-headline text-xl font-black uppercase tracking-tight">
            SECURE ACCESS CONSOLE
          </h2>
          <p className="font-label text-[9px] font-bold uppercase tracking-wider mt-1 text-white/80">
            ADMINISTRATOR UPLINK ONLY
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-rose-100 dark:bg-rose-950/40 border-3 border-rose-600 dark:border-rose-500 text-rose-700 dark:text-rose-400 p-3 flex gap-2 items-start brutal-shadow text-xs font-label">
            <ShieldAlert size={16} className="flex-none mt-0.5" />
            <div>
              <p className="font-bold">ACCESS DENIED</p>
              <p className="opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block font-label text-xs font-bold uppercase">
              UPLINK IDENTITY
            </label>
            <input
              type="text"
              required
              disabled={loading}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ENTER ADMIN USERNAME"
              className="w-full bg-card-bg text-foreground border-3 border-[#1B1C1A] font-label font-bold text-xs px-3 py-2.5 focus:outline-none placeholder:text-foreground/30 focus:bg-[#ffb4a1]/5"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-label text-xs font-bold uppercase">
              DECRYPT PASSCODE
            </label>
            <input
              type="password"
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ENTER SECURE PASSCODE"
              className="w-full bg-card-bg text-foreground border-3 border-[#1B1C1A] font-label font-bold text-xs px-3 py-2.5 focus:outline-none placeholder:text-foreground/30 focus:bg-[#ffb4a1]/5"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#fabb59] hover:bg-[#ef6540] text-[#1B1C1A] hover:text-white font-label font-bold text-xs uppercase border-3 border-[#1B1C1A] brutal-shadow brutal-shadow-hover transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? "DECRYPTING..." : "INITIALIZE DECRYPTION"}
          </button>
        </form>
      </div>
    </div>
  );
}
