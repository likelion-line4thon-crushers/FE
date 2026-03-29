import { atom } from "jotai";

/** * Audience-specific atoms */
export const audienceIdAtom = atom<string | null>(null);
export const audienceTokenAtom = atom<string | null>(null);
export const currentSlideAtom = atom<number>(0);
export const followPresenterAtom = atom<boolean>(true);
export const presenterPageAtom = atom<number>(0);
