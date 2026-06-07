"use client";

import React, { useState, useEffect } from "react";
import { Image as ImageIcon, GripVertical, X, ChevronLeft, ChevronRight } from "lucide-react";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Page {
  id: string;
  page_number: number;
  original_page_number: number;
  image_path: string;
  width?: number;
  height?: number;
  file_size?: number;
}

interface PageGalleryProps {
  pages: Page[];
  episodeId: string;
  onOrderChanged?: () => void;
}

// ----------------------------------------------------
// Sortable Card Item Component
// ----------------------------------------------------
interface SortablePageCardProps {
  page: Page;
  idx: number;
  onPreview: () => void;
}

function SortablePageCard({ page, idx, onPreview }: SortablePageCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onPreview}
      className={`border-3 border-border-color bg-card-bg brutal-shadow rounded-lg overflow-hidden flex flex-col justify-between group transition-all duration-200 cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-20 scale-95 border-dashed z-10" : ""
      } hover:-translate-y-0.5`}
    >
      {/* Drag Handle & Page Indicator */}
      <div className="flex items-center justify-between bg-surface-container-low border-b-2 border-border-color px-2 py-1 select-none pointer-events-none">
        <div className="flex items-center gap-1 text-foreground/60">
          <GripVertical size={14} />
          <span className="font-label font-bold text-[10px] uppercase">
            P. {page.page_number}
          </span>
        </div>
        {page.page_number !== page.original_page_number && (
          <span className="bg-[#ab3513] text-white text-[8px] font-bold px-1 py-0.5 border border-[#1B1C1A] rounded">
            MOVED
          </span>
        )}
      </div>

      {/* Thumbnail Container */}
      <div className="relative aspect-[3/4] w-full bg-neutral-800 border-b-2 border-border-color overflow-hidden flex items-center justify-center pointer-events-none">
        {page.image_path ? (
          <img
            src={page.image_path}
            alt={`Page ${page.page_number}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none"
            loading="lazy"
          />
        ) : (
          <ImageIcon size={24} className="text-foreground/40" />
        )}
      </div>

      {/* Page Metadata */}
      <div className="p-2 text-foreground space-y-0.5 text-[9px] font-label font-bold uppercase select-none pointer-events-none">
        {page.width && page.height ? (
          <div className="text-foreground/70">
            RES: {page.width}x{page.height}
          </div>
        ) : null}
        {page.file_size ? (
          <div className="text-foreground/50">
            SIZE: {formatBytes(page.file_size)}
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Main Page Gallery Component
// ----------------------------------------------------
export default function PageGallery({ pages, episodeId, onOrderChanged }: PageGalleryProps) {
  const [localPages, setLocalPages] = useState<Page[]>(pages);
  const [resetting, setResetting] = useState(false);
  const [activePreviewIndex, setActivePreviewIndex] = useState<number | null>(null);

  // Set up dnd-kit sensors with distance constraint to differentiate clicks from drags
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requires 8px movement to begin drag, allowing clicks for zoom modal
      },
    })
  );

  useEffect(() => {
    setLocalPages(pages);
  }, [pages]);

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localPages.findIndex((p) => p.id === active.id);
    const newIndex = localPages.findIndex((p) => p.id === over.id);

    const updatedPagesList = arrayMove(localPages, oldIndex, newIndex);

    // Re-number pages sequentially
    const reorderedPages = updatedPagesList.map((p, idx) => ({
      ...p,
      page_number: idx + 1,
    }));

    setLocalPages(reorderedPages);

    // Save to backend
    try {
      const response = await fetch(`/api/admin/episodes/${episodeId}/reorder-pages`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageIds: reorderedPages.map((p) => p.id) }),
      });

      if (!response.ok) {
        throw new Error("Failed to save reorder");
      }

      if (onOrderChanged) {
        onOrderChanged();
      }
    } catch (error) {
      console.error("Error reordering pages:", error);
      // Revert to original pages
      setLocalPages(pages);
    }
  };

  // Reset Order
  const handleResetOrder = async () => {
    setResetting(true);
    try {
      const response = await fetch(`/api/admin/episodes/${episodeId}/reset-pages-order`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to reset order");
      }

      if (onOrderChanged) {
        onOrderChanged();
      }
    } catch (error) {
      console.error("Error resetting pages order:", error);
    } finally {
      setResetting(false);
    }
  };

  // Keyboard navigation for preview modal
  useEffect(() => {
    if (activePreviewIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActivePreviewIndex(null);
      } else if (e.key === "ArrowLeft" && activePreviewIndex > 0) {
        setActivePreviewIndex(activePreviewIndex - 1);
      } else if (e.key === "ArrowRight" && activePreviewIndex < localPages.length - 1) {
        setActivePreviewIndex(activePreviewIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePreviewIndex, localPages.length]);

  if (localPages.length === 0) {
    return (
      <div className="border-3 border-border-color bg-card-bg p-8 text-center rounded-lg text-foreground/50 font-label font-bold text-sm uppercase">
        No pages extracted yet. Upload a PDF to populate chapters.
      </div>
    );
  }

  const isOrderChanged = localPages.some((p) => p.page_number !== p.original_page_number);

  return (
    <div className="space-y-4">
      {/* Reorder and Reset Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card-bg border-3 border-border-color p-4 brutal-shadow rounded-lg gap-4">
        <div>
          <h3 className="font-label font-black text-xs uppercase text-foreground/80">
            {isOrderChanged ? "⚠️ PAGES REARRANGED" : "✅ ORIGINAL PDF SEQUENCE"}
          </h3>
          <p className="font-label text-[10px] text-foreground/50 uppercase mt-0.5">
            DRAG ANY CARD TO REORDER PAGES. CLICK CARD TO ZOOM.
          </p>
        </div>
        <button
          onClick={handleResetOrder}
          disabled={!isOrderChanged || resetting}
          className="flex items-center gap-1.5 px-4 py-2 border-3 border-border-color bg-[#ffb4a1] hover:bg-[#ab3513] text-[#1B1C1A] hover:text-white font-label font-bold text-xs uppercase brutal-shadow brutal-shadow-hover transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#ffb4a1] disabled:hover:text-[#1B1C1A] disabled:brutal-shadow"
        >
          {resetting ? "RESETTING..." : "RESET ORDER"}
        </button>
      </div>

      {/* Pages Grid using dnd-kit Sortable */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={localPages.map((p) => p.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {localPages.map((page, idx) => (
              <SortablePageCard
                key={page.id}
                page={page}
                idx={idx}
                onPreview={() => setActivePreviewIndex(idx)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Page Zoom Preview Modal */}
      {activePreviewIndex !== null && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col items-center justify-center">
            {/* Close Button */}
            <button
              onClick={() => setActivePreviewIndex(null)}
              className="absolute -top-12 right-0 bg-[#ef6540] border-2 border-black p-2 text-white hover:bg-white hover:text-black rounded-lg brutal-shadow transition-all cursor-pointer"
              title="Close (Esc)"
            >
              <X size={20} />
            </button>

            {/* Previous Button */}
            <button
              onClick={() => activePreviewIndex > 0 && setActivePreviewIndex(activePreviewIndex - 1)}
              disabled={activePreviewIndex === 0}
              className="absolute left-2 md:-left-16 top-1/2 -translate-y-1/2 bg-[#fabb59] border-2 border-black p-3 text-black hover:bg-white rounded-lg brutal-shadow disabled:opacity-30 disabled:cursor-not-allowed transition-all z-10 cursor-pointer"
              title="Previous (Left Arrow)"
            >
              <ChevronLeft size={24} />
            </button>

            {/* Next Button */}
            <button
              onClick={() =>
                activePreviewIndex < localPages.length - 1 &&
                setActivePreviewIndex(activePreviewIndex + 1)
              }
              disabled={activePreviewIndex === localPages.length - 1}
              className="absolute right-2 md:-right-16 top-1/2 -translate-y-1/2 bg-[#fabb59] border-2 border-black p-3 text-black hover:bg-white rounded-lg brutal-shadow disabled:opacity-30 disabled:cursor-not-allowed transition-all z-10 cursor-pointer"
              title="Next (Right Arrow)"
            >
              <ChevronRight size={24} />
            </button>

            {/* Page Rendering */}
            <div className="border-4 border-white bg-neutral-900 brutal-shadow max-w-full max-h-[70vh] overflow-hidden flex items-center justify-center rounded-lg">
              <img
                src={localPages[activePreviewIndex].image_path}
                alt={`Page ${localPages[activePreviewIndex].page_number}`}
                className="max-w-full max-h-[70vh] object-contain select-none"
                draggable={false}
              />
            </div>

            {/* Caption & Status Bar */}
            <div className="mt-4 bg-[#fbecd2] border-2 border-black px-4 py-1.5 brutal-shadow font-label font-bold text-xs uppercase text-black flex items-center gap-2 select-none">
              <span>PAGE {localPages[activePreviewIndex].page_number} OF {localPages.length}</span>
              {localPages[activePreviewIndex].page_number !==
                localPages[activePreviewIndex].original_page_number && (
                <span className="bg-[#ab3513] text-white text-[9px] px-1.5 py-0.5 rounded border border-black">
                  ORIGINALLY PAGE {localPages[activePreviewIndex].original_page_number}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
