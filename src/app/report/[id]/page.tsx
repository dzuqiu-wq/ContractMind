"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ReportPage() {
  const params = useParams();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          // 继续轮询
          setTimeout(fetchReport, 2000);
        }
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    if (params.id) {
      fetchReport();
    }
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">⏳</div>
          <p className="text-gray-600">正在分析合同，请稍候...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-red-500">{error}</p>
          <a href="/" className="text-primary-600 hover:underline mt-4 inline-block">
            返回首页
          </a>
        </div>
      </main>
    );
  }

  const severityColor: Record<string, string> = {
    High: "bg-red-100 text-red-700 border border-red-200",
    Medium: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    Low: "bg-green-100 text-green-700 border border-green-200",
  };

  const riskColor: Record<string, string> = {
    "高": "text-red-600",
    "中": "text-yellow-600",
    "低": "text-green-600",
  };

  const reportData = report?.report_data || {};
  const issues = reportData.issues || [];

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold">合同分析报告</h1>
              <p className="text-gray-500">{report?.file_name}</p>
            </div>
            <a href="/" className="text-primary-600 hover:underline">
              新分析
            </a>
          </div>
          
          {/* Risk Score */}
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-6xl font-bold text-primary-600">
                {report?.overall_score || 0}
              </div>
              <div className="text-gray-500">风险评分</div>
            </div>
            
            <div className="flex-1">
              <div className="text-lg font-medium mb-2">
                风险等级： 
                <span className={`font-bold ${riskColor[report?.risk_level || "低"]}`}>
                  {report?.risk_level || "低"}
                </span>
              </div>
              
              <div className="flex gap-6 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {reportData.summary?.high_risk_count || 0}
                  </div>
                  <div className="text-sm text-gray-500">高风险</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {reportData.summary?.medium_risk_count || 0}
                  </div>
                  <div className="text-sm text-gray-500">中风险</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {reportData.summary?.low_risk_count || 0}
                  </div>
                  <div className="text-sm text-gray-500">低风险</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Disclaimer */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>免责声明：</strong> 本分析仅供风险提示参考，不构成法律意见。
            如有疑问请咨询专业律师。
          </p>
        </div>
        
        {/* Issues */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-bold mb-6">
            风险详情 ({issues.length} 项)
          </h2>
          
          {issues.length > 0 ? (
            <div className="space-y-4">
              {issues.map((issue: any, idx: number) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg">{issue.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${severityColor[issue.severity]}`}>
                      {issue.severity === "High" ? "高风险" : issue.severity === "Medium" ? "中风险" : "低风险"}
                    </span>
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">问题说明：</span>
                      <p className="text-sm text-gray-700 mt-1">{issue.explanation}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <span className="text-sm font-medium text-green-700">💡 建议：</span>
                      <p className="text-sm text-green-800 mt-1">{issue.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">✅</div>
              <p>未发现明显风险条款</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <footer className="p-6 text-center text-gray-500 text-sm">
          <p>⚠️ 本工具仅提供风险提示，不构成法律意见。如有疑问请咨询专业律师。</p>
        </footer>
      </div>
    </main>
  );
}
