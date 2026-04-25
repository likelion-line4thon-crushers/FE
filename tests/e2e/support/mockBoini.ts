import { expect, type BrowserContext, type Page } from "@playwright/test";
import { storageKeys } from "@/shared/config/storage-keys";

export type BoiniScenario = {
  roomId: string;
  deckId: string;
  code: string;
  presenterToken: string;
  audienceId: string;
  audienceToken: string;
  totalPages: number;
  wsBaseUrl: string;
  fileName: string;
  pdfId: string;
};

type InstallApiMocksOptions = {
  joinStatus?: string;
  joinCurrentPage?: number;
  joinMaxPage?: number;
  joinSlideUnlock?: boolean;
  roomInfoStatus?: string;
  roomInfoCurrentPage?: number;
  roomInfoMaxPage?: number;
  roomInfoSlideUnlock?: boolean;
  scenario?: Partial<BoiniScenario>;
};

type SeedPresenterSessionOptions = {
  scenario?: Partial<BoiniScenario>;
  quickSettings?: {
    sticker: boolean;
    question: boolean;
    feedback: boolean;
    unlock: boolean;
  };
};

const svgDataUrl = (label: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><rect width="100%" height="100%" fill="#f6f6f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="72" fill="#333">${label}</text></svg>`
  )}`;

export const defaultScenario: BoiniScenario = {
  roomId: "room-1",
  deckId: "deck-1",
  code: "ABCD",
  presenterToken: "presenter-token",
  audienceId: "aud-1",
  audienceToken: "aud-token",
  totalPages: 3,
  wsBaseUrl: "http://127.0.0.1:5174",
  fileName: "demo.pdf",
  pdfId: "pdf-test-1",
};

const resolveScenario = (scenario?: Partial<BoiniScenario>): BoiniScenario => ({
  ...defaultScenario,
  ...scenario,
});

const audienceStorageKey = (code: string) => `boini_audience_${code}`;

const getPageHelper = async <T>(page: Page, reader: () => T) => page.evaluate(reader as () => T);

export const installMockWebSocket = async (context: BrowserContext) => {
  await context.addInitScript(() => {
    type SubscriptionEntry = {
      destination: string;
      kind: "json" | "text";
      callback: (payload: unknown) => void;
    };

    const subscribers = new Map<string, SubscriptionEntry[]>();
    const connected = new Set<string>();
    const sentMessages: Array<{
      serviceId: string;
      destination: string;
      headers?: Record<string, string>;
      body: unknown;
    }> = [];

    const pushSubscriber = (serviceId: string, entry: SubscriptionEntry) => {
      const list = subscribers.get(serviceId) ?? [];
      list.push(entry);
      subscribers.set(serviceId, list);
    };

    const removeSubscriber = (
      serviceId: string,
      destination: string,
      callback: SubscriptionEntry["callback"]
    ) => {
      const list = subscribers.get(serviceId) ?? [];
      subscribers.set(
        serviceId,
        list.filter((item) => item.destination !== destination || item.callback !== callback)
      );
    };

    window.__BOINI_TEST_MODE__ = true;
    window.__BOINI_TEST_WS__ = {
      connect: ({ serviceId, onConnect }) => {
        connected.add(serviceId);
        queueMicrotask(() => onConnect?.({} as never));
      },
      disconnect: (serviceId) => {
        connected.delete(serviceId);
        subscribers.delete(serviceId);
      },
      subscribe: ({ serviceId, destination, kind, callback }) => {
        const entry = { destination, kind, callback };
        pushSubscriber(serviceId, entry);
        return () => removeSubscriber(serviceId, destination, callback);
      },
      publish: ({ serviceId, destination, headers, body }) => {
        sentMessages.push({ serviceId, destination, headers, body });
      },
      isConnected: (serviceId) => connected.has(serviceId),
    };

    (
      window as typeof window & {
        __boiniTestWs?: {
          emitJson: (destination: string, payload: unknown) => void;
          emitText: (destination: string, payload: string) => void;
          getSentMessages: () => Array<{
            serviceId: string;
            destination: string;
            headers?: Record<string, string>;
            body: unknown;
          }>;
          clearSentMessages: () => void;
        };
      }
    ).__boiniTestWs = {
      emitJson: (destination, payload) => {
        subscribers.forEach((entries) => {
          entries
            .filter((entry) => entry.destination === destination && entry.kind === "json")
            .forEach((entry) => entry.callback(payload));
        });
      },
      emitText: (destination, payload) => {
        subscribers.forEach((entries) => {
          entries
            .filter((entry) => entry.destination === destination && entry.kind === "text")
            .forEach((entry) => entry.callback(payload));
        });
      },
      getSentMessages: () => [...sentMessages],
      clearSentMessages: () => {
        sentMessages.length = 0;
      },
    };
  });
};

export const installApiMocks = async (
  context: BrowserContext,
  {
    joinStatus = "live",
    joinCurrentPage = 2,
    joinMaxPage = 2,
    joinSlideUnlock = true,
    roomInfoStatus = "live",
    roomInfoCurrentPage = 2,
    roomInfoMaxPage = 2,
    roomInfoSlideUnlock = true,
    scenario,
  }: InstallApiMocksOptions = {}
) => {
  const resolvedScenario = resolveScenario(scenario);

  await context.route("**/*", async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    const { roomId, deckId, code, audienceId, audienceToken, totalPages, wsBaseUrl, pdfId } =
      resolvedScenario;

    if (url.includes(`/api/rooms/${roomId}/session/start`) && method === "POST") {
      await route.fulfill({ json: { data: { started: true } } });
      return;
    }

    if (url.includes(`/api/rooms/close/${roomId}`) && method === "DELETE") {
      await route.fulfill({ json: { data: { closed: true } } });
      return;
    }

    if (url.includes(`/api/rooms/join/${code}`) && method === "GET") {
      await route.fulfill({
        json: {
          data: {
            roomId,
            audienceId,
            audienceToken,
            deckId,
            totalPages,
            sessionStatus: joinStatus,
            currentPage: joinCurrentPage,
            sticker: true,
            question: true,
            feedback: true,
            maxPage: joinMaxPage,
            slideUnlock: joinSlideUnlock,
            wsUrl: `${wsBaseUrl}/ws/audience`,
          },
        },
      });
      return;
    }

    if (url.includes(`/api/roomAudience/rooms/${roomId}/info`) && method === "POST") {
      await route.fulfill({
        json: {
          data: {
            currentPage: roomInfoCurrentPage,
            sessionStatus: roomInfoStatus,
            sticker: true,
            question: true,
            feedback: true,
            maxPage: roomInfoMaxPage,
            slideUnlock: roomInfoSlideUnlock,
            totalPages,
          },
        },
      });
      return;
    }

    if (url.includes(`/api/questions/rooms/${roomId}`) && method === "GET") {
      await route.fulfill({ json: { data: [] } });
      return;
    }

    if (url.includes(`/api/stickers/${roomId}/all`) && method === "GET") {
      await route.fulfill({ json: { data: [] } });
      return;
    }

    if (url.includes(`/api/stickers/${roomId}/audience/${audienceId}`) && method === "GET") {
      await route.fulfill({ json: { data: [] } });
      return;
    }

    if (url.includes(`/api/feedbacks/rooms/${roomId}/feedbacks`) && method === "POST") {
      await route.fulfill({ json: { data: { saved: true } } });
      return;
    }

    if (url.includes(`/api/aiReport/${roomId}/mostRevisit`) && method === "GET") {
      await route.fulfill({
        json: {
          data: {
            page: 2,
            description: "질문이 다시 몰린 슬라이드",
          },
        },
      });
      return;
    }

    if (url.includes(`/api/aiReport/${roomId}/getReport/top`) && method === "GET") {
      await route.fulfill({ json: { data: {} } });
      return;
    }

    if (url.includes(`/api/aiReport/${roomId}`) && method === "GET") {
      await route.fulfill({
        json: {
          data: {
            totalParticipants: 1,
            totalQuestions: 1,
            mostReaction: [],
          },
        },
      });
      return;
    }

    if (url.includes(`/report/${roomId}/top-slide`) && method === "GET") {
      await route.fulfill({ json: { data: { slideNumber: 2 } } });
      return;
    }

    if (url.includes(`/report/questions/rooms/${roomId}/top3`) && method === "GET") {
      await route.fulfill({ json: { data: [] } });
      return;
    }

    if (url.includes(`/api/presentations/${roomId}/${deckId}/pages/`) && method === "GET") {
      const match = url.match(/pages\/(\d+)/);
      const pageNumber = match ? Number(match[1]) : 1;
      await route.fulfill({
        json: {
          data: {
            originalUrl: svgDataUrl(`Slide ${pageNumber}`),
          },
        },
      });
      return;
    }

    if (url.includes(`/api/presentations/${roomId}/${deckId}/meta`) && method === "GET") {
      const pages = Array.from({ length: totalPages }, (_, i) => ({
        page: i + 1,
        url: svgDataUrl(`Slide ${i + 1}`),
      }));
      await route.fulfill({ json: { success: true, data: { pages } } });
      return;
    }

    if (url.endsWith("/api/upload/chunk") && method === "POST") {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "ok",
          data: {
            status: "READY",
            uploadId: "u-1",
            pdfId,
            fileName: resolvedScenario.fileName,
            totalPages,
            streamUrl: `/api/pdf/${pdfId}/stream`,
          },
        }),
      });
      return;
    }

    if (url.includes(`/api/pdf/${pdfId}/stream`) && method === "GET") {
      // SSE 본문: page 이벤트 N개 + complete 이벤트.
      // 총 페이지가 10 미만이면 마지막 page 이벤트에 canStartSession: true.
      const threshold = Math.min(10, totalPages);
      const lines: string[] = [];
      for (let i = 0; i < totalPages; i++) {
        const payload = {
          pdfId,
          pageIndex: i,
          totalPages,
          imageUrl: svgDataUrl(`Slide ${i + 1}`),
          format: "webp",
          width: 1600,
          height: 900,
          canStartSession: i === threshold - 1,
        };
        lines.push(`event: page\ndata: ${JSON.stringify(payload)}\n\n`);
      }
      lines.push(
        `event: complete\ndata: ${JSON.stringify({ pdfId, totalPages, status: "DONE" })}\n\n`
      );
      await route.fulfill({
        status: 200,
        contentType: "text/event-stream",
        headers: { "cache-control": "no-cache", connection: "keep-alive" },
        body: lines.join(""),
      });
      return;
    }

    await route.continue();
  });
};

export const seedPresenterSession = async (
  page: Page,
  { scenario, quickSettings }: SeedPresenterSessionOptions = {}
) => {
  const resolvedScenario = resolveScenario(scenario);
  const quickSettingsKey = storageKeys.quickSettings(resolvedScenario.roomId);

  await page.goto("/");
  await page.evaluate(
    ([nextScenario, nextQuickSettings, nextQuickSettingsKey]) => {
      sessionStorage.setItem(
        "boini_room",
        JSON.stringify({
          roomId: nextScenario.roomId,
          deckId: nextScenario.deckId,
          presenterToken: nextScenario.presenterToken,
          wsUrl: `${nextScenario.wsBaseUrl}/ws/presenter`,
          totalPages: nextScenario.totalPages,
          joinUrl: `${nextScenario.wsBaseUrl}/join/${nextScenario.code}`,
          fileName: nextScenario.fileName,
          pdfId: nextScenario.pdfId,
          canStartSession: true,
        })
      );

      if (nextQuickSettings) {
        sessionStorage.setItem(nextQuickSettingsKey, JSON.stringify(nextQuickSettings));
      }
    },
    [resolvedScenario, quickSettings ?? null, quickSettingsKey] as const
  );
};

export const seedAudienceSession = async (page: Page, scenario?: Partial<BoiniScenario>) => {
  const resolvedScenario = resolveScenario(scenario);

  await page.goto("/");
  await page.evaluate(
    ([nextScenario]) => {
      sessionStorage.setItem(
        `boini_audience_${nextScenario.code}`,
        JSON.stringify({
          roomId: nextScenario.roomId,
          audienceId: nextScenario.audienceId,
          audienceToken: nextScenario.audienceToken,
          deckId: nextScenario.deckId,
          currentPage: 2,
          sessionStatus: "ENDED",
        })
      );
    },
    [resolvedScenario] as const
  );
};

export const getSentMessages = async (page: Page) =>
  getPageHelper(page, () => {
    const helper = (
      window as typeof window & {
        __boiniTestWs?: { getSentMessages: () => unknown[] };
      }
    ).__boiniTestWs;
    return helper?.getSentMessages() ?? [];
  });

export const clearSentMessages = async (page: Page) =>
  getPageHelper(page, () => {
    const helper = (
      window as typeof window & {
        __boiniTestWs?: { clearSentMessages: () => void };
      }
    ).__boiniTestWs;
    helper?.clearSentMessages();
  });

export const emitJson = async (page: Page, destination: string, payload: unknown) =>
  page.evaluate(
    ([targetDestination, targetPayload]) => {
      const helper = (
        window as typeof window & {
          __boiniTestWs?: {
            emitJson: (destination: string, payload: unknown) => void;
          };
        }
      ).__boiniTestWs;
      helper?.emitJson(targetDestination, targetPayload);
    },
    [destination, payload] as const
  );

export const emitText = async (page: Page, destination: string, payload: string) =>
  page.evaluate(
    ([targetDestination, targetPayload]) => {
      const helper = (
        window as typeof window & {
          __boiniTestWs?: {
            emitText: (destination: string, payload: string) => void;
          };
        }
      ).__boiniTestWs;
      helper?.emitText(targetDestination, targetPayload);
    },
    [destination, payload] as const
  );

export const waitForSentMessage = async (page: Page, predicate: (message: any) => boolean) => {
  await expect
    .poll(async () => {
      const messages = await getSentMessages(page);
      return messages.find(predicate) ?? null;
    })
    .not.toBeNull();

  const messages = await getSentMessages(page);
  return messages.find(predicate);
};

export const expectNoSentMessage = async (page: Page, predicate: (message: any) => boolean) => {
  await expect
    .poll(async () => {
      const messages = await getSentMessages(page);
      return messages.some(predicate);
    })
    .toBe(false);
};

export const destinations = {
  presenterPageChange: (roomId: string) => `/app/presentation/${roomId}/pageChange/presenter`,
  audiencePageChange: (roomId: string) => `/app/presentation/${roomId}/pageChange/audience`,
  presenterOption: (roomId: string) => `/app/presentation/${roomId}/option`,
  presenterFocusOn: (roomId: string) => `/app/presentation/${roomId}/focusOn`,
  presenterEnd: (roomId: string) => `/app/presentation/${roomId}/end`,
  audienceQuestionCreate: (roomId: string) => `/app/p/${roomId}/question.create`,
  presentationQuestionTopic: (roomId: string) => `/topic/presentation/${roomId}/question`,
  presentationReactionsTopic: (roomId: string) => `/topic/presentation/${roomId}/reactions`,
  presentationOptionTopic: (roomId: string) => `/topic/presentation/${roomId}/option`,
  presentationFocusOnTopic: (roomId: string) => `/topic/presentation/${roomId}/focusOn`,
  presentationPageChangeTopic: (roomId: string) => `/topic/presentation/${roomId}/pageChange`,
  publicTopic: (roomId: string) => `/topic/p/${roomId}/public`,
  unlockTopic: (roomId: string) => `/topic/presentation/${roomId}/option/unlock`,
};

export const openPresenterPrepare = async (page: Page, scenario?: Partial<BoiniScenario>) => {
  const resolvedScenario = resolveScenario(scenario);
  await page.goto(`/rooms/${resolvedScenario.roomId}/prepare`);
  return resolvedScenario;
};

export const openPresenterLive = async (page: Page, scenario?: Partial<BoiniScenario>) => {
  const resolvedScenario = resolveScenario(scenario);
  await page.goto(`/rooms/${resolvedScenario.roomId}/present`);
  return resolvedScenario;
};

export const openAudienceJoin = async (page: Page, scenario?: Partial<BoiniScenario>) => {
  const resolvedScenario = resolveScenario(scenario);
  await page.goto(`/join/${resolvedScenario.code}`);
  return resolvedScenario;
};

export const audienceStorageKeys = {
  byCode: audienceStorageKey,
};
