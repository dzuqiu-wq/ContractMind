"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { translations } from "@/lib/i18n";

const t = translations.zh;

export default function ChineseUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsePreview, setParsePreview] = useState<{
    text_length: number;
    word_count: number;
    quality_score: number;
    preview: string;
  } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = async (selected: File) => {
    if (selected.size > 10 * 1024 * 1024) {
      setError(t.upload.errorFileTooBig);
      return;
    }
    
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if (!allowedTypes.includes(selected.type)) {
      setError(t.upload.errorInvalidType);
      return;
    }
    
    setFile(selected);
    setError("");
    setParsePreview(null);
    
    await previewParse(selected);
  };

  const previewParse = async (selected: File) => {
    setIsParsing(true);
    try {
      const formData = new FormData();
      formData.append("file", selected);
      
      const res = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      if (res.ok) {
        setParsePreview(data);
      }
    } catch (err) {
      console.error("Preview parse error:", err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      handleFile(selected);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setError("");
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || t.upload.errorUploadFailed);
      }
      
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review_id: data.review_id }),
      });
      
      const analyzeData = await analyzeRes.json();
      
      if (analyzeRes.ok) {
        router.push("/zh/report/" + data.review_id);
      } else {
        throw new Error(analyzeData.error || t.upload.errorAnalysisFailed);
      }
    } catch (err: any) {
      setError(err.message);
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-xl w-full">
          <Link href="/zh" className="text-primary-600 hover:underline font-medium inline-block mb-6">
            {t.backToHome}
          </Link>
          
          <h1 className="text-3xl font-bold mb-2 text-center text-gray-900">
            {t.upload.title}
          </h1>
          <p className="text-gray-600 text-center mb-8">
            {t.upload.subtitle}
          </p>
          
          <div
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
              dragActive 
                ? "border-primary-500 bg-primary-50" 
                : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={handleFileSelect}
            />
            
            {file ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-3xl">
                  {file.type === "application/pdf" ? "PDF" : "DOC"}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setParsePreview(null);
                  }}
                  className="text-red-500 text-sm hover:text-red-600 font-medium"
                >
                  {t.upload.remove}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl">
                  Upload
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    {t.upload.dragDrop}
                  </p>
                  <p className="text-gray-500 mt-1">
                    {t.upload.orClick}
                  </p>
                </div>
                <div className="flex gap-2 mt-4">
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">PDF</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">DOCX</span>
                </div>
              </div>
            )}
          </div>
          
          {parsePreview && (
            <div className="mt-4 p-4 bg-gray-100 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">{t.parsePreview.title}</span>
                <span className={`px-2 py-0.5 rounded text-sm ${
                  parsePreview.quality_score >= 70 ? "bg-green-100 text-green-700" :
                  parsePreview.quality_score >= 40 ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {t.parsePreview.quality}: {parsePreview.quality_score}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                <span>{t.parsePreview.chars}: {parsePreview.text_length}</span>
                <span>{t.parsePreview.words}: {parsePreview.word_count}</span>
              </div>
              <p className="text-xs text-gray-500 truncate">
                {parsePreview.preview}
              </p>
            </div>
          )}
          
          {isParsing && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl text-center">
              <span className="text-blue-600">{t.upload.parsing}</span>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}
          
          <button
            onClick={handleUpload}
            disabled={!file || isUploading || isParsing}
            className="mt-8 w-full bg-primary-600 text-white text-lg py-4 rounded-xl font-medium hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
          >
            {isUploading ? t.loading.uploading : t.upload.startAnalysis}
          </button>
          
          <div className="mt-6 text-center text-gray-500 text-sm">
            <p>{t.upload.freeReviews}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
