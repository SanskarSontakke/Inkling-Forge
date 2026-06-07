"use client";

import React, { useState, useRef } from "react";
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";

interface PdfUploaderProps {
  episodeId: string;
  onUploadSuccess: (pages: any[]) => void;
}

export default function PdfUploader({ episodeId, onUploadSuccess }: PdfUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [progress, setProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleUpload = () => {
    if (!file) return;

    setStatus("uploading");
    setProgress(0);
    setErrorMessage("");

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/admin/episodes/${episodeId}/upload-pdf`, true);

    // Track upload progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setProgress(percentComplete);
        if (percentComplete === 100) {
          setStatus("processing"); // Complete upload, now backend processes image conversion
        }
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.success) {
            setStatus("success");
            onUploadSuccess(response.pages || []);
          } else {
            setErrorMessage(response.error || "Parsing failed");
            setStatus("error");
          }
        } catch (err) {
          setErrorMessage("Failed to parse server response.");
          setStatus("error");
        }
      } else {
        try {
          const response = JSON.parse(xhr.responseText);
          setErrorMessage(response.error || "Upload failed");
        } catch {
          setErrorMessage(`Server responded with code ${xhr.status}`);
        }
        setStatus("error");
      }
    };

    xhr.onerror = () => {
      setErrorMessage("Network error during file transmission.");
      setStatus("error");
    };

    xhr.send(formData);
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
            Upload a comic book PDF up to 100MB. The pipeline will parse pages and convert them to optimized WebPs.
          </p>
          <button
            onClick={triggerFileSelect}
            className="font-label font-bold text-xs uppercase px-4 py-2 border-3 border-[#1B1C1A] bg-[#ffb4a1] hover:bg-[#ef6540] hover:text-white brutal-shadow brutal-shadow-hover transition-all cursor-pointer"
          >
            CHOOSE FILE
          </button>
        </div>
      )}

      {file && (status === "idle" || status === "uploading" || status === "processing") && (
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
                className="font-label font-bold text-xs uppercase px-6 py-2 border-3 border-[#1B1C1A] bg-[#ef6540] text-white brutal-shadow brutal-shadow-hover transition-all cursor-pointer"
              >
                START UPLOAD
              </button>
            </div>
          )}

          {status === "uploading" && (
            <div className="space-y-2 max-w-xs mx-auto">
              <div className="flex justify-between font-label text-[10px] font-bold">
                <span>UPLOADING DOSSIER...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-[#1B1C1A]/10 border-2 border-[#1B1C1A] h-4 rounded-full overflow-hidden relative">
                <div 
                  className="bg-[#fabb59] h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {status === "processing" && (
            <div className="space-y-3 max-w-xs mx-auto">
              <div className="font-label text-xs font-bold text-[#ef6540] animate-pulse">
                PROCESSING PDF... EXTRACTING COMIC PANELS
              </div>
              <div className="w-full bg-[#1B1C1A]/10 border-2 border-[#1B1C1A] h-4 rounded-full overflow-hidden relative">
                <div className="bg-[#ef6540] h-full w-full animate-progress-stripes" style={{ backgroundImage: "linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)", backgroundSize: "1rem 1rem" }} />
              </div>
              <p className="font-body text-[10px] text-foreground/60 leading-tight">
                Converting panels to high-res WebPs (85% quality, 2K max-width). This may take up to a minute for larger PDFs. Please do not close this window.
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
            The PDF was parsed successfully. Pages are stored and ready.
          </p>
          <button
            onClick={() => {
              setStatus("idle");
              setFile(null);
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
