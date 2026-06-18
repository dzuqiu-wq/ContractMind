"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Issue {
  title: string;
  severity: "High" | "Medium" | "Low";
  explanation: string;
  recommendation: string;
  clause: string;
}

interface ReportData {
  contract_type: string;
  overall_score: number;
  risk_level: string;
  summary: {
    high_risk_count: number;
    medium_risk_count: number;
    low_risk_count: number;
  };
  issues: Issue[];
  metadata?: {
    pages?: number;
    word_count: number;
    quality_score: number;
  };
}

interface Review {
  id: string;
  file_name: string;
  status: string;
  overall_score: number | null;
  contractType: string | null;
  reportData: ReportData | null;
  createdAt: string;
}

export default function ReportPage() {
  const params = useParams();
  const [report, setReport] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pollingCount, setPollingCount] = useState(0);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/report/${params.id}`);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "获取报告失败");
        }
        
        setReport(data);
        
        if (data.status === "completed") {
          setLoading(false);
        } else if (data.status === "processing") {
          setPollingCount(p => p + 1);
          if (pollingCount < 30) {
            setTimeout(fetchReport, 2000);
          } else {
            throw new Error("分析超时，请稍后重试");
          }
        } else {
          setLoading(false);
        }
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    if (params.id) {
      fetchReport();
    }
  }, [params.id, pollingCount]);

  const severityConfig: Record<string, { bg: string; text: string; label: string }> = {
    High: { bg: "bg-red-100", text: "text-red-700", label: "高风险" },
    Medium: { bg: "bg-yellow-100", text: "text-yellow-700", label: "中风险" },
    Low: { bg: "bg-green-100", text: "text-green-700", label: "低风险" },
  };

  const riskLevelConfig: Record<string, { color: string; icon: string; bg: string }> = {
    "高": { color: "text-red-600", icon: "🔴", bg: "bg-red-50" },
    "中": { color: "text-yellow-600", icon: "🟡", bg: "bg-yellow-50" },
    "低": { color: "text-green-600", icon: "🟢", bg: "bg-green-50" },
  };

  const reportData = report?.reportData || ({} as ReportData);
  const issues = reportData.issues || [];
  const riskLevel = reportData.risk_level || "低";
  const config = riskLevelConfig[riskLevel] || riskLevelConfig["低"];

  const getRiskGaugeWidth = (score: number) => {
    return Math.min(100, Math.max(0, score));
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">正在分析合同，请稍候...</p>
          <p className="text-gray-400 text-sm mt-2">预计需要 10-30 秒</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">分析失败</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <a href="/" className="text-primary-600 hover:underline font-medium">
            ← 返回首页重新上传
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">合同分析报告</h1>
          <a href="/upload" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
            上传新合同
          </a>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="relative w-40 h-40">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                  <circle
                    cx="80" cy="80" r="70"
                    stroke={riskLevel === "高" ? "#ef4444" : riskLevel === "中" ? "#f59e0b" : "#22c55e"}
                    strokeWidth="12" fill="none"
                    strokeDasharray={`${getRiskGaugeWidth(reportData.overall_score || 0) * 4.4} 440`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl">{config.icon}</span>
                  <span className="text-4xl font-bold text-gray-900">{reportData.overall_score || 0}</span>
                  <span className="text-sm text-gray-500">风险评分</span>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">风险等级：{reportData.contract_type || "未知合同"}</h2>
                <p className={`text-2xl font-bold ${config.color}`}>{riskLevel}风险</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className={`${config.bg} rounded-xl p-4 text-center`}>
                  <div className={`text-3xl font-bold ${config.color}`}>{reportData.summary?.high_risk_count || 0}</div>
                  <div className="text-sm text-gray-600">高风险项</div>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-yellow-600">{reportData.summary?.medium_risk_count || 0}</div>
                  <div className="text-sm text-gray-600">中风险项</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">{reportData.summary?.low_risk_count || 0}</div>
                  <div className="text-sm text-gray-600">低风险项</div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-500">
                <span>{report?.file_name}</span>
                {reportData.metadata?.pages && <span>{reportData.metadata.pages} 页</span>}
                {reportData.metadata?.word_count && <span>{reportData.metadata.word_count} 字</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>免责声明：</strong> 本分析仅提供风险提示参考，不构成法律意见。
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold mb-6">风险详情 ({issues.length} 项)</h2>
          
          {issues.length > 0 ? (
            <div className="space-y-4">
              {issues.map((issue, idx) => {
                const sev = severityConfig[issue.severity] || severityConfig.Low;
                return (
                  <div key={idx} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">{issue.title}</h3>
                        <p className="text-gray-500 text-sm mt-1">相关条款：{issue.clause}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${sev.bg} ${sev.text}`}>{sev.label}</span>
                    </div>
                    <div className="mt-4 space-y-3">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">问题说明</span>
                        <p className="text-sm text-gray-600 mt-1">{issue.explanation}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <span className="text-sm font-medium text-green-700">修改建议</span>
                        <p className="text-sm text-green-800 mt-1">{issue.recommendation}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-5xl mb-4">无明显风险</div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">未发现明显风险</h3>
              <p className="text-gray-400">恭喜！此合同未发现明显的风险条款</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <a href="/upload" className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition text-center">
            <h3 className="font-semibold text-gray-900">上传新合同</h3>
            <p className="text-sm text-gray-500 mt-1">继续分析其他合同</p>
          </a>
          <a href="/" className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition text-center">
            <h3 className="font-semibold text-gray-900">返回首页</h3>
            <p className="text-sm text-gray-500 mt-1">了解更多关于 ContractMind</p>
          </a>
        </div>

        <footer className="p-6 text-center text-gray-500 text-sm mt-6">
          <p>ContractMind 仅提供风险提示，不构成法律意见。如有法律问题，请咨询专业律师。</p>
        </footer>
      </div>
    </main>
  );
}
