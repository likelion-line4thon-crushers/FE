import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { NormalizedQuestion } from "@/entities/question";
import QuestionList from "@/pages/presenter-room/ui/QuestionList";

describe("QuestionList", () => {
  it("shows the presenter like count for each question", () => {
    const questions: NormalizedQuestion[] = [
      {
        id: "q1",
        roomId: "room-1",
        audienceId: "aud-1",
        content: "좋아요가 있는 질문",
        slide: 1,
        ts: 1000,
        likeCount: 7,
      },
    ];

    render(<QuestionList questions={questions} currentSlide={0} />);

    expect(screen.getByLabelText("좋아요 7개")).toBeInTheDocument();
  });
});
