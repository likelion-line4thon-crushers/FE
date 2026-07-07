import React, { useEffect } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { Provider, createStore } from "jotai";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";
import useQuickSettingsStorage from "@/entities/session/model/useQuickSettingsStorage";

const HookHarness = ({
  storageKey,
  onValue,
}: {
  storageKey: string;
  onValue?: (value: unknown) => void;
}) => {
  const [value] = useQuickSettingsStorage(storageKey);

  useEffect(() => {
    onValue?.(value);
  }, [onValue, value]);

  return null;
};

describe("useQuickSettingsStorage", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    sessionStorage.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  it("does not overwrite persisted room settings with defaults during initial hydration", async () => {
    sessionStorage.setItem(
      "presentation_quick_settings_room-1",
      JSON.stringify({
        sticker: false,
        question: false,
        feedback: true,
        unlock: false,
      })
    );

    await act(async () => {
      root.render(
        <Provider store={createStore()}>
          <HookHarness storageKey="presentation_quick_settings_room-1" />
        </Provider>
      );
    });

    expect(
      JSON.parse(sessionStorage.getItem("presentation_quick_settings_room-1") || "{}")
    ).toEqual({
      sticker: false,
      question: false,
      feedback: true,
      unlock: false,
    });
  });

  it("switches between room-scoped keys without leaking the previous room state", async () => {
    const observedValues: Array<unknown> = [];

    sessionStorage.setItem(
      "presentation_quick_settings_room-1",
      JSON.stringify({
        sticker: false,
        question: false,
        feedback: true,
        unlock: false,
      })
    );
    sessionStorage.setItem(
      "presentation_quick_settings_room-2",
      JSON.stringify({
        sticker: true,
        question: true,
        feedback: false,
        unlock: true,
      })
    );

    await act(async () => {
      root.render(
        <Provider store={createStore()}>
          <HookHarness
            storageKey="presentation_quick_settings_room-1"
            onValue={(value) => observedValues.push(value)}
          />
        </Provider>
      );
    });

    expect(observedValues.at(-1)).toEqual({
      sticker: false,
      question: false,
      feedback: true,
      unlock: false,
    });

    await act(async () => {
      root.render(
        <Provider store={createStore()}>
          <HookHarness
            storageKey="presentation_quick_settings_room-2"
            onValue={(value) => observedValues.push(value)}
          />
        </Provider>
      );
    });

    expect(observedValues.at(-1)).toEqual({
      sticker: true,
      question: true,
      feedback: false,
      unlock: true,
    });
  });
});
