import { describe, it, expect, vi } from "vitest";
import type { ComponentProps } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import FontRequirementPrompt from "@/pages/session-create/ui/FontRequirementPrompt";

const report = [
  { name: "Malgun Gothic", status: "MISSING" as const, embedded: false, installed: false },
  { name: "Arial", status: "AVAILABLE" as const, embedded: false, installed: true },
];

function renderPrompt(overrides: Partial<ComponentProps<typeof FontRequirementPrompt>> = {}) {
  const props = {
    fontReport: report,
    busy: false,
    uploadingName: null,
    warnings: {},
    error: null,
    onUploadFont: () => {},
    onContinue: () => {},
    onProceedWithout: () => {},
    ...overrides,
  };
  return { props, ...render(<FontRequirementPrompt {...props} />) };
}

describe("FontRequirementPrompt", () => {
  it("lists fonts with status", () => {
    renderPrompt();
    expect(screen.getByText("Malgun Gothic")).toBeInTheDocument();
    expect(screen.getByText("Arial")).toBeInTheDocument();
  });

  it("shows an upload button only on missing rows", () => {
    renderPrompt();
    // Only Malgun Gothic (MISSING) has an upload button; Arial (AVAILABLE) does not.
    expect(screen.getAllByRole("button", { name: "업로드" })).toHaveLength(1);
  });

  it("uploads a file for the specific font row", () => {
    const onUploadFont = vi.fn();
    const { container } = renderPrompt({ onUploadFont });

    fireEvent.click(screen.getByRole("button", { name: "업로드" }));
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File([new Uint8Array([1, 2, 3])], "malgun.ttf");
    fireEvent.change(input, { target: { files: [file] } });

    expect(onUploadFont).toHaveBeenCalledTimes(1);
    expect(onUploadFont.mock.calls[0][0]).toBe("Malgun Gothic");
    expect(onUploadFont.mock.calls[0][1].name).toBe("malgun.ttf");
  });

  it("shows an uploading state on the row being uploaded", () => {
    renderPrompt({ uploadingName: "Malgun Gothic" });
    expect(screen.getByRole("button", { name: "업로드 중…" })).toBeInTheDocument();
  });

  it("confirms before continuing when fonts are still missing", () => {
    const onContinue = vi.fn();
    renderPrompt({ onContinue }); // 기본 report 에 MISSING 폰트가 있음
    fireEvent.click(screen.getByRole("button", { name: "변환 시작" }));
    expect(onContinue).not.toHaveBeenCalled(); // 바로 진행하지 않고 확인 모달을 띄운다
    fireEvent.click(screen.getByRole("button", { name: "네, 시작할게요" }));
    expect(onContinue).toHaveBeenCalledOnce();
  });

  it("continues immediately when nothing is missing", () => {
    const onContinue = vi.fn();
    renderPrompt({
      fontReport: [{ name: "Arial", status: "AVAILABLE", embedded: false, installed: true }],
      onContinue,
    });
    fireEvent.click(screen.getByRole("button", { name: "변환 시작" }));
    expect(onContinue).toHaveBeenCalledOnce();
  });

  it("fires onProceedWithout", () => {
    const onProceedWithout = vi.fn();
    renderPrompt({ onProceedWithout });
    fireEvent.click(screen.getByRole("button", { name: "그냥 진행" }));
    expect(onProceedWithout).toHaveBeenCalledOnce();
  });

  it("shows an all-resolved message when nothing is missing", () => {
    renderPrompt({
      fontReport: [{ name: "Arial", status: "AVAILABLE", embedded: false, installed: true }],
    });
    expect(screen.getByText(/모두 준비되었어요/)).toBeInTheDocument();
  });

  it("shows a mismatch warning when the uploaded file did not match the font", () => {
    renderPrompt({ warnings: { "Malgun Gothic": "Yoon Mokryn" } });
    expect(screen.getByText(/올린 폰트: Yoon Mokryn/)).toBeInTheDocument();
  });
});
