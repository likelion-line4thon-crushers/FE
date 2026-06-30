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

/**
 * 발표자 방의 현재 모드. URL(/prepare·/present) 대신 이 값으로 준비/발표 화면을 가른다.
 * PresenterRoomGate 가 세션 상태를 기준으로 설정하고, AppHeader 가 버튼/표시를 결정한다.
 */
export type PresenterMode = "loading" | "prepare" | "present";
// 기본값은 loading: 판정 전에는 어떤 화면도 띄우지 않는다(섣부른 마운트/부수효과 방지).
export const presenterModeAtom = atom<PresenterMode>("loading");
