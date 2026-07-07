import { describe, expect, it } from "vitest";
import {
  isSupportedPresentationFile,
  PRESENTATION_FILE_ACCEPT,
} from "@/pages/landing/lib/presentationFile";

const file = (name: string, type = "") => new File(["demo"], name, { type });

describe("presentation file validation", () => {
  it("accepts pdf, ppt, and pptx files by extension", () => {
    expect(isSupportedPresentationFile(file("deck.pdf"))).toBe(true);
    expect(isSupportedPresentationFile(file("deck.ppt"))).toBe(true);
    expect(isSupportedPresentationFile(file("deck.pptx"))).toBe(true);
  });

  it("accepts supported extensions regardless of casing", () => {
    expect(isSupportedPresentationFile(file("DECK.PDF", "application/pdf"))).toBe(true);
  });

  it("rejects unsupported files", () => {
    expect(
      isSupportedPresentationFile(
        file(
          "deck",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        )
      )
    ).toBe(false);
    expect(isSupportedPresentationFile(file("deck.key"))).toBe(false);
    expect(isSupportedPresentationFile(file("deck.txt", "text/plain"))).toBe(false);
    expect(isSupportedPresentationFile(null)).toBe(false);
  });

  it("matches the file input accept value", () => {
    expect(PRESENTATION_FILE_ACCEPT).toBe(".pdf,.ppt,.pptx");
  });
});
