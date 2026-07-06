import { describe, expect, it } from "vitest";
import {
  applyQuestionLikeEvent,
  applyQuestionStatusEvent,
  normalizeQuestion,
  sortQuestionsByMode,
} from "@/entities/question";
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

describe("question like metadata", () => {
  it("normalizes like count and liked state from backend variants", () => {
    const question = normalizeQuestion({
      questionId: "q1",
      slide: 1,
      content: "좋아요가 있는 질문",
      ts: 1000,
      thumbsUpCount: "7",
      liked: "true",
    });

    expect(question?.likeCount).toBe(7);
    expect(question?.likedByMe).toBe(true);
  });

  it("applies explicit like update counts", () => {
    const questions = [{ ...makeQuestion("q1"), likeCount: 2, likedByMe: false }];
    const result = applyQuestionLikeEvent(questions, {
      type: "QUESTION_LIKE_UPDATED",
      questionId: "q1",
      likeCount: 3,
      likedByMe: true,
    });

    expect(result[0].likeCount).toBe(3);
    expect(result[0].likedByMe).toBe(true);
  });

  it("sorts popular questions by like count and latest questions by timestamp", () => {
    const oldestPopular = { ...makeQuestion("q1"), ts: 1000, likeCount: 5 };
    const newest = { ...makeQuestion("q2"), ts: 3000, likeCount: 1 };
    const middle = { ...makeQuestion("q3"), ts: 2000, likeCount: 2 };

    expect(
      sortQuestionsByMode([oldestPopular, newest, middle], "popular").map((q) => q.id)
    ).toEqual(["q1", "q3", "q2"]);
    expect(sortQuestionsByMode([oldestPopular, newest, middle], "latest").map((q) => q.id)).toEqual(
      ["q2", "q3", "q1"]
    );
  });
});
