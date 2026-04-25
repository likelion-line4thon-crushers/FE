import { beforeEach, describe, expect, it } from "vitest";
import { resolvePresenterRoomData } from "@/pages/session-create/model/resolvePresenterRoomData";

describe("resolvePresenterRoomData", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("restores a presenter room synchronously from storage when the route room matches", () => {
    sessionStorage.setItem(
      "boini_room",
      JSON.stringify({
        roomId: "room-1",
        deckId: "deck-1",
        presenterToken: "token-1",
      })
    );

    expect(resolvePresenterRoomData("room-1", null)).toEqual({
      roomId: "room-1",
      deckId: "deck-1",
      presenterToken: "token-1",
    });
  });

  it("accepts numeric stored room ids when the route param matches as a string", () => {
    sessionStorage.setItem(
      "boini_room",
      JSON.stringify({
        roomId: 42,
        deckId: "deck-42",
      })
    );

    expect(resolvePresenterRoomData("42", null)).toEqual({
      roomId: 42,
      deckId: "deck-42",
    });
  });

  it("returns null for /rooms/new (no roomIdParam) even if sessionStorage has stale data", () => {
    sessionStorage.setItem(
      "boini_room",
      JSON.stringify({
        roomId: "stale-room",
        deckId: "stale-deck",
        canStartSession: true,
        totalPages: 20,
      })
    );

    expect(resolvePresenterRoomData(undefined, { pdfFile: {} as File })).toBeNull();
  });

  it("prefers explicit route state room data over storage", () => {
    sessionStorage.setItem(
      "boini_room",
      JSON.stringify({
        roomId: "room-storage",
        deckId: "deck-storage",
      })
    );

    expect(
      resolvePresenterRoomData("room-route", {
        roomData: {
          roomId: "room-route",
          deckId: "deck-route",
        },
      })
    ).toEqual({
      roomId: "room-route",
      deckId: "deck-route",
    });
  });
});
