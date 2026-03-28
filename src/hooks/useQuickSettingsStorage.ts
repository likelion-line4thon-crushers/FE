import { useEffect } from "react";
import { useAtom } from "jotai";
import { quickSettingsAtom } from "../store";
import type { QuickSettings } from "../types";

const DEFAULT_STORAGE_KEY = "presentation_quick_settings";

export const DEFAULT_QUICK_SETTINGS: QuickSettings = {
  sticker: true,
  question: true,
  feedback: true,
  unlock: true,
};

export const readQuickSettingsFromStorage = (
  storageKey = DEFAULT_STORAGE_KEY
): QuickSettings => {
  try {
    const stored = sessionStorage.getItem(storageKey);
    if (!stored) {
      return { ...DEFAULT_QUICK_SETTINGS };
    }

    const parsed = JSON.parse(stored);
    return {
      sticker:
        typeof parsed.sticker === "boolean"
          ? parsed.sticker
          : parsed.sticker === "true",
      question:
        typeof parsed.question === "boolean"
          ? parsed.question
          : parsed.question === "true",
      feedback:
        typeof parsed.feedback === "boolean"
          ? parsed.feedback
          : parsed.feedback === "true",
      unlock:
        typeof parsed.unlock === "boolean"
          ? parsed.unlock
          : parsed.unlock === "true",
    };
  } catch (error) {
    return { ...DEFAULT_QUICK_SETTINGS };
  }
};

export default function useQuickSettingsStorage(
  storageKey = DEFAULT_STORAGE_KEY
) {
  const [quickSettings, setQuickSettings] = useAtom(quickSettingsAtom);

  useEffect(() => {
    setQuickSettings(readQuickSettingsFromStorage(storageKey));
  }, [setQuickSettings, storageKey]);

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(quickSettings));
    } catch (_error) {
      // ignore session storage write errors
    }
  }, [quickSettings, storageKey]);

  return [quickSettings, setQuickSettings];
}
