import { atom } from "jotai";
import type { QuickSettings, UnlockSettings } from "./session";

/** * Session lifecycle atoms */
export const sessionStatusAtom = atom<string>("waiting");

export const quickSettingsAtom = atom<QuickSettings>({
  sticker: true,
  question: true,
  feedback: true,
  unlock: true,
});

export const unlockSettingsAtom = atom<UnlockSettings>({
  maxRevealedPage: null,
  revealAllSlides: false,
  totalPages: null,
  presenterPage: null,
});
