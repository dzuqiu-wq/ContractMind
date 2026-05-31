import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

const MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

export type ContractType = "NDA" | "劳动合同" | "服务合同" | "Unknown";

export async function classifyContract(text: string): Promise<{
  type: ContractType;
  confidence: number;
  reason: string;
}> {
  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `你是一个合同分类助手。根据内容判断合同类型。
支持的类型：NDA、劳动合同、服务合同、Unknown
输出JSON格式：
{
  "type": "NDA" | "劳动合同" | "服务合同" | "Unknown",
  "confidence": 0.0-1.0,
  "reason": "简短说明"
}`,
        },
        {
          role: "user",
          content: "分析以下合同内容，判断类型：\n\n" + text.slice(0, 2000),
        },
      ],
      temperature: 0.3,
    });

    const content = response.choices[0].message.content ?? "";
    const result = JSON.parse(content);
    return result;
  } catch (error) {
    console.error("Classification error:", error);
    return { type: "Unknown", confidence: 0, reason: "分析失败" };
  }
}
