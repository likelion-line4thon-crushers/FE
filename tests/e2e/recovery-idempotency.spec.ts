import { expect, test } from "@playwright/test";
import {
  destinations,
  emitJson,
  installApiMocks,
  installMockWebSocket,
  openAudienceJoin,
  seedAudienceSession,
} from "./support/mockBoini";

test.describe("Audience recovery and edge cases", () => {
  test("keeps audience recovery idempotent across waiting, repeated live events, and refresh", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    await installMockWebSocket(context);
    await installApiMocks(context, {
      joinStatus: "waiting",
      joinCurrentPage: 1,
      roomInfoStatus: "live",
      roomInfoCurrentPage: 2,
    });

    const page = await context.newPage();
    const scenario = await openAudienceJoin(page);

    await expect(page.getByText("현재 라이브 대기중입니다.")).toBeVisible();

    await emitJson(page, destinations.publicTopic(scenario.roomId), {
      type: "SESSION_STATE",
      status: "live",
    });
    await emitJson(page, destinations.publicTopic(scenario.roomId), {
      type: "SESSION_STATE",
      status: "live",
    });
    await emitJson(page, destinations.presentationPageChangeTopic(scenario.roomId), {
      changedPage: 2,
    });
    await expect(
      page.getByTestId("audience-slide-surface").getByAltText("슬라이드 2")
    ).toBeVisible();

    await page.reload();
    await expect(
      page.getByTestId("audience-slide-surface").getByAltText("슬라이드 2")
    ).toBeVisible();

    await context.close();
  });

  test("prevents audience navigation past the revealed slide boundary across keyboard and sidebar actions", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    await installMockWebSocket(context);
    await installApiMocks(context, {
      joinStatus: "live",
      joinCurrentPage: 1,
      joinMaxPage: 0,
      joinSlideUnlock: false,
      roomInfoStatus: "live",
      roomInfoCurrentPage: 1,
      roomInfoMaxPage: 0,
      roomInfoSlideUnlock: false,
    });

    const page = await context.newPage();
    await openAudienceJoin(page);
    await expect(
      page.getByTestId("audience-slide-surface").getByAltText("슬라이드 1")
    ).toBeVisible();

    await page.getByLabel("발표자와 함께 보기").uncheck();
    await page.keyboard.press("ArrowRight");
    await expect(
      page.getByTestId("audience-slide-surface").getByAltText("슬라이드 1")
    ).toBeVisible();

    await page.getByText("2").click();
    await expect(
      page.getByTestId("audience-slide-surface").getByAltText("슬라이드 1")
    ).toBeVisible();

    await context.close();
  });

  test("uses audience storage after rating refresh and ignores stale presenter storage", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    await installMockWebSocket(context);
    await installApiMocks(context);

    const page = await context.newPage();
    await seedAudienceSession(page);
    await page.evaluate(() => {
      sessionStorage.setItem(
        "boini_room",
        JSON.stringify({
          roomId: "presenter-room",
          presenterToken: "wrong-token",
          deckId: "presenter-deck",
        })
      );
    });

    await page.goto("/audience/ABCD/rating");
    await page.reload();

    await expect(page.getByRole("status")).toBeHidden();
    await page.getByAltText("5 star").click();
    await expect(page.getByRole("button", { name: "제출" })).toBeEnabled();
    await page.getByRole("button", { name: "건너뛰기" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect
      .poll(() => page.evaluate(() => sessionStorage.getItem("boini_audience_ABCD")))
      .toBeNull();

    await context.close();
  });

  test.fixme("audience public-topic question updates are blocked by singleton subscription ownership in websocketService", async () => {});
});
