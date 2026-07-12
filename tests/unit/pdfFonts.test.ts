import { describe, it, expect, vi, beforeEach } from "vitest";

const { post } = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock("@/shared/api/api", () => ({ default: { post } }));

import { uploadFonts, finalizeUpload } from "@/shared/api/pdfFonts";

describe("pdfFonts", () => {
  beforeEach(() => post.mockReset());

  it("posts fonts with targetFont as multipart and returns the match result", async () => {
    post.mockResolvedValue({
      data: { data: { matched: true, targetFont: "Arial", uploadedFamilies: ["Arial"] } },
    });
    const res = await uploadFonts("u1", [new File([new Uint8Array(1)], "a.ttf")], "Arial");
    expect(res.matched).toBe(true);
    expect(res.uploadedFamilies?.[0]).toBe("Arial");
    const [url, body] = post.mock.calls[0];
    expect(url).toBe("/api/upload/u1/fonts");
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get("targetFont")).toBe("Arial");
  });

  it("finalizes and returns READY", async () => {
    post.mockResolvedValue({
      data: {
        data: {
          status: "READY",
          uploadId: "u1",
          pdfId: "p",
          fileName: "f",
          totalPages: 3,
          streamUrl: "/s",
        },
      },
    });
    const ready = await finalizeUpload("u1", true);
    expect(ready.status).toBe("READY");
    const [url, body] = post.mock.calls[0];
    expect(url).toBe("/api/upload/u1/finalize");
    expect(body).toEqual({ proceedWithoutFonts: true });
  });
});
