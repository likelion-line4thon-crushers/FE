import React from "react";
import { test, expect } from "@playwright/experimental-ct-react";
import AudiencePanel from "@/pages/audience-room/ui/AudiencePanel";

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
});
