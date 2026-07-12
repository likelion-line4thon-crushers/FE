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
        onUploadFonts={() => {}}
        onProceedWithout={onProceed}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "그냥 진행" }));
    expect(onProceed).toHaveBeenCalledOnce();
  });
});
