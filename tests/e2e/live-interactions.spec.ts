import { expect, test } from "@playwright/test";
import {
  clearSentMessages,
  destinations,
  emitJson,
  emitText,
  expectNoSentMessage,
  installApiMocks,
  installMockWebSocket,
  openAudienceJoin,
  openPresenterLive,
  seedPresenterSession,
  waitForSentMessage,
} from "./support/mockBoini";

test.describe("Live presenter and audience interactions", () => {
  test("covers slide sync, questions, reactions, option changes, focus sync, and session end", async ({
    browser,
  }) => {
    const presenterContext = await browser.newContext();
    const audienceContext = await browser.newContext();

    await installMockWebSocket(presenterContext);
    await installMockWebSocket(audienceContext);
    await installApiMocks(presenterContext);
    await installApiMocks(audienceContext);

    const presenterPage = await presenterContext.newPage();
    const audiencePage = await audienceContext.newPage();

    await seedPresenterSession(presenterPage);
    const scenario = await openPresenterLive(presenterPage);
    await expect(presenterPage.getByText("청중 수")).toBeVisible();

    await clearSentMessages(presenterPage);
    await presenterPage.keyboard.press("ArrowRight");
    await expect(
      presenterPage.getByTestId("presenter-slide-surface").getByAltText("슬라이드 2")
    ).toBeVisible();

    const pageChange = await waitForSentMessage(
      presenterPage,
      (message) => message.destination === destinations.presenterPageChange(scenario.roomId)
    );
    expect(pageChange).toMatchObject({
      destination: destinations.presenterPageChange(scenario.roomId),
      body: {
        beforePage: 1,
        changedPage: 2,
      },
    });

    await openAudienceJoin(audiencePage);
    await expect(
      audiencePage.getByTestId("audience-slide-surface").getByAltText("슬라이드 2")
    ).toBeVisible();

    await audiencePage.getByLabel("발표자와 함께 보기").uncheck();
    await audiencePage.keyboard.press("ArrowLeft");
    await expect(
      audiencePage.getByTestId("audience-slide-surface").getByAltText("슬라이드 1")
    ).toBeVisible();

    await audiencePage.getByLabel("발표자와 함께 보기").check();
    await expect(
      audiencePage.getByTestId("audience-slide-surface").getByAltText("슬라이드 2")
    ).toBeVisible();

    await clearSentMessages(audiencePage);
    await audiencePage
      .getByPlaceholder("질문 내용을 작성해 주세요")
      .fill("질문을 다시 설명해 주세요.");
    await audiencePage.getByLabel("질문 제출").click();

    const questionCreate = await waitForSentMessage(
      audiencePage,
      (message) => message.destination === destinations.audienceQuestionCreate(scenario.roomId)
    );
    expect(questionCreate).toMatchObject({
      destination: destinations.audienceQuestionCreate(scenario.roomId),
    });

    await emitJson(presenterPage, destinations.presentationQuestionTopic(scenario.roomId), {
      id: "q-1",
      slide: 2,
      content: "질문을 다시 설명해 주세요.",
      ts: Date.now(),
    });
    await expect(presenterPage.getByText("질문을 다시 설명해 주세요.")).toBeVisible();

    await clearSentMessages(audiencePage);
    await audiencePage.getByAltText("이모티콘 1").click();
    await audiencePage
      .getByTestId("audience-slide-surface")
      .click({ position: { x: 120, y: 100 } });

    const reaction = await waitForSentMessage(audiencePage, (message) =>
      String(message.destination).includes("/reaction")
    );
    await emitJson(presenterPage, destinations.presentationReactionsTopic(scenario.roomId), {
      emoji: reaction.body.emoji,
      slide: reaction.body.slide,
      x: reaction.body.x,
      y: reaction.body.y,
      created_at: reaction.body.created_at,
    });
    await expect(presenterPage.getByAltText("reaction")).toBeVisible();

    await clearSentMessages(presenterPage);
    await presenterPage.getByLabel("실시간 질문").uncheck();

    const sentOption = await waitForSentMessage(
      presenterPage,
      (message) => message.destination === destinations.presenterOption(scenario.roomId)
    );
    await emitJson(audiencePage, destinations.presentationOptionTopic(scenario.roomId), {
      data: sentOption.body,
    });
    await expect(audiencePage.getByText("실시간 질문 기능이 잠겼습니다")).toBeVisible();

    await clearSentMessages(audiencePage);
    await audiencePage.getByLabel("발표자와 함께 보기").uncheck();
    await audiencePage.keyboard.press("ArrowLeft");
    await expect(
      audiencePage.getByTestId("audience-slide-surface").getByAltText("슬라이드 1")
    ).toBeVisible();

    await clearSentMessages(audiencePage);
    await clearSentMessages(presenterPage);
    await presenterPage.getByText("집중 유도").click();
    await waitForSentMessage(
      presenterPage,
      (message) => message.destination === destinations.presenterFocusOn(scenario.roomId)
    );

    await emitText(audiencePage, destinations.presentationFocusOnTopic(scenario.roomId), "2");
    await expect(audiencePage.getByLabel("발표자와 함께 보기")).toBeChecked();
    await expect(
      audiencePage.getByTestId("audience-slide-surface").getByAltText("슬라이드 2")
    ).toBeVisible();
    await expectNoSentMessage(
      audiencePage,
      (message) => message.destination === destinations.audiencePageChange(scenario.roomId)
    );

    await clearSentMessages(presenterPage);
    await presenterPage.getByRole("button", { name: "세션 종료" }).click();
    await expect(presenterPage).toHaveURL(/\/rooms\/room-1\/report$/);
    await waitForSentMessage(
      presenterPage,
      (message) => message.destination === destinations.presenterEnd(scenario.roomId)
    );

    await emitJson(audiencePage, destinations.publicTopic(scenario.roomId), {
      type: "SESSION_STATE",
      status: "ENDED",
    });
    await expect(audiencePage).toHaveURL(/\/audience\/ABCD\/rating$/);

    await audiencePage.getByAltText("5 star").click();
    await audiencePage
      .getByPlaceholder("여러분의 한 마디가 세션 진행자에게 큰 도움이 됩니다 :)")
      .fill("좋은 발표였습니다.");
    await audiencePage.getByRole("button", { name: "제출" }).click();
    await expect(audiencePage).toHaveURL(/\/$/);

    await presenterContext.close();
    await audienceContext.close();
  });
});
