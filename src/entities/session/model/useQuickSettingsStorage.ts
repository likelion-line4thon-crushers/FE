import { useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { quickSettingsAtom } from "./store";
import type { QuickSettings } from "./session";
import { STORAGE_KEYS } from "@/shared/config/storage-keys";

const DEFAULT_STORAGE_KEY: string = STORAGE_KEYS.QUICK_SETTINGS;

export const DEFAULT_QUICK_SETTINGS: QuickSettings = {
  sticker: true,
  question: true,
  feedback: true,
  unlock: true,
};

export const readQuickSettingsFromStorage = (
  storageKey: string = DEFAULT_STORAGE_KEY
): QuickSettings => {
  try {
    const stored = sessionStorage.getItem(storageKey);
    if (!stored) {
      return { ...DEFAULT_QUICK_SETTINGS };
    }

    const parsed = JSON.parse(stored);
    return {
      sticker: typeof parsed.sticker === "boolean" ? parsed.sticker : parsed.sticker === "true",
      question: typeof parsed.question === "boolean" ? parsed.question : parsed.question === "true",
      feedback: typeof parsed.feedback === "boolean" ? parsed.feedback : parsed.feedback === "true",
      unlock: typeof parsed.unlock === "boolean" ? parsed.unlock : parsed.unlock === "true",
    };
  } catch (error) {
    return { ...DEFAULT_QUICK_SETTINGS };
  }
};

export default function useQuickSettingsStorage(storageKey: string | null = DEFAULT_STORAGE_KEY) {
  const [quickSettings, setQuickSettings] = useAtom(quickSettingsAtom);
  const resolvedStorageKey = storageKey ?? null;
  const previousStorageKeyRef = useRef<string | null>(null);
  const hasInitializedWithoutKeyRef = useRef(false);
  const skipNextWriteRef = useRef(false);

  useEffect(() => {
    if (!resolvedStorageKey) {
      if (!hasInitializedWithoutKeyRef.current) {
        setQuickSettings({ ...DEFAULT_QUICK_SETTINGS });
        hasInitializedWithoutKeyRef.current = true;
        skipNextWriteRef.current = true;
      }
      return;
    }

    const stored = readQuickSettingsFromStorage(resolvedStorageKey);
    const hasStoredValue = sessionStorage.getItem(resolvedStorageKey) != null;
    const previousStorageKey = previousStorageKeyRef.current;
    skipNextWriteRef.current = true;

    if (hasStoredValue) {
      setQuickSettings(stored);
    } else if (previousStorageKey !== null && previousStorageKey !== resolvedStorageKey) {
      setQuickSettings({ ...DEFAULT_QUICK_SETTINGS });
    }

    previousStorageKeyRef.current = resolvedStorageKey;
    hasInitializedWithoutKeyRef.current = false;
  }, [setQuickSettings, resolvedStorageKey]);

  useEffect(() => {
    if (!resolvedStorageKey) {
      return;
    }

    if (skipNextWriteRef.current) {
      skipNextWriteRef.current = false;
      return;
    }

    try {
      sessionStorage.setItem(resolvedStorageKey, JSON.stringify(quickSettings));
    } catch (_error) {
      // ignore session storage write errors
    }
  }, [quickSettings, resolvedStorageKey]);

  return [quickSettings, setQuickSettings];
}
