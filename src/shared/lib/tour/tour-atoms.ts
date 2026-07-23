import { atom } from "jotai";
import type { TourSurface } from "./types";

/** 헤더 "가이드" 버튼이 현재 서페이스 투어 재생을 요청할 때 이 값을 세팅한다. */
export const tourReplayRequestAtom = atom<TourSurface | null>(null);
