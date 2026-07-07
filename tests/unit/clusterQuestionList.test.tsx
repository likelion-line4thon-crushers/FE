import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { NormalizedQuestion, QuestionCluster } from "@/entities/question";
import ClusterQuestionList from "@/pages/presenter-room/ui/ClusterQuestionList";

const cluster: QuestionCluster = {
  clusterId: "cluster-q1",
  representativeQuestionId: "q1",
  representative: "대표 질문",
  count: 3,
  questions: [
    { id: "q1", content: "대표 질문", slide: 1, ts: 1000, status: "active" },
    { id: "q2", content: "하위 질문 1", slide: 2, ts: 2000, status: "active" },
    { id: "q3", content: "하위 질문 2", slide: 3, ts: 3000, status: "active" },
  ],
  questionIds: ["q1", "q2", "q3"],
  slides: [1, 2, 3],
  samples: ["대표 질문", "하위 질문 1", "하위 질문 2"],
};

describe("ClusterQuestionList", () => {
  it("sends only the representative question id for representative actions", () => {
    const onDelete = vi.fn();

    render(
      <ClusterQuestionList
        clusters={[cluster]}
        isExpanded={() => true}
        toggleExpand={vi.fn()}
        onDelete={onDelete}
      />
    );

    fireEvent.click(screen.getAllByRole("button", { name: "질문 삭제" })[0]);

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith("q1");
  });

  it("sends only the clicked sub-question id for sub-question actions", () => {
    const onDelete = vi.fn();

    render(
      <ClusterQuestionList
        clusters={[cluster]}
        isExpanded={() => true}
        toggleExpand={vi.fn()}
        onDelete={onDelete}
      />
    );

    fireEvent.click(screen.getAllByRole("button", { name: "질문 삭제" })[1]);

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith("q2");
  });

  it("disables sub-question actions after a representative action while refresh is pending", () => {
    const onDelete = vi.fn();

    render(
      <ClusterQuestionList
        clusters={[cluster]}
        isExpanded={() => true}
        toggleExpand={vi.fn()}
        onDelete={onDelete}
      />
    );

    const deleteButtons = screen.getAllByRole("button", { name: "질문 삭제" });
    fireEvent.click(deleteButtons[0]);
    fireEvent.click(deleteButtons[1]);

    expect(deleteButtons[1]).toBeDisabled();
    expect(deleteButtons[2]).toBeDisabled();
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith("q1");
  });

  it("shows live like totals for clustered presenter questions", () => {
    const questionById = new Map<string, NormalizedQuestion>([
      [
        "q1",
        {
          id: "q1",
          roomId: "room-1",
          audienceId: "aud-1",
          content: "대표 질문",
          slide: 1,
          ts: 1000,
          likeCount: 2,
        },
      ],
      [
        "q2",
        {
          id: "q2",
          roomId: "room-1",
          audienceId: "aud-2",
          content: "하위 질문 1",
          slide: 2,
          ts: 2000,
          likeCount: 3,
        },
      ],
      [
        "q3",
        {
          id: "q3",
          roomId: "room-1",
          audienceId: "aud-3",
          content: "하위 질문 2",
          slide: 3,
          ts: 3000,
          likeCount: 1,
        },
      ],
    ]);

    render(
      <ClusterQuestionList
        clusters={[cluster]}
        isExpanded={() => true}
        toggleExpand={vi.fn()}
        questionById={questionById}
      />
    );

    expect(screen.getByLabelText("좋아요 6개")).toBeInTheDocument();
    expect(screen.getByLabelText("좋아요 3개")).toBeInTheDocument();
    expect(screen.getByLabelText("좋아요 1개")).toBeInTheDocument();
  });
});
