export interface Clause {
  index: number;
  title: string;
  content: string;
}

export function splitClauses(text: string): Clause[] {
  const clauses: Clause[] = [];
  const lines = text.split(/\n/);
  let currentClause: { title: string; content: string[] } | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // 检测条款标题
    const titleMatch = trimmed.match(
      /^(第[一二三四五六七八九十百]+条|^[0-9]+[.)、]|^[A-Z][.)])/
    );

    if (titleMatch || clauses.length === 0) {
      if (currentClause && currentClause.content.length > 0) {
        clauses.push({
          index: clauses.length + 1,
          title: currentClause.title || "条款 " + (clauses.length + 1),
          content: currentClause.content.join("\n").trim(),
        });
      }
      currentClause = { title: trimmed, content: [] };
    } else if (currentClause) {
      currentClause.content.push(trimmed);
    }
  }

  // 添加最后一条
  if (currentClause && currentClause.content.length > 0) {
    clauses.push({
      index: clauses.length + 1,
      title: currentClause.title,
      content: currentClause.content.join("\n").trim(),
    });
  }

  // 如果没有找到条款，把整个文本作为一个条款
  if (clauses.length === 0 && text.trim()) {
    clauses.push({
      index: 1,
      title: "合同全文",
      content: text.trim(),
    });
  }

  return clauses;
}
