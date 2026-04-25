import { atom } from "jotai";

/** * Core room atoms — derived from URL params + API */
export const roomIdAtom = atom<string | null>(null);
export const deckIdAtom = atom<string | null>(null);
export const totalPagesAtom = atom<number>(0);
export const wsUrlAtom = atom<string | null>(null);
export const fileNameAtom = atom<string | null>(null);
export const pdfIdAtom = atom<string | null>(null);
// SSE 에서 한 번이라도 true 를 본 이후 sticky 하게 유지되는 플래그
export const canStartSessionAtom = atom<boolean>(false);
