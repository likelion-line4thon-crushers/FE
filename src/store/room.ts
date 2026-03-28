import { atom } from "jotai";

/** * Core room atoms — derived from URL params + API */
export const roomIdAtom = atom<string | null>(null);
export const deckIdAtom = atom<string | null>(null);
export const totalPagesAtom = atom<number>(0);
export const wsUrlAtom = atom<string | null>(null);
export const fileNameAtom = atom<string | null>(null);
