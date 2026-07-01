import { expect, test } from "@playwright/test";
import {
  installApiMocks,
  installMockWebSocket,
  openAudienceJoin,
  openPresenterPrepare,
  openPresenterLive,
  seedPresenterSession,
} from "./support/mockBoini";

test.describe("Presenter slide notes", () => {
  test("lets presenter edit notes before the session starts", async ({ browser }) => {
    const presenterContext = await browser.newContext();
    await installMockWebSocket(presenterContext);
    await installApiMocks(presenterContext, { scenario: { sessionStatus: "waiting" } });

    const presenterPage = await presenterContext.newPage();
    await seedPresenterSession(presenterPage, { scenario: { sessionStatus: "waiting" } });
    await openPresenterPrepare(presenterPage, { sessionStatus: "waiting" });

    await expect(presenterPage.getByTestId("presenter-slide-notes")).toBeVisible();
    const notesInput = presenterPage.getByTestId("presenter-slide-notes-input");
    await expect(notesInput).not.toHaveAttribute("readonly", "");
    await expect(notesInput).toHaveValue("첫 번째 슬라이드 발표자 노트");

    await presenterPage.getByAltText("슬라이드 3").click();
    await expect(
      presenterPage.getByTestId("presenter-slide-surface").getByAltText("슬라이드 3")
    ).toBeVisible();
    await expect(notesInput).toHaveValue("");

    const saveRequestPromise = presenterPage.waitForRequest((request) => {
      return (
        request.method() === "PUT" &&
        request.url().includes("/api/presentations/room-1/deck-1/notes/3")
      );
    });
    await notesInput.fill("수동 발표자 노트");
    const saveRequest = await saveRequestPromise;
    expect(saveRequest.postDataJSON()).toEqual({ notes: "수동 발표자 노트" });

    await presenterPage.getByAltText("슬라이드 2").click();
    await presenterPage.getByAltText("슬라이드 3").click();
    await expect(notesInput).toHaveValue("수동 발표자 노트");
  });

  test("shows read-only current slide notes during the live session and hides them from audience", async ({
    browser,
  }) => {
    const presenterContext = await browser.newContext();
    const audienceContext = await browser.newContext();

    await installMockWebSocket(presenterContext);
    await installMockWebSocket(audienceContext);
    await installApiMocks(presenterContext);
    await installApiMocks(audienceContext);

    const presenterPage = await presenterContext.newPage();
    await seedPresenterSession(presenterPage);
    await openPresenterLive(presenterPage);

    await expect(presenterPage.getByTestId("presenter-slide-notes")).toBeVisible();
    const notesInput = presenterPage.getByTestId("presenter-slide-notes-input");
    await expect(notesInput).toHaveAttribute("readonly", "");
    await expect(notesInput).toHaveValue(
      "첫 번째 슬라이드 발표자 노트"
    );

    await presenterPage.getByAltText("슬라이드 2").click();
    await expect(
      presenterPage.getByTestId("presenter-slide-surface").getByAltText("슬라이드 2")
    ).toBeVisible();
    await expect(notesInput).toHaveValue(
      "두 번째 슬라이드 발표자 노트"
    );

    await presenterPage.getByAltText("슬라이드 3").click();
    await expect(
      presenterPage.getByTestId("presenter-slide-surface").getByAltText("슬라이드 3")
    ).toBeVisible();
    await expect(presenterPage.getByTestId("presenter-slide-notes")).toBeVisible();
    await expect(notesInput).toHaveValue("");

    const audiencePage = await audienceContext.newPage();
    await openAudienceJoin(audiencePage);
    await expect(
      audiencePage.getByTestId("audience-slide-surface").getByAltText("슬라이드 2")
    ).toBeVisible();
    await expect(audiencePage.getByTestId("presenter-slide-notes")).toHaveCount(0);
  });
});
