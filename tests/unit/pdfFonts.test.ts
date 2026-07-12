import { describe, it, expect, vi, beforeEach } from "vitest";

const { post } = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock("@/shared/api/api", () => ({ default: { post } }));

import { uploadFonts, finalizeUpload } from "@/shared/api/pdfFonts";

describe("pdfFonts", () => {
  beforeEach(() => post.mockReset());

  it("posts fonts as multipart and returns report", async () => {
    post.mockResolvedValue({
      data: { data: [{ name: "Arial", status: "AVAILABLE", embedded: false, installed: true }] },
    });
    const report = await uploadFonts("u1", [new File([new Uint8Array(1)], "a.ttf")]);
    expect(report[0].name).toBe("Arial");
    const [url, body] = post.mock.calls[0];
    expect(url).toBe("/api/upload/u1/fonts");
    expect(body).toBeInstanceOf(FormData);
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
