import { Issue } from "./analyzer";

export interface ScoreResult {
  overall_score: number;
  risk_level: string;
  breakdown: {
    high_risk_count: number;
    medium_risk_count: number;
    low_risk_count: number;
  };
}

export function calculateScore(issues: Issue[]): ScoreResult {
  let score = 0;
  const breakdown = { high_risk_count: 0, medium_risk_count: 0, low_risk_count: 0 };

  for (const issue of issues) {
    switch (issue.severity) {
      case "High":
        score += 25;
        breakdown.high_risk_count++;
        break;
      case "Medium":
        score += 15;
        breakdown.medium_risk_count++;
        break;
      case "Low":
        score += 5;
        breakdown.low_risk_count++;
        break;
    }
  }

  return {
    overall_score: Math.min(100, score),
    risk_level: score >= 60 ? "高" : score >= 30 ? "中" : "低",
    breakdown,
  };
}
