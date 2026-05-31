/**
 * 合同解析模块测试
 */

import { describe, it, expect } from "vitest";

describe("parser module", () => {
  it("should export parseFile function", async () => {
    const { parseFile } = await import("@/lib/parser");
    expect(typeof parseFile).toBe("function");
  });

  it("should export parseContract function", async () => {
    const { parseContract } = await import("@/lib/parser");
    expect(typeof parseContract).toBe("function");
  });
});
