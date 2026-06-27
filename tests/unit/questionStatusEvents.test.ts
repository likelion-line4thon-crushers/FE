import { describe, expect, it } from "vitest";
import { applyQuestionStatusEvent } from "@/entities/question";
import type { NormalizedQuestion } from "@/entities/question";

const makeQuestion = (id: string): NormalizedQuestion => ({
  id,
  roomId: "room-1",
  slide: 1,
  audienceId: "a1",
  content: "test",
  ts: Date.now(),
});

describe("applyQuestionStatusEvent", () => {
  it("removes the question when type is QUESTION_DELETED", () => {
    const questions = [makeQuestion("q1"), makeQuestion("q2")];
    const result = applyQuestionStatusEvent(questions, {
      type: "QUESTION_DELETED",
      questionId: "q1",
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("q2");
  });

  it("removes the question when type is QUESTION_COMPLETED", () => {
    const questions = [makeQuestion("q1"), makeQuestion("q2")];
    const result = applyQuestionStatusEvent(questions, {
      type: "QUESTION_COMPLETED",
      questionId: "q2",
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("q1");
  });

  it("returns original list unchanged for unknown event types", () => {
    const questions = [makeQuestion("q1")];
    const result = applyQuestionStatusEvent(questions, { type: "QUESTION_CREATED" });
    expect(result).toBe(questions);
  });

  it("returns original list unchanged when questionId is missing", () => {
    const questions = [makeQuestion("q1")];
    const result = applyQuestionStatusEvent(questions, { type: "QUESTION_DELETED" });
    expect(result).toBe(questions);
  });
});
