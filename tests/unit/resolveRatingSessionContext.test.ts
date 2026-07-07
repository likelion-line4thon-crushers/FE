import { beforeEach, describe, expect, it } from "vitest";
import { resolveRatingSessionContext } from "@/pages/rating/model/resolveRatingSessionContext";

describe("resolveRatingSessionContext", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("prefers route identity over audience storage when both exist", () => {
    sessionStorage.setItem(
      "boini_audience_ABCD",
      JSON.stringify({
        roomId: "room-storage",
        audienceId: "aud-storage",
        deckId: "deck-storage",
      })
    );

    expect(
      resolveRatingSessionContext("ABCD", {
        roomId: "room-route",
        audienceId: "aud-route",
        deckId: "deck-route",
      })
    ).toEqual({
      roomId: "room-route",
      audienceId: "aud-route",
      deckId: "deck-route",
      hasIdentity: true,
      identitySource: "route",
    });
  });

  it("never falls back to presenter storage when audience identity is missing", () => {
    sessionStorage.setItem(
      "boini_room",
      JSON.stringify({
        roomId: "presenter-room",
        audienceId: "wrong-audience",
        deckId: "presenter-deck",
      })
    );

    expect(resolveRatingSessionContext("MISSING")).toEqual({
      roomId: null,
      audienceId: null,
      deckId: null,
      hasIdentity: false,
      identitySource: "missing",
    });
  });
});
