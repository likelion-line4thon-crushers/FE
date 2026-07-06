import { afterEach, describe, expect, test, vi } from "vitest";
import api from "@/shared/api/api";
import { saveSlideNoteKeepalive } from "@/shared/api/presentation";

describe("saveSlideNoteKeepalive", () => {
  const originalBaseUrl = api.defaults.baseURL;

  afterEach(() => {
    api.defaults.baseURL = originalBaseUrl;
    vi.restoreAllMocks();
  });

  test("sends a keepalive PUT with presenter auth", () => {
    api.defaults.baseURL = "https://api.example.test";
    const fetchMock = vi.fn(() => Promise.resolve(new Response(null, { status: 200 })));
    vi.stubGlobal("fetch", fetchMock);

    const sent = saveSlideNoteKeepalive({
      roomId: "room-1",
      deckId: "deck-1",
      page: 3,
      notes: "manual note",
      presenterToken: "presenter-token",
    });

    expect(sent).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/api/presentations/room-1/deck-1/notes/3",
      expect.objectContaining({
        method: "PUT",
        keepalive: true,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer presenter-token",
        },
        body: JSON.stringify({ notes: "manual note" }),
      })
    );
  });

  test("does not send without presenter token", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const sent = saveSlideNoteKeepalive({
      roomId: "room-1",
      deckId: "deck-1",
      page: 3,
      notes: "manual note",
      presenterToken: "",
    });

    expect(sent).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
