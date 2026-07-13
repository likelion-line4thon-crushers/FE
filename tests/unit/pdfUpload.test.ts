import { describe, it, expect, vi, beforeEach } from "vitest";

const { post } = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock("@/shared/api/api", () => ({ default: { post } }));

import { uploadPdfInChunks } from "@/shared/api/pdfUpload";

describe("uploadPdfInChunks", () => {
  beforeEach(() => post.mockReset());

  it("returns NEEDS_FONTS terminal result", async () => {
    post.mockResolvedValue({
      status: 201,
      data: { data: { status: "NEEDS_FONTS", uploadId: "u1", fontReport: [] } },
    });
    const file = new File([new Uint8Array(10)], "deck.pptx");
    const result = await uploadPdfInChunks(file, { roomId: "r", deckId: "d" });
    expect(result.status).toBe("NEEDS_FONTS");
  });
});
