import OpenAI from "openai";
import { Clause } from "./splitter";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

const MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

export interface Issue {
  title: string;
  severity: "High" | "Medium" | "Low";
  explanation: string;
  recommendation: string;
  clause: string;
}

export interface ClauseAnalysis {
  index: number;
  title: string;
  content: string;
  risk_score: number;
  is_risky: boolean;
  issues: Issue[];
}

export async function analyzeClause(
  clause: Clause,
  contractType: string
): Promise<ClauseAnalysis> {
  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `你是一个合同风险分析专家。分析每个条款，识别潜在风险。
重要原则：
1. 只提供风险提示，不提供法律意见
2. 用普通人能理解的语言
3. 严重程度：High（可能导致重大损失）/ Medium（需要关注）/ Low（建议优化）
如果没有风险，返回 is_risky: false

输出JSON格式：
{
  "is_risky": true/false,
  "risk_score": 0-100,
  "issues": [
    {
      "title": "风险标题",
      "severity": "High" | "Medium" | "Low",
      "explanation": "详细说明（2-3句话）",
      "recommendation": "具体修改建议"
    }
  ]
}`,
        },
        {
          role: "user",
          content:
            "分析以下" +
            contractType +
            "条款：\n\n标题：" +
            clause.title +
            "\n内容：" +
            clause.content,
        },
      ],
      temperature: 0.3,
    });

    const content = response.choices[0].message.content ?? "";
    const result = JSON.parse(content);
    return {
      index: clause.index,
      title: clause.title,
      content: clause.content,
      risk_score: result.risk_score || 0,
      is_risky: result.is_risky || false,
      issues: (result.issues || []).map((issue: any) => ({
        ...issue,
        clause: clause.title,
      })),
    };
  } catch (error) {
    console.error("Analysis error:", error);
    return {
      index: clause.index,
      title: clause.title,
      content: clause.content,
      risk_score: 0,
      is_risky: false,
      issues: [],
    };
  }
}

export async function analyzeContract(
  clauses: Clause[],
  contractType: string
): Promise<{
  clauses: ClauseAnalysis[];
  issues: Issue[];
}> {
  const results = [];

  // 并行分析（限制并发）
  const batchSize = 5;
  for (let i = 0; i < clauses.length; i += batchSize) {
    const batch = clauses.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((clause) => analyzeClause(clause, contractType))
    );
    results.push(...batchResults);
  }

  const allIssues = results.flatMap((r) => r.issues);

  return { clauses: results, issues: allIssues };
}
