import { expect, test } from "@playwright/test";
import {
  installApiMocks,
  installMockWebSocket,
  openPresenterPrepare,
  seedPresenterSession,
} from "./support/mockBoini";

test.describe("Presenter prepare lifecycle", () => {
  test("restores presenter prepare session without redirecting home and starts the session", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    await installMockWebSocket(context);
    await installApiMocks(context);

    const page = await context.newPage();
    await seedPresenterSession(page, {
      quickSettings: {
        sticker: false,
        question: false,
        feedback: true,
        unlock: false,
      },
    });

    await openPresenterPrepare(page);

    await expect(page).toHaveURL(/\/rooms\/room-1\/prepare$/);
    await expect(page.getByRole("button", { name: "세션 시작" })).toBeVisible();
    await expect(page.getByLabel("리액션 스티커")).not.toBeChecked();
    await expect(page.getByLabel("실시간 질문")).not.toBeChecked();
    await expect(page.getByLabel("실시간 피드백")).toBeChecked();
    await expect(page.getByLabel("다음 슬라이드 공개")).not.toBeChecked();

    await page.getByRole("button", { name: "세션 시작" }).click();
    await expect(page).toHaveURL(/\/rooms\/room-1\/present$/);

    await context.close();
  });
});
