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
    const scenario = { pdfDownloadEnabled: false, sessionStatus: "waiting" as const };
    await installApiMocks(context, { scenario });

    const page = await context.newPage();
    await seedPresenterSession(page, {
      scenario,
      quickSettings: {
        sticker: false,
        question: false,
        feedback: true,
        unlock: false,
      },
    });

    await openPresenterPrepare(page);

    await expect(page).toHaveURL(/\/rooms\/room-1$/);
    await expect(page.getByRole("button", { name: "세션 시작" })).toBeVisible();
    await expect(page.getByLabel("리액션 스티커")).not.toBeChecked();
    await expect(page.getByLabel("실시간 질문")).not.toBeChecked();
    await expect(page.getByLabel("실시간 피드백")).toBeChecked();
    await expect(page.getByLabel("다음 슬라이드 공개")).not.toBeChecked();
    await expect(page.getByLabel("슬라이드 다운로드 허용")).not.toBeChecked();

    const policyRequestPromise = page.waitForRequest(
      (request) =>
        request.method() === "PATCH" &&
        request.url().includes("/api/rooms/room-1/pdf-download-policy")
    );
    await page.getByLabel("슬라이드 다운로드 허용").check();
    const policyRequest = await policyRequestPromise;
    expect(policyRequest.postDataJSON()).toEqual({ enabled: true });

    await page.getByRole("button", { name: "세션 시작" }).click();
    await page.getByRole("button", { name: "네, 확인했습니다." }).click();
    await expect(page.getByRole("button", { name: "세션 종료" })).toBeVisible();
    await expect(page).toHaveURL(/\/rooms\/room-1$/);
    await expect(page.getByLabel("슬라이드 다운로드 허용")).toHaveCount(0);

    await context.close();
  });
});
