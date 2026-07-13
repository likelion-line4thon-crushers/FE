import { describe, it, expect } from "vitest";
import type { ChunkUploadTerminal } from "@/shared/api/model/pdf";

describe("ChunkUploadTerminal", () => {
  it("narrows on status", () => {
    const r: ChunkUploadTerminal = {
      status: "NEEDS_FONTS",
      uploadId: "u1",
      fontReport: [{ name: "Malgun Gothic", status: "MISSING", embedded: false, installed: false }],
    };
    expect(r.status === "NEEDS_FONTS" ? r.fontReport.length : 0).toBe(1);
  });
});
