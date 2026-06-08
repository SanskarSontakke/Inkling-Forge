"use client";

import React, { useState, useEffect, useRef } from "react";
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";

interface PdfUploaderProps {
  episodeId: string;
  onUploadSuccess: (pages: any[]) => void;
}

// Utility to load a script dynamically from CDN
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return resolve();
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

export default function PdfUploader({ episodeId, onUploadSuccess }: PdfUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isPdfLibLoaded, setIsPdfLibLoaded] = useState<boolean>(false);
  const [pdfLibError, setPdfLibError] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load PDF.js script and its worker on mount
  useEffect(() => {
    const initPdfJs = async () => {
      try {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");
        const pdfjsLib = (window as any).pdfjsLib;
        if (pdfjsLib) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          setIsPdfLibLoaded(true);
        } else {
          throw new Error("pdfjsLib not found on window");
        }
      } catch (err) {
        console.error("Failed to load PDF.js from CDN:", err);
        setPdfLibError(true);
      }
    };
    initPdfJs();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf" && !selectedFile.name.toLowerCase().endsWith(".pdf")) {
        setErrorMessage("Please select a valid PDF file.");
        setStatus("error");
        return;
      }
      if (selectedFile.size > 100 * 1024 * 1024) {
        setErrorMessage("File exceeds 100MB limit.");
        setStatus("error");
        return;
      }
      setFile(selectedFile);
      setStatus("idle");
      setErrorMessage("");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus("processing");
    setProgress(0);
    setErrorMessage("");

    try {
      const pdfjsLib = (window as any).pdfjsLib;
      if (!pdfjsLib) {
        throw new Error("PDF rendering engine is not loaded yet. Please wait a moment and try again.");
      }

      setStatusMessage("Reading PDF file...");
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;

      if (numPages === 0) {
        throw new Error("The selected PDF file contains no pages.");
      }

      const uploadedPages: any[] = [];

      for (let i = 1; i <= numPages; i++) {
        const percent = Math.round(((i - 1) / numPages) * 100);
        setProgress(percent);
        setStatusMessage(`Extracting page ${i} of ${numPages}...`);

        // Load specific PDF page
        const page = await pdf.getPage(i);
        const originalViewport = page.getViewport({ scale: 1.0 });

        // Calculate scale to fit in a 2000px box max
        const maxDim = Math.max(originalViewport.width, originalViewport.height);
        const scale = maxDim > 2000 ? 2000 / maxDim : 1.5;
        const viewport = page.getViewport({ scale });

        // Create Canvas element
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Could not create 2D canvas context.");
        }

        // Render PDF page to canvas
        await page.render({ canvasContext: context, viewport }).promise;

        // Compress canvas output to WebP Blob (85% quality)
        setStatusMessage(`Compressing page ${i} of ${numPages}...`);
        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), "image/webp", 0.85);
        });

        if (!blob) {
          throw new Error(`Failed to compress page ${i} to WebP.`);
        }

        // Upload page blob to the backend endpoint
        setStatusMessage(`Uploading page ${i} of ${numPages}...`);
        const pageFormData = new FormData();
        pageFormData.append("file", blob, `page-${i}.webp`);
        pageFormData.append("pageNumber", String(i));
        pageFormData.append("isFirstPage", String(i === 1));
        pageFormData.append("width", String(canvas.width));
        pageFormData.append("height", String(canvas.height));

        const res = await fetch(`/api/admin/episodes/${episodeId}/upload-page`, {
          method: "POST",
          body: pageFormData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Server responded with code ${res.status} on page ${i}`);
        }

        const data = await res.json();
        uploadedPages.push(data.page);
      }

      setProgress(100);
      setStatus("success");
      onUploadSuccess(uploadedPages);
    } catch (err: any) {
      console.error("Client-side PDF upload failed:", err);
      setErrorMessage(err.message || "Failed to process PDF file.");
      setStatus("error");
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="border-3 border-dashed border-border-color bg-card-bg p-6 brutal-shadow rounded-lg text-center space-y-4 text-foreground">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf"
        className="hidden"
      />

      {status === "idle" && !file && (
        <div className="space-y-3">
          <div className="inline-flex p-3 bg-[#fabb59] border-2 border-[#1B1C1A] brutal-shadow rounded-full">
            <Upload size={24} className="text-[#1B1C1A]" />
          </div>
          <h4 className="font-headline text-base uppercase font-bold">SELECT PDF DOSSIER</h4>
          <p className="font-body text-xs text-foreground/60 max-w-sm mx-auto">
            Upload a comic book PDF up to 100MB. Pages are parsed in-browser and uploaded securely.
          </p>
          <button
            onClick={triggerFileSelect}
            disabled={pdfLibError}
            className="font-label font-bold text-xs uppercase px-4 py-2 border-3 border-[#1B1C1A] bg-[#ffb4a1] hover:bg-[#ef6540] hover:text-white brutal-shadow brutal-shadow-hover transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pdfLibError ? "ENGINE ERROR" : "CHOOSE FILE"}
          </button>
          {pdfLibError && (
            <p className="text-rose-600 text-[10px] font-bold">
              Failed to load PDF engine. Check internet connection.
            </p>
          )}
        </div>
      )}

      {file && (status === "idle" || status === "processing") && (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 font-label text-xs font-bold uppercase">
            <FileText size={16} className="text-[#ef6540]" />
            <span>{file.name}</span>
            <span className="text-foreground/50">({Math.round((file.size / (1024 * 1024)) * 100) / 100} MB)</span>
          </div>

          {status === "idle" && (
            <div className="flex justify-center gap-2">
              <button
                onClick={triggerFileSelect}
                className="font-label font-bold text-xs uppercase px-4 py-2 border-2 border-border-color bg-card-bg text-foreground hover:bg-[#ffb4a1] brutal-shadow brutal-shadow-hover transition-all cursor-pointer"
              >
                CHANGE FILE
              </button>
              <button
                onClick={handleUpload}
                disabled={!isPdfLibLoaded}
                className="font-label font-bold text-xs uppercase px-6 py-2 border-3 border-[#1B1C1A] bg-[#ef6540] text-white brutal-shadow brutal-shadow-hover transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPdfLibLoaded ? "START EXTRACTION" : "LOADING ENGINE..."}
              </button>
            </div>
          )}

          {status === "processing" && (
            <div className="space-y-3 max-w-xs mx-auto">
              <div className="font-label text-xs font-bold text-[#ef6540] animate-pulse">
                {statusMessage.toUpperCase() || "EXTRACTING COMIC PANELS..."}
              </div>
              <div className="w-full bg-[#1B1C1A]/10 border-2 border-[#1B1C1A] h-4 rounded-full overflow-hidden relative">
                <div 
                  className="bg-[#ef6540] h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="font-body text-[10px] text-foreground/60 leading-tight">
                Converting pages to WebPs directly in the browser and uploading them. This bypasses Vercel payload limits and server-side timeouts. Please keep this window active.
              </p>
            </div>
          )}
        </div>
      )}

      {status === "success" && (
        <div className="space-y-3">
          <div className="inline-flex p-3 bg-emerald-100 border-2 border-emerald-600 rounded-full">
            <CheckCircle2 size={24} className="text-emerald-600" />
          </div>
          <h4 className="font-headline text-base uppercase font-bold text-emerald-600">TRANSMISSION COMPLETION</h4>
          <p className="font-body text-xs text-foreground/70">
            The PDF was parsed successfully in your browser and all pages uploaded.
          </p>
          <button
            onClick={() => {
              setStatus("idle");
              setFile(null);
              setStatusMessage("");
            }}
            className="font-label font-bold text-xs uppercase px-4 py-2 border-3 border-[#1B1C1A] bg-[#fabb59] brutal-shadow brutal-shadow-hover transition-all cursor-pointer"
          >
            UPLOAD ANOTHER PDF
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-3">
          <div className="inline-flex p-3 bg-rose-100 border-2 border-rose-600 rounded-full">
            <AlertCircle size={24} className="text-rose-600" />
          </div>
          <h4 className="font-headline text-base uppercase font-bold text-rose-600">TRANSMISSION ERROR</h4>
          <p className="font-body text-xs text-rose-600/80 max-w-sm mx-auto">
            {errorMessage}
          </p>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => {
                setStatus("idle");
                setFile(null);
                setErrorMessage("");
                setStatusMessage("");
              }}
              className="font-label font-bold text-xs uppercase px-4 py-2 border-2 border-border-color bg-card-bg brutal-shadow brutal-shadow-hover transition-all cursor-pointer"
            >
              RESET
            </button>
            {file && (
              <button
                onClick={handleUpload}
                className="font-label font-bold text-xs uppercase px-4 py-2 border-3 border-[#1B1C1A] bg-[#ef6540] text-white brutal-shadow brutal-shadow-hover transition-all cursor-pointer"
              >
                TRY AGAIN
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
