"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-6 flex justify-between items-center max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-primary-600">ContractMind</h1>
        <nav className="flex gap-6">
          <span className="text-gray-600">AI Contract Risk Review</span>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="text-center max-w-3xl">
          <h2 className="text-5xl font-bold mb-6 leading-tight">
            3 Minutes to Review Contract Risks
          </h2>
          <h3 className="text-3xl font-bold mb-6 text-gray-600">
            3分钟，看懂合同风险
          </h3>
          <p className="text-xl text-gray-600 mb-10">
            Upload your contract and get AI-powered risk analysis in minutes
          </p>
          <p className="text-lg text-gray-500 mb-10">
            上传您的合同，AI智能分析，输出结构化风险报告
          </p>
          
          <Link
            href="/upload"
            className="inline-block bg-primary-600 text-white text-lg px-8 py-4 rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-lg"
          >
            Upload Contract / 上传合同
          </Link>
          
          <p className="mt-4 text-sm text-gray-500">
            Supports PDF, DOCX / Max 10MB / 3 Free Reviews Daily
          </p>
          <p className="mt-1 text-sm text-gray-400">
            支持 PDF、DOCX / 最大 10MB / 每天 3 次免费审查
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl w-full">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-4xl mb-4">Clause Analysis</div>
            <h3 className="text-xl font-semibold mb-2">条款分析</h3>
            <p className="text-gray-600">
              Identify risks clause by clause. Not just counts, but what each clause means.
            </p>
            <p className="text-gray-500 text-sm mt-1">
              逐条识别风险，不只给数量，更指出具体条款问题
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-4xl mb-4">Easy to Understand</div>
            <h3 className="text-xl font-semibold mb-2">通俗易懂</h3>
            <p className="text-gray-600">
              Translate legal language into plain terms anyone can understand.
            </p>
            <p className="text-gray-500 text-sm mt-1">
              将法律术语翻译成普通人能理解的语言
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-4xl mb-4">Shareable Report</div>
            <h3 className="text-xl font-semibold mb-2">报告可分享</h3>
            <p className="text-gray-600">
              Generate reports to share with colleagues or lawyers for review.
            </p>
            <p className="text-gray-500 text-sm mt-1">
              生成报告，一键分享给同事或律师查阅
            </p>
          </div>
        </div>

        {/* Supported Types */}
        <div className="mt-16">
          <p className="text-gray-500 mb-4">Supported Contract Types / 支持合同类型</p>
          <div className="flex gap-4">
            <span className="px-4 py-2 bg-gray-100 rounded-full">Labor Contract / 劳动合同</span>
            <span className="px-4 py-2 bg-gray-100 rounded-full">Service Contract / 服务合同</span>
            <span className="px-4 py-2 bg-gray-100 rounded-full">NDA / 保密协议</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="p-6 text-center text-gray-500 text-sm border-t">
        <p>This tool provides risk alerts only and does not constitute legal advice.</p>
        <p className="mt-1">本工具仅提供风险提示，不构成法律意见。如有疑问请咨询专业律师。</p>
      </footer>
    </main>
  );
}
