import { describe, it, expect, vi, beforeEach } from "vitest";

const { post } = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock("@/shared/api/api", () => ({ default: { post } }));

import { submitFeedbackAnswers } from "@/shared/api/feedback-answers";

describe("feedback-answers api", () => {
  beforeEach(() => post.mockReset());

  it("posts answers and unwraps the response", async () => {
    post.mockResolvedValue({
      data: { data: { answers: [{ id: 1, questionId: 10, answerText: "a" }] } },
    });
    const result = await submitFeedbackAnswers("room1", "aud1", [
      { questionId: 10, answerText: "a" },
    ]);
    expect(post).toHaveBeenCalledWith("/api/rooms/room1/feedback-answers", {
      audienceId: "aud1",
      answers: [{ questionId: 10, answerText: "a" }],
    });
    expect(result).toEqual([{ id: 1, questionId: 10, answerText: "a" }]);
  });

  it("throws when roomId or audienceId missing", async () => {
    await expect(submitFeedbackAnswers("", "aud1", [])).rejects.toThrow();
    await expect(submitFeedbackAnswers("room1", "", [])).rejects.toThrow();
  });
});
