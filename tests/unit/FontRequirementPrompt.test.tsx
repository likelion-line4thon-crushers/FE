import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FontRequirementPrompt from "@/pages/session-create/ui/FontRequirementPrompt";

const report = [
  { name: "Malgun Gothic", status: "MISSING" as const, embedded: false, installed: false },
  { name: "Arial", status: "AVAILABLE" as const, embedded: false, installed: true },
];

describe("FontRequirementPrompt", () => {
  it("lists fonts with status", () => {
    render(
      <FontRequirementPrompt
        fontReport={report}
        busy={false}
        error={null}
        onCheckFonts={() => {}}
        onUploadFonts={() => {}}
        onProceedWithout={() => {}}
      />
    );
    expect(screen.getByText("Malgun Gothic")).toBeInTheDocument();
    expect(screen.getByText("Arial")).toBeInTheDocument();
  });

  it("fires onProceedWithout", () => {
    const onProceed = vi.fn();
    render(
      <FontRequirementPrompt
        fontReport={report}
        busy={false}
        error={null}
        onCheckFonts={() => {}}
        onUploadFonts={() => {}}
        onProceedWithout={onProceed}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "그냥 진행" }));
    expect(onProceed).toHaveBeenCalledOnce();
  });

  it("re-check button is disabled until files are picked, then fires onCheckFonts with them", () => {
    const onCheck = vi.fn();
    const { container } = render(
      <FontRequirementPrompt
        fontReport={report}
        busy={false}
        error={null}
        onCheckFonts={onCheck}
        onUploadFonts={() => {}}
        onProceedWithout={() => {}}
      />
    );

    const checkBtn = screen.getByRole("button", { name: "선택한 폰트로 다시 확인" });
    expect(checkBtn).toBeDisabled();

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File([new Uint8Array([1, 2, 3])], "MyFont.ttf");
    fireEvent.change(input, { target: { files: [file] } });

    expect(checkBtn).not.toBeDisabled();
    fireEvent.click(checkBtn);
    expect(onCheck).toHaveBeenCalledTimes(1);
    expect(onCheck.mock.calls[0][0]).toHaveLength(1);
    expect(onCheck.mock.calls[0][0][0].name).toBe("MyFont.ttf");
  });

  it("shows an all-resolved message when nothing is missing", () => {
    const resolved = [{ name: "Arial", status: "AVAILABLE" as const, embedded: false, installed: true }];
    render(
      <FontRequirementPrompt
        fontReport={resolved}
        busy={false}
        error={null}
        onCheckFonts={() => {}}
        onUploadFonts={() => {}}
        onProceedWithout={() => {}}
      />
    );
    expect(screen.getByText(/모두 준비되었어요/)).toBeInTheDocument();
  });
});
