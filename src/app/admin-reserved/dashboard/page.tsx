"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, BookOpen, Users, FileText, ChevronRight, Activity, Terminal } from "lucide-react";

interface Stats {
  totalComics: number;
  totalEpisodes: number;
  totalPages: number;
  totalCreators: number;
}

interface ActivityItem {
  id: string;
  title: string;
  updated_at: string;
  type: "comic" | "creator";
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized or database failure");
        return res.json();
      })
      .then((data) => {
        setStats(data.stats);
        setActivities(data.recentActivity || []);
      })
      .catch((err) => console.error("Error fetching stats:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 text-foreground animate-pulse">
        <div className="h-9 w-64 border-3 border-border-color rounded bg-gray-300 dark:bg-gray-700 skeleton-shimmer" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 border-3 border-border-color bg-card-bg rounded-lg skeleton-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { name: "Total Series", count: stats?.totalComics || 0, icon: BookOpen, color: "bg-[#fabb59]" },
    { name: "Total Episodes", count: stats?.totalEpisodes || 0, icon: FileText, color: "bg-[#ffb4a1]" },
    { name: "Total Pages", count: stats?.totalPages || 0, icon: Terminal, color: "bg-[#ef6540] text-white" },
    { name: "Total Creators", count: stats?.totalCreators || 0, icon: Users, color: "bg-[#efe1c7]" },
  ];

  return (
    <div className="space-y-8 text-foreground">
      {/* Header */}
      <section className="flex items-center gap-3">
        <div className="p-2 bg-[#ef6540] text-white border-3 border-[#1B1C1A] brutal-shadow rounded-lg">
          <LayoutDashboard size={24} />
        </div>
        <div>
          <h1 className="font-headline text-2xl md:text-3xl font-black uppercase tracking-tight leading-none">
            CONSOLE OVERVIEW
          </h1>
          <p className="font-body text-xs text-foreground/60 mt-1">
            System configuration metrics and logs.
          </p>
        </div>
      </section>

      {/* Grid of Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.name}
              className="bg-card-bg border-3 border-border-color rounded-lg p-5 brutal-shadow flex justify-between items-center"
            >
              <div className="space-y-1">
                <span className="font-label text-[10px] font-bold text-foreground/50 uppercase">
                  {card.name}
                </span>
                <h3 className="font-headline text-3xl font-black">{card.count}</h3>
              </div>

              <div className={`p-3 border-2 border-[#1B1C1A] brutal-shadow rounded-lg ${card.color}`}>
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </section>

      {/* Activity Logs & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent logs */}
        <section className="lg:col-span-2 bg-card-bg border-3 border-border-color rounded-lg p-6 brutal-shadow space-y-4">
          <h3 className="font-headline text-lg uppercase font-black tracking-wide border-b-2 border-border-color/10 pb-3 flex items-center gap-2">
            <Activity size={18} className="text-[#ef6540]" /> RECENT LOG ENTRIES
          </h3>

          {activities.length === 0 ? (
            <div className="text-center py-8 font-label text-xs text-foreground/50 uppercase">
              No recent logs found.
            </div>
          ) : (
            <div className="divide-y divide-[#1B1C1A]/10 space-y-3">
              {activities.map((act, index) => (
                <div key={index} className="pt-3 first:pt-0 flex items-center justify-between text-xs font-label">
                  <div className="space-y-0.5">
                    <span className={`px-2 py-0.5 border border-[#1B1C1A] text-[9px] font-bold rounded uppercase ${
                      act.type === "comic" ? "bg-[#fabb59]" : "bg-[#efe1c7]"
                    }`}>
                      {act.type}
                    </span>
                    <span className="font-bold ml-2 text-foreground">{act.title}</span>
                  </div>
                  <span className="text-[10px] text-foreground/40 font-body">
                    {new Date(act.updated_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick Links */}
        <section className="bg-card-bg border-3 border-border-color rounded-lg p-6 brutal-shadow space-y-4">
          <h3 className="font-headline text-lg uppercase font-black tracking-wide border-b-2 border-border-color/10 pb-3">
            QUICK CHANNELS
          </h3>

          <div className="flex flex-col gap-3">
            <Link href="/admin-reserved/comics">
              <span className="flex items-center justify-between px-4 py-3 bg-card-bg hover:bg-[#ffb4a1] hover:text-[#1B1C1A] font-label font-bold text-xs uppercase border-3 border-[#1B1C1A] brutal-shadow brutal-shadow-hover transition-all cursor-pointer">
                <span>MANAGE COMICS</span>
                <ChevronRight size={14} />
              </span>
            </Link>

            <Link href="/admin-reserved/creators">
              <span className="flex items-center justify-between px-4 py-3 bg-card-bg hover:bg-[#efe1c7] hover:text-[#1B1C1A] font-label font-bold text-xs uppercase border-3 border-[#1B1C1A] brutal-shadow brutal-shadow-hover transition-all cursor-pointer">
                <span>MANAGE CREATORS</span>
                <ChevronRight size={14} />
              </span>
            </Link>

            <Link href="/admin-reserved/trending">
              <span className="flex items-center justify-between px-4 py-3 bg-card-bg hover:bg-[#fabb59] hover:text-[#1B1C1A] font-label font-bold text-xs uppercase border-3 border-[#1B1C1A] brutal-shadow brutal-shadow-hover transition-all cursor-pointer">
                <span>ARRANGE TRENDING</span>
                <ChevronRight size={14} />
              </span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
