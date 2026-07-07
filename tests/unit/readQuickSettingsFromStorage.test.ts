import { describe, expect, it, beforeEach } from "vitest";
import {
  DEFAULT_QUICK_SETTINGS,
  readQuickSettingsFromStorage,
} from "@/entities/session/model/useQuickSettingsStorage";

describe("readQuickSettingsFromStorage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("parses persisted legacy string booleans for a room-scoped presenter session", () => {
    sessionStorage.setItem(
      "presentation_quick_settings_room-1",
      JSON.stringify({
        sticker: "false",
        question: "true",
        feedback: "false",
        unlock: "true",
      })
    );

    expect(readQuickSettingsFromStorage("presentation_quick_settings_room-1")).toEqual({
      sticker: false,
      question: true,
      feedback: false,
      unlock: true,
    });
  });

  it("falls back to defaults when storage is missing or malformed", () => {
    expect(readQuickSettingsFromStorage("presentation_quick_settings_missing")).toEqual(
      DEFAULT_QUICK_SETTINGS
    );

    sessionStorage.setItem("presentation_quick_settings_broken", "{");
    expect(readQuickSettingsFromStorage("presentation_quick_settings_broken")).toEqual(
      DEFAULT_QUICK_SETTINGS
    );
  });
});
