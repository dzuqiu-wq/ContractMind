"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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

  const handleFile = (selected: File) => {
    if (selected.size > 10 * 1024 * 1024) {
      setError("File size cannot exceed 10MB");
      return;
    }
    
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if (!allowedTypes.includes(selected.type)) {
      setError("Only PDF and DOCX files are supported");
      return;
    }
    
    setFile(selected);
    setError("");
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
        throw new Error(data.error || "Upload failed");
      }
      
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review_id: data.review_id }),
      });
      
      const analyzeData = await analyzeRes.json();
      
      if (analyzeRes.ok) {
        router.push("/report/" + data.review_id);
      } else {
        throw new Error(analyzeData.error || "Analysis failed");
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
      <header className="p-6 bg-white border-b">
        <div className="max-w-4xl mx-auto">
          <a href="/" className="text-primary-600 hover:underline font-medium">
            Back to Home
          </a>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-xl w-full">
          <h1 className="text-3xl font-bold mb-2 text-center text-gray-900">
            Upload Contract
          </h1>
          <p className="text-gray-600 text-center mb-8">
            PDF or DOCX, max 10MB
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
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">
                    {file.type === "application/pdf" ? "PDF" : "DOC"}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="text-red-500 text-sm hover:text-red-600 font-medium"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl">Upload</span>
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    Drag and drop your file here
                  </p>
                  <p className="text-gray-500 mt-1">
                    or click to browse
                  </p>
                </div>
                <div className="flex gap-2 mt-4">
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">PDF</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">DOCX</span>
                </div>
              </div>
            )}
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}
          
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="mt-8 w-full bg-primary-600 text-white text-lg py-4 rounded-xl font-medium hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
          >
            {isUploading ? "Uploading and analyzing..." : "Start Analysis"}
          </button>
          
          <div className="mt-6 text-center text-gray-500 text-sm">
            <p>3 free reviews per day</p>
          </div>
        </div>
      </div>

      <footer className="p-6 text-center text-gray-500 text-sm border-t bg-white">
        <p>This tool provides risk alerts only and does not constitute legal advice.</p>
      </footer>
    </main>
  );
}
