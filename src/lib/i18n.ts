export const translations = {
  en: {
    backToHome: "Back to Home",
    
    homepage: {
      title: "3 Minutes to Review Contract Risks",
      subtitle: "Upload your contract and get AI-powered risk analysis in minutes",
      uploadButton: "Upload Contract",
      viewSample: "View Sample Report",
      supportInfo: "Supports PDF, DOCX / Max 10MB / 3 Free Reviews Daily",
      feature1Title: "Clause Analysis",
      feature1Desc: "Identify risks clause by clause. Not just counts, but what each clause means.",
      feature2Title: "Easy to Understand",
      feature2Desc: "Translate legal language into plain terms anyone can understand.",
      feature3Title: "Shareable Report",
      feature3Desc: "Generate reports to share with colleagues or lawyers for review.",
      contractTypes: "Supported Contract Types",
      laborContract: "Labor Contract",
      serviceContract: "Service Contract",
      nda: "NDA / Confidentiality",
      footer: "This tool provides risk alerts only and does not constitute legal advice.",
    },
    
    upload: {
      title: "Upload Contract",
      subtitle: "PDF or DOCX, max 10MB",
      dragDrop: "Drag and drop your file here",
      orClick: "or click to browse",
      remove: "Remove",
      startAnalysis: "Start Analysis",
      parsing: "Parsing file...",
      freeReviews: "3 free reviews per day",
      errorFileTooBig: "File size cannot exceed 10MB",
      errorInvalidType: "Only PDF and DOCX files are supported",
      errorUploadFailed: "Upload failed",
      errorAnalysisFailed: "Analysis failed",
    },
    
    parsePreview: {
      title: "Parse Preview",
      quality: "Quality",
      chars: "Characters",
      words: "Words",
    },
    
    report: {
      title: "Risk Analysis Report",
      uploadNew: "Upload New Contract",
      riskScore: "Risk Score",
      riskLevel: "Risk Level",
      highRisk: "High Risk",
      mediumRisk: "Medium Risk",
      lowRisk: "Low Risk",
      highRiskCount: "High Risk Items",
      mediumRiskCount: "Medium Risk Items",
      lowRiskCount: "Low Risk Items",
      riskDetails: "Risk Details",
      clause: "Clause",
      problem: "Problem",
      recommendation: "Recommendation",
      noRiskFound: "No Significant Risks Found",
      congrats: "Congratulations! No obvious risk clauses detected.",
      disclaimer: "This analysis is for reference only and does not constitute legal advice. Please consult a professional lawyer for any questions.",
    },
    
    loading: {
      analyzing: "Analyzing Contract",
      pleaseWait: "Please wait...",
      estimatedTime: "Estimated time: 10-30 seconds",
      uploading: "Uploading file...",
      parsing: "Parsing contract content...",
      classifying: "Identifying contract type...",
      analyzingClause: "Analyzing clause risks...",
      generating: "Generating report...",
    },
    
    error: {
      title: "Analysis Failed",
      timeout: "Analysis timed out. Please try again.",
      generic: "An error occurred. Please try again.",
      notFound: "Report not found",
    },
  },
  
  zh: {
    backToHome: "返回首页",
    
    homepage: {
      title: "3分钟，看清合同风险",
      subtitle: "上传您的合同，AI智能分析，输出结构化风险报告",
      uploadButton: "上传合同",
      viewSample: "查看示例报告",
      supportInfo: "支持 PDF、DOCX / 最大 10MB / 每天 3 次免费审查",
      feature1Title: "条款分析",
      feature1Desc: "逐条识别风险，不只给数量，更指出具体条款问题。",
      feature2Title: "通俗易懂",
      feature2Desc: "将法律术语翻译成任何人都能理解的大白话。",
      feature3Title: "报告可分享",
      feature3Desc: "生成报告，一键分享给同事或律师审查。",
      contractTypes: "支持的合同类型",
      laborContract: "劳动合同",
      serviceContract: "服务合同",
      nda: "NDA / 保密协议",
      footer: "本工具仅提供风险提示，不构成法律意见。如有问题请咨询专业律师。",
    },
    
    upload: {
      title: "上传合同",
      subtitle: "支持 PDF 或 DOCX 格式，最大 10MB",
      dragDrop: "将文件拖拽到此区域",
      orClick: "或点击选择文件",
      remove: "移除",
      startAnalysis: "开始分析",
      parsing: "正在解析文件...",
      freeReviews: "每天免费 3 次审查",
      errorFileTooBig: "文件大小不能超过 10MB",
      errorInvalidType: "仅支持 PDF 和 DOCX 文件",
      errorUploadFailed: "上传失败",
      errorAnalysisFailed: "分析失败",
    },
    
    parsePreview: {
      title: "解析预览",
      quality: "质量",
      chars: "字符数",
      words: "词数",
    },
    
    report: {
      title: "合同分析报告",
      uploadNew: "上传新合同",
      riskScore: "风险评分",
      riskLevel: "风险等级",
      highRisk: "高风险",
      mediumRisk: "中风险",
      lowRisk: "低风险",
      highRiskCount: "高风险项",
      mediumRiskCount: "中风险项",
      lowRiskCount: "低风险项",
      riskDetails: "风险详情",
      clause: "相关条款",
      problem: "问题说明",
      recommendation: "修改建议",
      noRiskFound: "未发现明显风险",
      congrats: "恭喜，未发现明显的风险条款。",
      disclaimer: "本分析仅提供风险提示参考，不构成法律意见。如有问题请咨询专业律师。",
    },
    
    loading: {
      analyzing: "正在分析合同，请稍候...",
      pleaseWait: "请稍候...",
      estimatedTime: "预计需要 10-30 秒",
      uploading: "正在上传文件...",
      parsing: "正在解析合同内容...",
      classifying: "正在识别合同类型...",
      analyzingClause: "正在分析条款风险...",
      generating: "正在生成报告...",
    },
    
    error: {
      title: "分析失败",
      timeout: "分析超时，请稍后重试。",
      generic: "发生错误，请重试。",
      notFound: "报告不存在",
    },
  },
} as const;

export type Language = "en" | "zh";

export function getTranslations(lang: Language) {
  return translations[lang];
}
