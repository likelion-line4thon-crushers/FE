import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

const { getFeedbackQuestions, saveFeedbackQuestions } = vi.hoisted(() => ({
  getFeedbackQuestions: vi.fn(),
  saveFeedbackQuestions: vi.fn(),
}));
vi.mock("@/shared/api/feedback-questions", () => ({ getFeedbackQuestions, saveFeedbackQuestions }));

import { useFeedbackQuestions } from "@/features/feedback-questions/model/useFeedbackQuestions";

describe("useFeedbackQuestions", () => {
  beforeEach(() => {
    getFeedbackQuestions.mockReset();
    saveFeedbackQuestions.mockReset();
  });

  it("pads loaded questions to a minimum of 6 rows", async () => {
    getFeedbackQuestions.mockResolvedValue([{ id: 1, orderIndex: 0, questionText: "q1" }]);
    const { result } = renderHook(() => useFeedbackQuestions("room1", true));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.rows).toHaveLength(6);
    expect(result.current.rows[0]).toBe("q1");
    expect(result.current.rows[1]).toBe("");
  });

  it("caps adding at 20 rows", async () => {
    getFeedbackQuestions.mockResolvedValue([]);
    const { result } = renderHook(() => useFeedbackQuestions("room1", true));
    await waitFor(() => expect(result.current.loading).toBe(false));
    for (let i = 0; i < 20; i++) act(() => result.current.addRow());
    expect(result.current.rows).toHaveLength(20);
    expect(result.current.canAddMore).toBe(false);
  });

  it("drops blank rows and re-indexes on save", async () => {
    getFeedbackQuestions.mockResolvedValue([]);
    saveFeedbackQuestions.mockResolvedValue([]);
    const { result } = renderHook(() => useFeedbackQuestions("room1", true));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.setRow(0, "first"));
    act(() => result.current.setRow(2, "third"));
    let ok = false;
    await act(async () => {
      ok = await result.current.save();
    });
    expect(ok).toBe(true);
    expect(saveFeedbackQuestions).toHaveBeenCalledWith("room1", [
      { orderIndex: 0, questionText: "first" },
      { orderIndex: 1, questionText: "third" },
    ]);
  });
});
