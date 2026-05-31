"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 10 * 1024 * 1024) {
        setError("文件大小不能超过 10MB");
        return;
      }
      setFile(selected);
      setError("");
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
      
      // 触发分析
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

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-6">
        <a href="/" className="text-primary-600 hover:underline">
          ← 返回首页
        </a>
      </header>

      {/* Upload Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="max-w-xl w-full">
          <h1 className="text-3xl font-bold mb-2 text-center">上传合同文件</h1>
          <p className="text-gray-600 text-center mb-8">
            支持 PDF、DOCX (最大 10MB)
          </p>
          
          {/* 上传区域 */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary-500 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={handleFileSelect}
            />
            
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">📄</span>
                <span className="font-medium">{file.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="text-red-500 text-sm"
                >
                  移除
                </button>
              </div>
            ) : (
              <>
                <div className="text-5xl mb-4">📁</div>
                <p className="text-gray-600">
                  点击选择文件或拖拽到此处
                </p>
              </>
            )}
          </div>
          
          {error && (
            <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
          )}
          
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="mt-6 w-full bg-primary-600 text-white text-lg py-3 rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? "上传并分析中..." : "开始分析"}
          </button>
          
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>每日免费 3 次 · 今日剩余 2 次</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-6 text-center text-gray-500 text-sm border-t">
        <p>⚠️ 本工具仅提供风险提示，不构成法律意见。如有疑问请咨询专业律师。</p>
      </footer>
    </main>
  );
}
