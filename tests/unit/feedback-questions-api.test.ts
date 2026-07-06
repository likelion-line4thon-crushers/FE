import { describe, it, expect, vi, beforeEach } from "vitest";

const { post, put, get } = vi.hoisted(() => ({
  post: vi.fn(),
  put: vi.fn(),
  get: vi.fn(),
}));
vi.mock("@/shared/api/api", () => ({ default: { post, put, get } }));

import { getFeedbackQuestions, saveFeedbackQuestions } from "@/shared/api/feedback-questions";

describe("feedback-questions api", () => {
  beforeEach(() => {
    put.mockReset();
    get.mockReset();
  });

  it("unwraps questions from BaseResponse on get", async () => {
    get.mockResolvedValue({
      data: { data: { questions: [{ id: 1, orderIndex: 0, questionText: "q" }] } },
    });
    const result = await getFeedbackQuestions("room1");
    expect(get).toHaveBeenCalledWith("/api/rooms/room1/feedback-questions");
    expect(result).toEqual([{ id: 1, orderIndex: 0, questionText: "q" }]);
  });

  it("sends questions array and unwraps response on save", async () => {
    put.mockResolvedValue({
      data: { data: { questions: [{ id: 2, orderIndex: 0, questionText: "a" }] } },
    });
    const result = await saveFeedbackQuestions("room1", [{ orderIndex: 0, questionText: "a" }]);
    expect(put).toHaveBeenCalledWith("/api/rooms/room1/feedback-questions", {
      questions: [{ orderIndex: 0, questionText: "a" }],
    });
    expect(result).toEqual([{ id: 2, orderIndex: 0, questionText: "a" }]);
  });
});
