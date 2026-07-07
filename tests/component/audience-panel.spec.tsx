import React from "react";
import { test, expect } from "@playwright/experimental-ct-react";
import AudiencePanel from "@/pages/audience-room/ui/AudiencePanel";
import type { NormalizedQuestion } from "@/entities/question";

test.describe("AudiencePanel", () => {
  test("reveals the submit action only while the audience is actively typing", async ({
    mount,
  }) => {
    const component = await mount(<AudiencePanel currentSlide={0} />);

    const input = component.getByPlaceholder("질문 내용을 작성해 주세요");
    await expect(component.getByLabel("질문 제출")).toHaveCount(0);

    await input.fill("발표 자료를 다시 볼 수 있나요?");
    await expect(component.getByLabel("질문 제출")).toBeVisible();
  });

  test("shows the presenter lock banner and disables question entry when questions are off", async ({
    mount,
  }) => {
    const component = await mount(<AudiencePanel currentSlide={0} isLocked />);

    await expect(component.getByText("실시간 질문 기능이 잠겼습니다")).toBeVisible();
    await expect(component.getByPlaceholder("질문 내용을 작성해 주세요")).toHaveCount(0);
  });

  test("renders the thumbs-up state and calls the like toggle", async ({ mount }) => {
    const toggledQuestionIds: string[] = [];
    const questions: NormalizedQuestion[] = [
      {
        id: "q-liked",
        roomId: "room-1",
        slide: 1,
        audienceId: "audience-1",
        content: "질문 좋아요를 누를 수 있나요?",
        ts: Date.now(),
        likeCount: 8,
        likedByMe: true,
      },
    ];

    const component = await mount(
      <AudiencePanel
        currentSlide={0}
        questions={questions}
        onToggleQuestionLike={(questionId) => toggledQuestionIds.push(questionId)}
      />
    );

    const likeButton = component.getByRole("button", { name: "질문 좋아요" });
    await expect(likeButton).toHaveAttribute("aria-pressed", "true");
    await expect(likeButton).toContainText("8");

    await likeButton.click();
    expect(toggledQuestionIds).toEqual(["q-liked"]);
  });
});
