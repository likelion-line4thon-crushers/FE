import { useEffect, useState } from "react";

const DEFAULT_STORAGE_KEY = "presentation_quick_settings";

export const DEFAULT_QUICK_SETTINGS = {
  sticker: true,
  question: true,
  feedback: true,
  unlock: true,
};

export const readQuickSettingsFromStorage = (
  storageKey = DEFAULT_STORAGE_KEY
) => {
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
    console.warn("[useQuickSettingsStorage] 저장된 빠른 설정 파싱 실패:", error);
    return { ...DEFAULT_QUICK_SETTINGS };
  }
};

export default function useQuickSettingsStorage(
  storageKey = DEFAULT_STORAGE_KEY
) {
  const [quickSettings, setQuickSettings] = useState(() =>
    readQuickSettingsFromStorage(storageKey)
  );

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(quickSettings));
    } catch (error) {
      console.warn(
        "[useQuickSettingsStorage] 빠른 설정 저장 실패:",
        storageKey,
        error
      );
    }
  }, [quickSettings, storageKey]);

  return [quickSettings, setQuickSettings];
}

