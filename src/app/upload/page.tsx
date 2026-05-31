"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
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
      setError("文件大小不能超过 10MB");
      return;
    }
    
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if (!allowedTypes.includes(selected.type)) {
      setError("只支持 PDF 和 DOCX 文件");
      return;
    }
    
    setFile(selected);
    setError("");
    setParsePreview(null);
    
    // 自动解析预览
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
        throw new Error(data.error || "上传失败");
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
        throw new Error(analyzeData.error || "分析失败");
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
            ← 返回首页
          </a>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-xl w-full">
          <h1 className="text-3xl font-bold mb-2 text-center text-gray-900">
            上传合同
          </h1>
          <p className="text-gray-600 text-center mb-8">
            支持 PDF 或 DOCX 格式，最大 10MB
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
                    {file.type === "application/pdf" ? "??" : "??"}
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
                    setParsePreview(null);
                  }}
                  className="text-red-500 text-sm hover:text-red-600 font-medium"
                >
                  移除
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl">??</span>
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    拖拽文件到此处
                  </p>
                  <p className="text-gray-500 mt-1">
                    或点击选择文件
                  </p>
                </div>
                <div className="flex gap-2 mt-4">
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">PDF</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">DOCX</span>
                </div>
              </div>
            )}
          </div>
          
          {/* 解析预览 */}
          {parsePreview && (
            <div className="mt-4 p-4 bg-gray-100 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">解析预览</span>
                <span className={`px-2 py-0.5 rounded text-sm ${
                  parsePreview.quality_score >= 70 ? "bg-green-100 text-green-700" :
                  parsePreview.quality_score >= 40 ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  质量: {parsePreview.quality_score}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                <span>字符数: {parsePreview.text_length}</span>
                <span>词数: {parsePreview.word_count}</span>
              </div>
              <p className="text-xs text-gray-500 truncate">
                {parsePreview.preview}
              </p>
            </div>
          )}
          
          {isParsing && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl text-center">
              <span className="text-blue-600">正在解析文件...</span>
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
            {isUploading ? "上传并分析中..." : "开始分析"}
          </button>
          
          <div className="mt-6 text-center text-gray-500 text-sm">
            <p>每天免费 3 次审查</p>
          </div>
        </div>
      </div>

      <footer className="p-6 text-center text-gray-500 text-sm border-t bg-white">
        <p>?? 本工具仅提供风险提示，不构成法律意见。</p>
      </footer>
    </main>
  );
}
